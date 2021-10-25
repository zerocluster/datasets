import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache-lru";
import fetch from "#core/fetch";
import datasets from "#lib/datasets";
import Mutex from "#core/threads/mutex";

const MutexSet = new Mutex.Set();
const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM geotarget WHERE id = ? OR canonical_name LIKE ? OR ( type = 'country' AND country = ? ) OR name LIKE ?`.prepare(),
    "get_geojson": sql`SELECT * FROM geotarget WHERE id = ?`.prepare(),
    "insert_geojson": sql`INSERT INTO geotarget ( id, updated, center, bbox, polygon ) VALUES ( ?, CURRENT_TIMESTAMP, ?, ?, ? ) ON CONFLICT ( id ) DO UPDATE SET updated = CURRENT_TIMESTAMP, center = ?, bbox = ?, polygon = ?`.prepare(),
};

var dbhGoogleGeotargets = await datasets.dbh( "google-geotargets" ),
    dbhCache = await datasets.cache();

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        datasets.on( "update", async dataset => {
            if ( dataset === "google-geotargets" ) {
                dbhGoogleGeotargets = await datasets.dbh( "google-geotargets" );

                CACHE.reset();
            }
        } );
    }

    async API_get ( ctx, id ) {
        id = ( id + "" ).toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = dbhGoogleGeotargets.selectRow( QUERIES.get, [id, id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_getGeojson ( ctx, id ) {
        var geotarget = await ctx.call( "geotargets/get", id );

        // geotarget not found
        if ( !geotarget.data ) return geotarget;

        geotarget = geotarget.data;

        var res = dbhCache.selectRow( QUERIES.get_geojson, [geotarget.id] );

        if ( !res.data ) {
            await this.#fetchGeoJson( geotarget );

            await this.app.threads.call( "worker", "triangulate", geotarget.id );
        }

        return dbhCache.selectRow( QUERIES.get_geojson, [geotarget.id] );
    }

    // private
    async #fetchGeoJson ( geotarget ) {
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

            dbhCache.do( QUERIES.insert_geojson, [geotarget.id, center, bbox, polygon, center, bbox, polygon] );

            res = result( 200, { center, bbox, polygon } );
        }
        catch ( e ) {
            res = result.catch( e );
        }

        mutex.signal.broadcast( res );

        MutexSet.delete( mutex );

        return res;
    }
}
