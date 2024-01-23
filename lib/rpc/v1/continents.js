import sql from "#core/sql";
import CacheLru from "#core/cache/lru";
import externalResources from "#lib/external-resources";

const CACHE = new CacheLru( { "maxSize": 1000 } );

externalResources.datasets.on( "update", () => CACHE.clear() );

const SQL = {
    "get": sql`SELECT * FROM continent WHERE id = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM continent`.prepare(),
};

export default Super =>
    class extends Super {
        async API_get ( ctx, id ) {
            id = id.toUpperCase();

            var res = CACHE.get( id );

            if ( res ) return res;

            res = externalResources.datasetsDbh.selectRow( SQL.get, [ id, id ] );

            CACHE.set( id, res );

            return res;
        }

        async API_getAll ( ctx ) {
            return externalResources.datasetsDbh.select( SQL.getAll );
        }
    };
