import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import LRUCache from "lru-cache";
import fetch from "#core/fetch";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "geotarget" WHERE "id" = ? OR "canonical_name" LIKE ?`.prepare(),
    "get_geojson": sql`SELECT * FROM "local"."geotarget_geojson" WHERE "id" = ?`.prepare(),
    "insert_geojson": sql`INSERT INTO "local"."geotarget_geojson" ("id", "updated", "geojson") VALUES (?, CURRENT_TIMESTAMP, ?) ON CONFLICT ("id") DO UPDATE SET "geojson" = ?, "updated" = CURRENT_TIMESTAMP`.prepare(),
};

export default class extends Base {
    async API_get ( ctx, id ) {
        id = ( id + "" ).toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_geojson ( ctx, id ) {
        var geotarget = await ctx.call( "geotargets/get", id );

        // geotarget not found
        if ( !geotarget.data ) return geotarget;

        geotarget = geotarget.data;

        var res = await this.dbh.selectRow( QUERIES.get_geojson, [geotarget.id] );

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

        await this.dbh.do( QUERIES.insert_geojson, [id, geojson, geojson] );

        return result( 200, geojson );
    }
}
