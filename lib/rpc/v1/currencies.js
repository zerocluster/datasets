import Base from "#core/app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache/lru";
import datasets from "#lib/datasets";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM currency WHERE id = ? OR symbol = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM currency`.prepare(),
};

var dbhDatasets = await datasets.dbh( "datasets" );

export default class extends Base {
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

        res = dbhDatasets.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_getAll ( ctx ) {
        return dbhDatasets.select( QUERIES.getAll );
    }
}
