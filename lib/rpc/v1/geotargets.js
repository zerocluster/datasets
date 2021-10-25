import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache-lru";
import fetch from "#core/fetch";
import datasets from "#lib/datasets";
import Mutex from "#core/threads/mutex";
import getGeoTargetRandomCoordinates from "#lib/get-geotarget-random-coordinates";

const MutexSet = new Mutex.Set();
const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM geotarget WHERE id = ? OR canonical_name LIKE ? OR ( type = 'country' AND country = ? ) OR name LIKE ?`.prepare(),
    "get_geodata": sql`SELECT * FROM geotarget WHERE id = ?`.prepare(),
    "insert_geodata": sql`INSERT INTO geotarget ( id, updated, center, bbox, polygon ) VALUES ( ?, CURRENT_TIMESTAMP, ?, ?, ? ) ON CONFLICT ( id ) DO UPDATE SET updated = CURRENT_TIMESTAMP, center = ?, bbox = ?, polygon = ?`.prepare(),
};

var dbhGeoTargets = await datasets.dbh( "geotargets" ),
    dbhCache = await datasets.cache();

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

    async API_get ( ctx, id, options ) {
        id = ( id + "" ).toUpperCase();

        var geotarget = CACHE.get( id );

        if ( geotarget ) return geotarget;

        geotarget = dbhGeoTargets.selectRow( QUERIES.get, [id, id, id, id] );

        CACHE.set( id, geotarget );

        if ( !geotarget.data || !options ) return geotarget;

        var geodata = dbhCache.selectRow( QUERIES.get_geodata, [geotarget.data.id] );

        if ( !geodata.data ) {
            const res = await this.#fetchGeoData( geotarget.data );
            if ( !res ) return res;

            geodata = dbhCache.selectRow( QUERIES.get_geodata, [geotarget.data.id] );
        }

        const data = { ...geotarget.data };

        if ( options.center ) data.center = geodata.data.center;
        if ( options.bbox ) data.bbox = geodata.data.bbox;
        if ( options.polygon ) data.polygon = geodata.data.polygon;
        if ( options.random_coordinates ) data.random_coordinates = getGeoTargetRandomCoordinates( geotarget.data.id );

        return result( 200, data, { "cache-control-no-cache": true } );
    }

    // private
    async #fetchGeoData ( geotarget ) {
        const mutex = MutexSet.get( geotarget.id );

        if ( !mutex.tryDown() ) return await mutex.signal.wait();

        var res;

        try {
            res = await fetch( `https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&q=${geotarget.canonical_name}`, { "chrome": true } );

            // api error
            if ( !res.ok ) throw result( [500, "API request error"] );

            const geojson = await res.json();

            // location not found
            if ( !geojson.length ) throw result( 200 );

            // location found
            const center = { "longitude": +geojson[0].lon, "latitude": +geojson[0].lat },
                bbox = [+geojson[0].boundingbox[2], +geojson[0].boundingbox[0], +geojson[0].boundingbox[3], +geojson[0].boundingbox[1]], // minX, minY, maxX, maxY
                polygon = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": geojson[0].geojson,
                        },
                    ],
                };

            // insert / update geodata
            dbhCache.do( QUERIES.insert_geodata, [geotarget.id, center, bbox, polygon, center, bbox, polygon] );

            // triangulate
            await this.app.threads.call( "worker", "triangulate", geotarget.id );

            res = result( 200 );
        }
        catch ( e ) {
            res = result.catch( e );
        }

        mutex.signal.broadcast( res );

        MutexSet.delete( mutex );

        return res;
    }
}
