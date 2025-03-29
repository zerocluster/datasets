import geoTz from "geo-tz";
import CacheLru from "#core/cache/lru";
import sql from "#core/sql";
import externalResources from "#lib/external-resources";

var IDX_ID, IDX_NAME, IDX_ABBR;

const CACHE = new CacheLru(),
    ALL_CACHE_ID = Symbol();

const SQL = {
    "all": sql`SELECT * from timezone`.prepare(),
};

externalResources.datasets.on( "update", () => {
    IDX_ID = null;
    IDX_NAME = null;
    IDX_ABBR = null;

    CACHE.clear();
} );

export default Super =>
    class extends Super {
        async API_get ( ctx, id ) {
            id = id.toUpperCase();

            if ( !IDX_ID ) this.#fetchAll();

            const tz = IDX_ID[ id ] || IDX_NAME[ id ] || IDX_ABBR[ id ];

            // timezone not found
            if ( !tz ) return result( 200 );

            return result( 200, tz );
        }

        // XXX
        async API_getAll ( ctx ) {
            var res = CACHE.get( ALL_CACHE_ID );

            // from cache
            if ( res ) return res;

            if ( !IDX_ID ) this.#fetchAll();

            res = result( 200, [] );

            for ( const id in IDX_ID ) {
                const tz = await this.API_get( ctx, id );

                res.data.push( tz.data );

                if ( !res.meta[ "cache-control-expires" ] || tz.meta[ "cache-control-expires" ] < res.meta[ "cache-control-expires" ] ) {
                    res.meta[ "cache-control-expires" ] = tz.meta[ "cache-control-expires" ];
                }
            }

            CACHE.set( ALL_CACHE_ID, res, res.meta[ "cache-control-expires" ] - Date.now() );

            return res;
        }

        // XXX
        async API_getByCoordinates ( ctx, coordinates ) {
            const timezones = geoTz.find( coordinates.latitude, coordinates.longitude );

            if ( !timezones ) return result( 200 );

            const res = result( 200, [] );

            for ( const id of timezones ) {
                const tz = await this.API_get( ctx, id );

                res.data.push( tz.data );

                if ( !res.meta[ "cache-control-expires" ] || tz.meta[ "cache-control-expires" ] < res.meta[ "cache-control-expires" ] ) {
                    res.meta[ "cache-control-expires" ] = tz.meta[ "cache-control-expires" ];
                }
            }

            return res;
        }

        // private
        #fetchAll () {
            const res = externalResources.datasetsDbh.select( SQL.all );

            IDX_ID = {};
            IDX_NAME = {};
            IDX_ABBR = {};

            for ( const row of res.data ) {
                IDX_ID[ row.id.toUpperCase() ] = row;
                IDX_NAME[ row.name.toUpperCase() ] = row;
                IDX_ABBR[ row.abbr.toUpperCase() ] = row;
            }
        }
    };
