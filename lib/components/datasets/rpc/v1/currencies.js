import CacheLru from "#core/cache/lru";
import sql from "#core/sql";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
    "get": sql`SELECT * FROM currency WHERE id = ? OR symbol = ? OR name LIKE ?`.prepare(),

    "getAll": sql`SELECT * FROM currency`.prepare(),
};

export default Super =>
    class extends Super {

        // public
        async init () {
            this.app.datasets.resources.datasets.on( "update", () => CACHE.clear() );

            return super.init();
        }

        async [ "API_get" ] ( ctx, id ) {
            id = id.toUpperCase();

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
