import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache-lru";
import fetch from "#core/fetch";
import datasets from "#lib/datasets";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "geotarget" WHERE "id" = ? OR "canonical_name" LIKE ?`.prepare(),
    "get_geojson": sql`SELECT * FROM "geotarget_geojson" WHERE "id" = ?`.prepare(),
    "insert_geojson": sql`INSERT INTO "geotarget_geojson" ("id", "updated", "geojson") VALUES (?, CURRENT_TIMESTAMP, ?) ON CONFLICT ("id") DO UPDATE SET "geojson" = ?, "updated" = CURRENT_TIMESTAMP`.prepare(),
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

        res = dbhGoogleGeotargets.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_getGeoJson ( ctx, id ) {
        var geotarget = await ctx.call( "geotargets/get", id );

        // geotarget not found
        if ( !geotarget.data ) return geotarget;

        geotarget = geotarget.data;

        var res = dbhCache.selectRow( QUERIES.get_geojson, [geotarget.id] );

        if ( res.data ) return res;

        var geojson = null;

        try {
            res = await fetch( `https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&q=${geotarget.canonical_name}`, { "chrome": true } );

            // api error
            if ( !res.ok ) throw Error;

            geojson = await res.json();

            // found
            if ( geojson.length ) {
                geojson = {
                    "center": { "longitude": +geojson[0].lon, "latitude": +geojson[0].lat },
                    "bbox": [+geojson[0].boundingbox[2], +geojson[0].boundingbox[0], +geojson[0].boundingbox[3], +geojson[0].boundingbox[1]], // minX, minY, maxX, maxY
                    "polygon": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {},
                                "geometry": geojson[0].geojson,
                            },
                        ],
                    },
                };
            }
        }
        catch ( e ) {
            return result( 500 );
        }

        dbhCache.do( QUERIES.insert_geojson, [id, geojson, geojson] );

        return result( 200, geojson );
    }
}
