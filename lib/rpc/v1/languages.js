import CacheLru from "#core/cache/lru";
import sql from "#core/sql";
import externalResources from "#lib/external-resources";

// NOTE source: /usr/share/iso_files/json/iso_639-*.json

const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
    "get": sql`SELECT * FROM language WHERE id = ? OR iso2 = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM language`.prepare(),
};

externalResources.datasets.on( "update", () => CACHE.clear() );

export default Super =>
    class extends Super {

        // public
        async [ "API_get" ] ( ctx, id ) {
            id = id.toLowerCase();

            var res = CACHE.get( id );

            if ( res ) return res;

            res = externalResources.datasetsDbh.selectRow( SQL.get, [ id, id, id ] );

            CACHE.set( id, res );

            return res;
        }

        async [ "API_getAll" ] ( ctx ) {
            return externalResources.datasetsDbh.select( SQL.getAll );
        }
    };
