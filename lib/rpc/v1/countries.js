import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLru from "#core/cache-lru";
import datasets from "#lib/datasets";
import getCountryByCoordinates from "#lib/get-country-by-coordinates";

const CACHE = new CacheLru( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM country WHERE id = ? OR iso3 = ? OR name LIKE ?`.prepare(),
    "getAll": sql`SELECT * FROM country`.prepare(),
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

    async API_getAll ( ctx ) {
        return dbhDatasets.select( QUERIES.getAll );
    }

    async API_getByCoordinates ( ctx, coordinates ) {
        const id = getCountryByCoordinates( coordinates );

        if ( !id ) return result( 200 );

        return ctx.call( "countries/get", id );
    }
}
