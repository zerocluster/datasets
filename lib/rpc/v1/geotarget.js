import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import LRUCache from "lru-cache";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "geotarget" WHERE "id" = ? OR "canonical_name" LIKE ?`.prepare(),
};

/** class: GEOTarget
 * summary: Google GEOTarget lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Get GEOTarget by id or canonical name.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: [number, string]
     */
    async API_get ( id ) {
        id = ( id + "" ).toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }
}
