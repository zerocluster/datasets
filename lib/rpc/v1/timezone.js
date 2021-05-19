import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";

// import { IANAZone, DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "timezone" WHERE "abbr" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "timezone"`.prepare(),
};

/** class: Timezone
 * summary: Timezone lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Get timezone by abbreviation or name.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    /** method: API_get_all
     * summary: Get all timezones.
     */
    async API_get_all () {
        return this.dbh.selectAll( QUERIES.get_all );
    }

    /** method: API_get_by_coordinates
     * summary: Search for the timezone by the geo coordinates.
     * params:
     *   - name: coordinates
     *     required: true
     *     schema:
     *       type: object
     *       properties:
     *         latitude: { type: number }
     *         longitude: { type: number }
     *       required: [latitude, longitude]
     *       additionalProperties: false
     */
    async API_get_by_coordinates ( coordinates ) {
        const names = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !names ) return result( 200 );

        return await this.dbh.selectAll( sql`SELECT * FROM "timezone" WHERE "id"`.IN( names ) );
    }
}

// XXX cache???
// get offsetMinutes () {
//     const offset = DateTime.fromObject( { "zone": this } ).offset;

//     return offset;
// }

// // XXX cache???
// get offsetHours () {
//     const offset = this.offsetMinutes;

//     if ( offset < 0 ) return "-" + Duration.fromObject( { "minutes": Math.abs( offset ) } ).toFormat( "hh:mm" );
//     else if ( offset > 0 ) return "+" + Duration.fromObject( { "minutes": offset } ).toFormat( "hh:mm" );
//     else return "±" + Duration.fromObject( { "minutes": offset } ).toFormat( "hh:mm" );
// }
