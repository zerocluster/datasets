import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache-lru";
import fetch from "#core/fetch";
import datasets from "#lib/datasets";
import Mutex from "#core/threads/mutex";
import getGeoTargetRandomCoordinates from "#lib/get-geotarget-random-coordinates";

const MutexSet = new Mutex.Set();
const OSM_MUTEX = new Mutex();
const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM geotarget WHERE id = ? OR canonical_name LIKE ? OR ( type = 'country' AND country = ? ) OR name LIKE ?`.prepare(),
    "get_geodata": sql`SELECT * FROM geotarget WHERE id = ?`.prepare(),
    "insert_geodata": sql`INSERT INTO geotarget ( id, updated, center, bbox, polygon ) VALUES ( ?, CURRENT_TIMESTAMP, ?, ?, ? ) ON CONFLICT ( id ) DO UPDATE SET updated = CURRENT_TIMESTAMP, center = ?, bbox = ?, polygon = ?`.prepare(),
    "delete_geodata": sql`DELETE FROM geotarget WHERE id = ?`.prepare(),
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

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        datasets.on( "update", async dataset => {
            if ( dataset === "geotargets" ) {
                dbhGeoTargets = await datasets.dbh( "geotargets" );

                CACHE.reset();
            }
        } );
    }

    // XXX do somethinf with the not found or empty responses
    async API_get ( ctx, id, options ) {
        id = ( id + "" ).toUpperCase();

        var geotarget = CACHE.get( id );

        if ( !geotarget ) {
            geotarget = dbhGeoTargets.selectRow( QUERIES.get, [id, id, id, id] );

            CACHE.set( id, geotarget );
        }

        // not found or no additional options required or type is not supported
        if ( !geotarget.data || !options || !OSM_TYPE[geotarget.data.type] ) return geotarget;

        var geodata = dbhCache.selectRow( QUERIES.get_geodata, [geotarget.data.id] );

        // XXX detect non found
        if ( !geodata.data ) {
            const res = await this.#fetchGeoData( geotarget.data );
            if ( !res.ok ) return res;

            geodata = dbhCache.selectRow( QUERIES.get_geodata, [geotarget.data.id] );
        }

        const data = { ...geotarget.data };

        if ( options.center ) data.center = geodata.data.center;
        if ( options.bbox ) data.bbox = geodata.data.bbox;
        if ( options.polygon ) data.polygon = geodata.data.polygon;
        if ( options.random_coordinates || options.random_point ) {
            const randomCoordinates = getGeoTargetRandomCoordinates( geotarget.data.id );

            if ( options.random_coordinates ) data.random_coordinates = randomCoordinates;

            if ( options.random_point ) {
                data.random_point = {
                    "type": "Point",
                    "coordinates": [randomCoordinates.longitude, randomCoordinates.latitude],
                };
            }
        }

        return result( 200, data, { "cache-control-no-cache": true } );
    }

    // private
    // XXX do somethinf with the not found or empty responses
    async #fetchGeoData ( geotarget ) {
        const mutex = MutexSet.get( geotarget.id );

        if ( !mutex.tryDown() ) return await mutex.signal.wait();

        var res;

        try {
            const osmType = OSM_TYPE[geotarget.type];

            let q = "country=" + geotarget.country;
            if ( osmType !== "country" ) q += "&" + osmType + "=" + geotarget.name;

            res = await this.#osmRequest( `https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&${q}` );

            // osm api error
            if ( !res.ok ) throw res;

            const json = res.data;

            // location found
            const center = { "longitude": +json[0].lon, "latitude": +json[0].lat },
                bbox = [+json[0].boundingbox[2], +json[0].boundingbox[0], +json[0].boundingbox[3], +json[0].boundingbox[1]], // minX, minY, maxX, maxY
                polygon = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": json[0].geojson,
                        },
                    ],
                };

            // insert / update geodata
            res = dbhCache.do( QUERIES.insert_geodata, [geotarget.id, center, bbox, polygon, center, bbox, polygon] );
            if ( !res.ok ) throw res;

            // triangulate
            res = await this.app.threads.call( "worker", "triangulate", geotarget.id );

            // triangulation failed
            if ( !res.ok ) {
                dbhCache.do( QUERIES.delete_geodata, [geotarget.id] );

                throw res;
            }
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
            res = await fetch( url, { "chrome": true } );

            if ( !res.ok ) {
                if ( res.status === 502 ) continue;

                break;
            }

            const json = await res.json();

            if ( json.length ) {
                res = result( 200, json );
            }
            else {
                res = result( [404, "No OSM results fount"] );
            }

            break;
        }

        OSM_MUTEX.up();

        return res;
    }
}
