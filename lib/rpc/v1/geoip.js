import Base from "#core/app/mixins/base";
import maxmind from "#core/maxmind";

/** class: GeoIP
 * summary: Maxmind GeoIP lookup.
 */
export default class extends Base() {

    /** method: API_asn
     * summary: Search in ASN database.
     * params:
     *   - name: addr
     *     required: true
     *     schema:
     *       type: string
     */
    async API_asn ( addr ) {
        return result( 200, maxmind.asn.get( addr ) );
    }

    /** method: API_country
     * summary: Search in Country database.
     * params:
     *   - name: addr
     *     required: true
     *     schema:
     *       type: string
     */
    async API_country ( addr ) {
        return result( 200, maxmind.country.get( addr ) );
    }

    /** method: API_city
     * summary: Search in City database.
     * params:
     *   - name: addr
     *     required: true
     *     schema:
     *       type: string
     */
    async API_city ( addr ) {
        return result( 200, maxmind.city.get( addr ) );
    }
}