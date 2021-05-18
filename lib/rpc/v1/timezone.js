import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";

const Q = {
    "id": sql`SELECT * FROM "timezone" WHERE "id" = ?`.prepare(),
};

/** class: Timezone
 * summary: Timezone lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Search for timezone.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        const res = await this.dbh.selectRow( Q.id, [id.toLowerCase()] );

        return res;
    }

    /** method: API_get_by_coordinates
     * summary: Search for timezone.
     * params:
     *   - name: coordinates
     *     required: true
     *     schema:
     *       type: object
     */
    async API_get_by_coordinates ( coordinates ) {
        const timezones = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !timezones ) return result( 404 );

        const res = await this.dbh.selectAll( sql`SELECT * FROM "timezone" WHERE "id"`.IN( timezones ) );

        return res;
    }
}
