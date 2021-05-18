import Base from "#core/app/mixins/base";
import sql from "#core/sql";

const Q = {
    "id": sql`SELECT * FROM "geotarget" WHERE "id" = ? OR "canonical_name" = ?`.prepare(),
};

/** class: GeoTarget
 * summary: GeoTarget lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Search for GeoTarget.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        const res = await this.dbh.selectRow( Q.id, [id, id] );

        return res;
    }
}
