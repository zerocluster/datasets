import Base from "#core/app/prototypes/base";
import Read from "#core/app/prototypes/mixins/read";
import sql from "#core/sql";
import CacheLru from "#core/cache/lru";
import fetch from "#core/fetch";
import datasets from "#lib/datasets";
import Mutex from "#core/threads/mutex";
import getOsmRandomCoordinates from "#lib/get-osm-random-coordinates";
import GoogleMapsApi from "@softvisio/api/google/maps";
import Cache from "#core/cache/persistent";
import resources from "#lib/resources";
import { pathToFileURL } from "url";

const gmapsCache = await Cache.new( pathToFileURL( resources.location + "/google-maps.cache.sqlite" ), { "maxSize": 10_000 } );
const gmaps = new GoogleMapsApi( process.env.APP_GOOGLE_API_KEY, { "cache": gmapsCache } );

const MutexSet = new Mutex.Set();
const OSM_MUTEX = new Mutex();
const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "getGeotarget": sql`SELECT * FROM geotarget WHERE id = ? OR canonical_name = ? OR ( type = 'country' AND country = ? )`.prepare(),
    "getOsm": sql`SELECT id, updated, center, bbox FROM osm WHERE id = ?`.prepare(),
    "getOsmGeojson": sql`SELECT id, updated, center, bbox, geojson FROM osm WHERE id = ?`.prepare(),
    "insertOsm": sql`
INSERT INTO osm
( id, updated, class, type, display_name, center, bbox, geojson )
VALUES
( ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ? )
ON CONFLICT ( id ) DO UPDATE SET updated = CURRENT_TIMESTAMP, class = ?, type = ?, display_name = ?, center = ?, bbox = ?, geojson = ?
`.prepare(),
    "deleteOsm": sql`DELETE FROM osm WHERE id = ?`.prepare(),
    "deleteOsmTriangles": sql`DELETE FROM osm_triangle WHERE geotarget_id = ?`.prepare(),
};

var dbhGeoTargets = await datasets.dbh( "geotargets" ),
    dbhCache = await datasets.cache();

const OSM_TYPE = {
    "city": "city",
    "country": "country",
    "county": "county",
    "postal code": "postalcode",
    "state": "state",
};

export default class extends Read( Base ) {
    constructor ( api ) {
        super( api );

        // set update listener
        datasets.on( "update", async dataset => {
            if ( dataset === "geotargets" ) {
                dbhGeoTargets = await datasets.dbh( "geotargets" );

                CACHE.clear();
            }
        } );
    }

    async API_getGeotarget ( ctx, id, options = {} ) {
        id = ( id + "" ).toUpperCase();

        var geotarget = CACHE.get( id );

        if ( !geotarget ) {
            geotarget = dbhGeoTargets.selectRow( QUERIES.getGeotarget, [id, id, id] );

            CACHE.set( id, geotarget );
        }

        // not found
        if ( !geotarget.data ) return geotarget;

        // geocode
        if ( options.geocode ) {
            const data = { ...geotarget.data };

            const geocode = await gmaps.geocode( data.canonical_name );

            data.geocode = geocode.data?.[0];

            return result( 200, data );
        }

        // no additional options required or type is not supported
        if ( !geotarget.data || !options || !OSM_TYPE[geotarget.data.type] ) return geotarget;

        var osm;

        if ( options.geojson ) osm = dbhCache.selectRow( QUERIES.getOsmGeojson, [geotarget.data.id] );
        else osm = dbhCache.selectRow( QUERIES.getOsm, [geotarget.data.id] );

        if ( !osm.data ) {
            osm = await this.#fetchOsm( geotarget.data );
            if ( !osm.ok ) return osm;
        }

        const data = { ...geotarget.data };

        if ( options.center ) data.center = osm.data.center;
        if ( options.bbox ) data.bbox = osm.data.bbox;
        if ( options.geojson ) data.geojson = osm.data.geojson;

        if ( options.random_coordinates || options.random_point ) {
            const randomCoordinates = getOsmRandomCoordinates( geotarget.data.id );

            if ( randomCoordinates ) {
                if ( options.random_coordinates ) data.random_coordinates = randomCoordinates;

                if ( options.random_point ) {
                    data.random_point = {
                        "type": "Point",
                        "coordinates": [randomCoordinates.longitude, randomCoordinates.latitude],
                    };
                }
            }
        }

        return result( 200, data, { "cache-control-no-cache": true } );
    }

    async API_suggestGeotargets ( ctx, options ) {
        const mainQuery = sql`SELECT * FROM geotarget`.WHERE( options.where );

        return this._read( ctx, mainQuery, { options, "dbh": dbhGeoTargets } );
    }

    // private
    async #fetchOsm ( geotarget ) {
        const mutex = MutexSet.get( geotarget.id );

        if ( !mutex.tryDown() ) return await mutex.signal.wait();

        var res;

        try {
            const osmType = OSM_TYPE[geotarget.type];

            let q = "country=" + geotarget.country;
            if ( osmType !== "country" ) q += "&" + osmType + "=" + geotarget.name;

            res = await this.#osmRequest( `https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&${q}` );

            // osm not found
            if ( !res.ok ) throw res;

            const osm = res.data,
                osmFound = !!osm,
                osmData = {};

            // osm not found
            if ( !osmFound ) {

                // remove triangles
                await dbhCache.do( QUERIES.deleteOsmTriangles, [geotarget.id] );
            }

            // osm found
            else {
                osmData.class = osm.class;
                osmData.type = osm.type;
                osmData.display_name = osm.display_name;
                osmData.center = { "longitude": +osm.lon, "latitude": +osm.lat };
                osmData.bbox = [+osm.boundingbox[2], +osm.boundingbox[0], +osm.boundingbox[3], +osm.boundingbox[1]]; // minX, minY, maxX, maxY
                osmData.geojson = osm.geojson;
            }

            // insert / update geodata
            res = dbhCache.do( QUERIES.insertOsm, [geotarget.id, osmData.class, osmData.type, osmData.display_name, osmData.center, osmData.bbox, osmData.geojson, osmData.class, osmData.type, osmData.display_name, osmData.center, osmData.bbox, osmData.geojson] );
            if ( !res.ok ) throw res;

            // triangulate
            if ( osmFound && ( osmData.geojson.type === "MultiPolygon" || osmData.geojson.type === "Polygon" ) ) {
                res = await this.app.threads.call( "worker", "triangulate", geotarget.id );

                // triangulation failed
                if ( !res.ok ) {
                    dbhCache.do( QUERIES.deleteOsm, [geotarget.id] );

                    throw res;
                }
            }

            res = result( 200, osmData );
        }
        catch ( e ) {
            res = result.catch( e );
        }

        mutex.signal.broadcast( res );

        MutexSet.delete( mutex );

        return res;
    }

    async #osmRequest ( url ) {
        await OSM_MUTEX.down();

        var res;

        while ( 1 ) {
            res = await fetch( url );

            console.log( "osm:", res + "", url );

            if ( !res.ok ) {
                if ( res.status === 502 ) continue;

                break;
            }

            const json = await res.json();

            res = result( 200, json[0] );

            break;
        }

        OSM_MUTEX.up();

        return res;
    }
}
