import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLRU from "#core/cache-lru";
import datasets from "#lib/datasets";
import getCountryByCoordinates from "#lib/get-country-by-coordinates";
import getCountryRandomCoordinates from "#lib/get-country-random-coordinates";

const CACHE = new CacheLRU( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "country" WHERE "id" = ? OR "iso3" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "country"`.prepare(),
};

var dbhDatasets = await datasets.dbh( "datasets" );

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        datasets.on( "update", async dataset => {
            if ( dataset === "datasets" ) {
                dbhDatasets = await datasets.dbh( "datasets" );

                CACHE.reset();
            }
        } );
    }

    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = dbhDatasets.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx ) {
        return dbhDatasets.select( QUERIES.get_all );
    }

    async API_get_by_coordinates ( ctx, coordinates ) {
        const id = getCountryByCoordinates( coordinates );

        if ( !id ) return result( 200 );

        return ctx.call( "countries/get", id );
    }

    async API_get_country_random_coordinates ( ctx, id ) {
        const country = await ctx.call( "countries/get", id );

        if ( !country.data ) return country;

        const point = getCountryRandomCoordinates( country.data.iso2 );

        return result( 200, point, { "cache-control-no-cache": true } );
    }
}
