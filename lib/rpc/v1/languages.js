import Base from "#app/prototypes/base";
import sql from "#core/sql";
import CacheLRU from "#core/cache-lru";
import datasets from "#lib/datasets";

// NOTE source: /usr/share/iso_files/json/iso_639-*.json

const CACHE = new CacheLRU( { "maxSize": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "language" WHERE "id" = ? OR "iso2" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "language"`.prepare(),
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
        id = id.toLowerCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = dbhDatasets.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx ) {
        return dbhDatasets.select( QUERIES.get_all );
    }
}
