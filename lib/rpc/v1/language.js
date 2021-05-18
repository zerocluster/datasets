import Base from "#core/app/mixins/base";
import sql from "#core/sql";

const Q = {
    "id": sql`SELECT * FROM "language" WHERE "id" = ?`.prepare(),
};

/** class: Language
 * summary: Language lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Search for language.
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
}
