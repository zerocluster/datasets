import CacheLru from "#core/cache/lru";
import sql from "#core/sql";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const SQL = {
    "get": sql`SELECT * FROM country WHERE id = ? OR iso3 = ? OR name LIKE ?`.prepare(),

    "getAll": sql`SELECT * FROM country`.prepare(),
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

        async [ "API_get-by-coordinates" ] ( ctx, coordinates ) {
            const id = this.app.datasets.getCountryByCoordinates( coordinates );

            if ( !id ) return result( 200 );

            return ctx.call( "countries/get", id );
        }
    };
