import CacheLru from "#core/cache/lru";
import sql from "#core/sql";

// NOTE source: /usr/share/iso_files/json/iso_639-*.json

const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
    "get": sql`SELECT * FROM language WHERE id = ? OR iso2 = ? OR normalize_nfc_casefold( name ) LIKE normalize_nfc_casefold( ? )`.prepare(),

    "getAll": sql`SELECT * FROM language`.prepare(),
};

export default Super =>
    class extends Super {

        // public
        async init () {
            this.app.datasets.resources.datasets.on( "update", () => CACHE.clear() );

            return super.init();
        }

        async [ "API_get" ] ( ctx, id ) {
            id = id.toLowerCase();

            var res = CACHE.get( id );

            if ( res ) return res;

            res = this.app.datasets.resources.datasetsDbh.selectRow( SQL.get, [ id, id, id ] );

            CACHE.set( id, res );

            return res;
        }

        async [ "API_get-all" ] ( ctx ) {
            return this.app.datasets.resources.datasetsDbh.select( SQL.getAll );
        }
    };
