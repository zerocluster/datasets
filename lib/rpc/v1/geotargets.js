import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache-lru";
import fetch from "#core/fetch";
import datasets from "#lib/datasets";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "geoTarget" WHERE "id" = ? OR "canonicalName" LIKE ?`.prepare(),
    "getGeoJson": sql`SELECT * FROM "geoTargetGeoJson" WHERE "id" = ?`.prepare(),
    "insertGeoJson": sql`INSERT INTO "geoTargetGeoJson" ("id", "updated", "geoJson") VALUES (?, CURRENT_TIMESTAMP, ?) ON CONFLICT ("id") DO UPDATE SET "geojson" = ?, "updated" = CURRENT_TIMESTAMP`.prepare(),
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
        var geoTarget = await ctx.call( "geotargets/get", id );

        // geotarget not found
        if ( !geoTarget.data ) return geoTarget;

        geoTarget = geoTarget.data;

        var res = dbhCache.selectRow( QUERIES.getGeoJson, [geoTarget.id] );

        if ( res.data ) return res;

        var geoJson = null;

        try {
            res = await fetch( `https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&q=${geoTarget.canonicalName}`, { "chrome": true } );

            // api error
            if ( !res.ok ) throw Error;

            geoJson = await res.json();

            // found
            if ( geoJson.length ) {
                geoJson = {
                    "center": { "longitude": +geoJson[0].lon, "latitude": +geoJson[0].lat },
                    "bbox": [+geoJson[0].boundingbox[2], +geoJson[0].boundingbox[0], +geoJson[0].boundingbox[3], +geoJson[0].boundingbox[1]], // minX, minY, maxX, maxY
                    "polygon": {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "properties": {},
                                "geometry": geoJson[0].geojson,
                            },
                        ],
                    },
                };
            }
        }
        catch ( e ) {
            return result( 500 );
        }

        dbhCache.do( QUERIES.insertGeoJson, [id, geoJson, geoJson] );

        return result( 200, geoJson );
    }
}
