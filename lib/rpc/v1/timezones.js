import geoTz from "geo-tz";
import sql from "#core/sql";
import externalResources from "#lib/external-resources";

var IDX_ID, IDX_NAME, IDX_ABBR;

const SQL = {
    "selectAll": sql`SELECT * FROM timezone`.prepare(),
};

externalResources.datasets.on( "update", () => {
    IDX_ID = null;
    IDX_NAME = null;
    IDX_ABBR = null;
} );

export default Super =>
    class extends Super {
        API_get ( ctx, id ) {
            const tz = this.#getTimezone( id );

            return result( 200, tz );
        }

        API_getAll ( ctx ) {
            if ( !IDX_ID ) this.#fetchAll();

            return result( 200, Object.values( IDX_ID ) );
        }

        API_getByCoordinates ( ctx, coordinates ) {
            const timezones = geoTz.find( coordinates.latitude, coordinates.longitude );

            if ( !timezones ) return result( 200 );

            const res = result( 200, [] );

            for ( const id of timezones ) {
                const tz = this.#getTimezone( id );

                res.data.push( tz.data );
            }

            return res;
        }

        // private
        #fetchAll () {
            const res = externalResources.datasetsDbh.select( SQL.selectAll );

            IDX_ID = {};
            IDX_NAME = {};
            IDX_ABBR = {};

            for ( const row of res.data ) {
                IDX_ID[ row.id.toUpperCase() ] = row;
                IDX_NAME[ row.name.toUpperCase() ] = row;
                IDX_ABBR[ row.abbr.toUpperCase() ] = row;
            }
        }

        #getTimezone ( id ) {
            id = id.toUpperCase();

            if ( !IDX_ID ) this.#fetchAll();

            return IDX_ID[ id ] || IDX_NAME[ id ] || IDX_ABBR[ id ];
        }
    };
