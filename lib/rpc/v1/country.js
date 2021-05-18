import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import whichCountry from "which-country";

const Q = {
    "iso2": sql`SELECT * FROM "country" WHERE "id" = ?`.prepare(),
    "iso3": sql`SELECT * FROM "country" WHERE "iso3" = ?`.prepare(),
};

/** class: Country
 * summary: Country lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Search for country.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        const res = await this.dbh.selectRow( Q.iso2, [id.toUpperCase()] );

        return res;
    }

    /** method: API_get_by_coordinates
     * summary: Search for country.
     * params:
     *   - name: coordinates
     *     required: true
     *     schema:
     *       type: object
     */
    async API_get_by_coordinates ( coordinates ) {
        const iso3 = whichCountry( [coordinates.longitude, coordinates.latitude] );

        if ( !iso3 ) return result( 404 );

        const res = await this.dbh.selectRow( Q.iso3, [iso3] );

        return res;
    }
}
