import sql from "#core/sql";
import CacheLru from "#core/cache/lru";
import datasets from "#lib/datasets";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
    "get": sql`SELECT * FROM continent WHERE id = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM continent`.prepare(),
};

var dbhDatasets = await datasets.dbh( "datasets" );

export default Super =>
    class extends Super {
        constructor ( api ) {
            super( api );

            // set update listener
            datasets.on( "update", async dataset => {
                if ( dataset === "datasets" ) {
                    dbhDatasets = await datasets.dbh( "datasets" );

                    CACHE.clear();
                }
            } );
        }

        async API_get ( ctx, id ) {
            id = id.toUpperCase();

            var res = CACHE.get( id );

            if ( res ) return res;

            res = dbhDatasets.selectRow( SQL.get, [id, id] );

            CACHE.set( id, res );

            return res;
        }

        async API_getAll ( ctx ) {
            return dbhDatasets.select( SQL.getAll );
        }
    };
