import Prototype from "#core/app/api/prototype";
import sql from "#core/sql";
import LRUCache from "lru-cache";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "currency" WHERE "id" = ? OR "symbol" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "currency"`.prepare(),
};

export default class extends Prototype {
    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx ) {
        return this.dbh.selectAll( QUERIES.get_all );
    }
}
