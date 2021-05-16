import Base from "#core/app/mixins/base";
import maxmind from "#core/maxmind";

/** class: Maxmind
 * summary: Maxmind Geo IP lookup.
 */
export default class extends Base() {

    /** method: API_asn
     * summary: Search in asn database.
     * params:
     *   - name: ipAddr
     *     required: true
     *     schema:
     *       type: string
     */
    async API_asn ( ipAddr ) {
        return result( 200, maxmind.asn.get( ipAddr ) );
    }

    /** method: API_country
     * summary: Search in country database.
     * params:
     *   - name: ipAddr
     *     required: true
     *     schema:
     *       type: string
     */
    async API_country ( ipAddr ) {
        return result( 200, maxmind.country.get( ipAddr ) );
    }

    /** method: API_city
     * summary: Search in city database.
     * params:
     *   - name: ipAddr
     *     required: true
     *     schema:
     *       type: string
     */
    async API_city ( ipAddr ) {
        return result( 200, maxmind.city.get( ipAddr ) );
    }
}
