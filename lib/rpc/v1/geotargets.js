import { pathToFileURL } from "node:url";
import GoogleMapsApi from "@softvisio/api/google/maps";
import CacheLru from "#core/cache/lru";
import Cache from "#core/cache/persistent";
import env from "#core/env";
import fetch from "#core/fetch";
import sql from "#core/sql";
import Mutex from "#core/threads/mutex";
import externalResources from "#lib/external-resources";
import getOsmRandomCoordinates from "#lib/get-osm-random-coordinates";

const gmapsCache = await Cache.new( pathToFileURL( env.root + "/data/datasets/google-maps.cache.sqlite" ), { "maxSize": 10_000 } );
var gmaps;

const mutexSet = new Mutex.Set();
const OSM_MUTEX = new Mutex();
const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
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

const cacheDbh = externalResources.cacheDbh;

externalResources.geotargets.on( "update", () => CACHE.clear() );

const OSM_TYPE = {
    "city": "city",
    "country": "country",
    "county": "county",
    "postal code": "postalcode",
    "state": "state",
};

export default Super =>
    class extends Super {
        constructor ( api ) {
            super( api );

            gmaps = new GoogleMapsApi( this.app.config.googleApiKey, { "cache": gmapsCache } );
        }

        // public
        async [ "API_get-geotarget" ] ( ctx, id, options = {} ) {
            id = ( id + "" ).toUpperCase();

            var geotarget = CACHE.get( id );

            if ( !geotarget ) {
                geotarget = externalResources.geotargetsDbh.selectRow( SQL.getGeotarget, [ id, id, id ] );

                CACHE.set( id, geotarget );
            }

            // not found
            if ( !geotarget.data ) return geotarget;

            // geocode
            if ( options.geocode ) {
                const data = { ...geotarget.data };

                const geocode = await gmaps.geocoding( data.canonical_name );

                data.geocode = geocode.data?.[ 0 ];

                return result( 200, data );
            }

            // no additional options required or type is not supported
            if ( !geotarget.data || !options || !OSM_TYPE[ geotarget.data.type ] ) return geotarget;

            var osm;

            if ( options.geojson ) osm = cacheDbh.selectRow( SQL.getOsmGeojson, [ geotarget.data.id ] );
            else osm = cacheDbh.selectRow( SQL.getOsm, [ geotarget.data.id ] );

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
                            "coordinates": [ randomCoordinates.longitude, randomCoordinates.latitude ],
                        };
                    }
                }
            }

            return result( 200, data, { "cache-control-no-cache": true } );
        }

        async [ "API_suggest-geotargets" ] ( ctx, options ) {
            const query = sql`SELECT * FROM geotarget`.WHERE( options.where );

            return this._read( ctx, query, { options, "dbh": externalResources.geotargetsDbh } );
        }

        // private
        async #fetchOsm ( geotarget ) {
            const mutex = mutexSet.get( geotarget.id );

            if ( !mutex.tryLock() ) return mutex.wait();

            var res;

            try {
                const osmType = OSM_TYPE[ geotarget.type ];

                let q = "country=" + geotarget.country;
                if ( osmType !== "country" ) q += "&" + osmType + "=" + geotarget.name;

                res = await this.#osmRequest( `https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&${ q }` );

                // osm not found
                if ( !res.ok ) throw res;

                const osm = res.data,
                    osmFound = !!osm,
                    osmData = {};

                // osm not found
                if ( !osmFound ) {

                    // remove triangles
                    await cacheDbh.do( SQL.deleteOsmTriangles, [ geotarget.id ] );
                }

                // osm found
                else {
                    osmData.class = osm.class;
                    osmData.type = osm.type;
                    osmData.display_name = osm.display_name;
                    osmData.center = { "longitude": +osm.lon, "latitude": +osm.lat };
                    osmData.bbox = [ +osm.boundingbox[ 2 ], +osm.boundingbox[ 0 ], +osm.boundingbox[ 3 ], +osm.boundingbox[ 1 ] ]; // minX, minY, maxX, maxY
                    osmData.geojson = osm.geojson;
                }

                // insert / update geodata
                res = cacheDbh.do( SQL.insertOsm, [ geotarget.id, osmData.class, osmData.type, osmData.display_name, osmData.center, osmData.bbox, osmData.geojson, osmData.class, osmData.type, osmData.display_name, osmData.center, osmData.bbox, osmData.geojson ] );
                if ( !res.ok ) throw res;

                // triangulate
                if ( osmFound && ( osmData.geojson.type === "MultiPolygon" || osmData.geojson.type === "Polygon" ) ) {
                    res = await this.app.threads.call( "worker", "triangulate", geotarget.id );

                    // triangulation failed
                    if ( !res.ok ) {
                        cacheDbh.do( SQL.deleteOsm, [ geotarget.id ] );

                        throw res;
                    }
                }

                res = result( 200, osmData );
            }
            catch ( e ) {
                res = result.catch( e );
            }

            mutex.unlock( res );

            return res;
        }

        async #osmRequest ( url ) {
            await OSM_MUTEX.lock();

            var res;

            while ( true ) {
                res = await fetch( url );

                console.log( "osm:", res + "", url );

                if ( !res.ok ) {
                    if ( res.status === 502 ) continue;

                    break;
                }

                const json = await res.json();

                res = result( 200, json[ 0 ] );

                break;
            }

            OSM_MUTEX.unlock();

            return res;
        }
    };
