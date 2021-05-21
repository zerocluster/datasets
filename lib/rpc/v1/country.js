import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import LRUCache from "lru-cache";
import whichCountry from "which-country";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "country" WHERE "id" = ? OR "iso3" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "country"`.prepare(),
};

/** class: Country
 * summary: Country lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Get country by iso2, iso3 or name.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    /** method: API_get_all
     * summary: Get all countries.
     */
    async API_get_all ( ctx ) {
        return this.dbh.selectAll( QUERIES.get_all );
    }

    /** method: API_get_by_coordinates
     * summary: Get country by coordinates.
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
    async API_get_by_coordinates ( ctx, coordinates ) {
        const iso3 = whichCountry( [coordinates.longitude, coordinates.latitude] );

        if ( !iso3 ) return result( 200 );

        return ctx.call( "country/get", iso3 );
    }
}
