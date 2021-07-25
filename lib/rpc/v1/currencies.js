import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import CacheLRU from "@softvisio/utils/cache-lru";

const CACHE = new CacheLRU( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "currency" WHERE "id" = ? OR "symbol" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "currency"`.prepare(),
};

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        api.app.on( "update", target => {
            if ( target === "datasets" ) CACHE.reset();
        } );
    }

    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx ) {
        return this.dbh.select( QUERIES.get_all );
    }
}
