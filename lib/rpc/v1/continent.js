import Base from "#core/app/mixins/base";
import sql from "#core/sql";

const Q = {
    "id": sql`SELECT * FROM "continent" WHERE "id" = ?`.prepare(),
};

/** class: Continent
 * summary: Continent lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Search for continent.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        const res = await this.dbh.selectRow( Q.id, [id.toUpperCase()] );

        return res;
    }
}
