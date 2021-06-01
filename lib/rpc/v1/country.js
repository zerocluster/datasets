import Prototype from "#core/app/prototype";
import sql from "#core/sql";
import LRUCache from "lru-cache";
import whichCountry from "which-country";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "country" WHERE "id" = ? OR "iso3" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "country"`.prepare(),
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

    async API_get_by_coordinates ( ctx, coordinates ) {
        const iso3 = whichCountry( [coordinates.longitude, coordinates.latitude] );

        if ( !iso3 ) return result( 200 );

        return ctx.call( "country/get", iso3 );
    }
}
