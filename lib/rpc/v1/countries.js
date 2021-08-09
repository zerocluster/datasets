import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLRU from "#core/cache-lru";
import getCountryByCoordinates from "#lib/get-country-by-coordinates";
import getCountryRandomCoordinates from "#lib/get-country-random-coordinates";

const CACHE = new CacheLRU( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "country" WHERE "id" = ? OR "iso3" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "country"`.prepare(),
};

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        api.app.on( "update", target => {
            if ( target === "datasets" ) CACHE.reset();
        } );
    }

    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await ( await this.app.dbh( "datasets" ) ).selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx ) {
        return await ( await this.app.dbh( "datasets" ) ).select( QUERIES.get_all );
    }

    async API_get_by_coordinates ( ctx, coordinates ) {
        const id = await getCountryByCoordinates( this.app, coordinates );

        if ( !id ) return result( 200 );

        return ctx.call( "countries/get", id );
    }

    async API_get_country_random_coordinates ( ctx, id ) {
        const country = await ctx.call( "countries/get", id );

        if ( !country.data ) return country;

        const point = await getCountryRandomCoordinates( this.api, country.data.iso2 );

        return result( 200, point );
    }
}
