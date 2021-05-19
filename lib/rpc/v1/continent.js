import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import LRUCache from "lru-cache";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "continent" WHERE "id" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "continent"`.prepare(),
};

/** class: Continent
 * summary: Continent lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Get continent by iso2 or name.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    /** method: API_get_all
     * summary: Get all continents.
     */
    async API_get_all () {
        return this.dbh.selectAll( QUERIES.get_all );
    }
}
