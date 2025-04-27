import CacheLru from "#core/cache/lru";
import sql from "#core/sql";
import externalResources from "#lib/external-resources";
import getCountryByCoordinates from "#lib/get-country-by-coordinates";

const CACHE = new CacheLru( { "maxSize": 1000 } );

externalResources.datasets.on( "update", () => CACHE.clear() );

const SQL = {
    "get": sql`SELECT * FROM country WHERE id = ? OR iso3 = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM country`.prepare(),
};

export default Super =>
    class extends Super {

        // public
        async [ "API_get" ] ( ctx, id ) {
            id = id.toUpperCase();

            var res = CACHE.get( id );

            if ( res ) return res;

            res = externalResources.datasetsDbh.selectRow( SQL.get, [ id, id, id ] );

            CACHE.set( id, res );

            return res;
        }

        async [ "API_get-all" ] ( ctx ) {
            return externalResources.datasetsDbh.select( SQL.getAll );
        }

        async [ "API_get-by-coordinates" ] ( ctx, coordinates ) {
            const id = getCountryByCoordinates( coordinates );

            if ( !id ) return result( 200 );

            return ctx.call( "countries/get", id );
        }
    };
