import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLRU from "#core/cache-lru";
import fetch from "#core/fetch";

const CACHE = new CacheLRU( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "geotarget" WHERE "id" = ? OR "canonical_name" LIKE ?`.prepare(),
    "get_geojson": sql`SELECT * FROM "geotarget_geojson" WHERE "id" = ?`.prepare(),
    "insert_geojson": sql`INSERT INTO "geotarget_geojson" ("id", "updated", "geojson") VALUES (?, CURRENT_TIMESTAMP, ?) ON CONFLICT ("id") DO UPDATE SET "geojson" = ?, "updated" = CURRENT_TIMESTAMP`.prepare(),
};

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        api.app.on( "update", target => {
            if ( target === "google-geotargets" ) CACHE.reset();
        } );
    }

    async API_get ( ctx, id ) {
        id = ( id + "" ).toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await ( await this.app.dbh( "google-geotargets" ) ).selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_geojson ( ctx, id ) {
        var geotarget = await ctx.call( "geotargets/get", id );

        // geotarget not found
        if ( !geotarget.data ) return geotarget;

        geotarget = geotarget.data;

        var res = await ( await this.app.dbh( "cache" ) ).selectRow( QUERIES.get_geojson, [geotarget.id] );

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

        await ( await this.app.dbh( "cache" ) ).do( QUERIES.insert_geojson, [id, geojson, geojson] );

        return result( 200, geojson );
    }
}
