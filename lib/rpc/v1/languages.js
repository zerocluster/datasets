import sql from "#core/sql";
import CacheLru from "#core/cache/lru";
import datasets from "#lib/datasets";

// NOTE source: /usr/share/iso_files/json/iso_639-*.json

const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
    "get": sql`SELECT * FROM language WHERE id = ? OR iso2 = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM language`.prepare(),
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
            id = id.toLowerCase();

            var res = CACHE.get( id );

            if ( res ) return res;

            res = dbhDatasets.selectRow( SQL.get, [id, id, id] );

            CACHE.set( id, res );

            return res;
        }

        async API_getAll ( ctx ) {
            return dbhDatasets.select( SQL.getAll );
        }
    };
