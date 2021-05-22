import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import LRUCache from "lru-cache";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "currency" WHERE "id" = ? OR "symbol" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "currency"`.prepare(),
};

/** class: Currency
 * summary: Currency lookup.
 * permissions: ["*"]
 */
export default class extends Base() {

    /** method: API_get
     * summary: Get currency by iso3, symbol or name.
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
     * summary: Get all currencies.
     */
    async API_get_all ( ctx ) {
        return this.dbh.selectAll( QUERIES.get_all );
    }
}
