import Prototype from "#core/app/prototype";
import sql from "#core/sql";
import LRUCache from "lru-cache";

// NOTE source: /usr/share/iso_files/json/iso_639-*.json

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "language" WHERE "id" = ? OR "iso2" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "language"`.prepare(),
};

export default class extends Prototype {
    async API_get ( ctx, id ) {
        id = id.toLowerCase();

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
