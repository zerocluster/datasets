import Base from "#core/app/mixins/base";
import sql from "#core/sql";
import LRUCache from "lru-cache";

// NOTE source: /usr/share/iso_files/json/iso_639-*.json

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "language" WHERE "id" = ? OR "iso2" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "language"`.prepare(),
};

/** class: Language
 * summary: Language lookup.
 */
export default class extends Base() {

    /** method: API_get
     * summary: Get language by iso2, iso3 or name.
     * params:
     *   - name: id
     *     required: true
     *     schema:
     *       type: string
     */
    async API_get ( id ) {
        id = id.toLowerCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id, id] );

        CACHE.set( id, res );

        return res;
    }

    /** method: API_get_all
     * summary: Get all languages.
     */
    async API_get_all () {
        return this.dbh.selectAll( QUERIES.get_all );
    }
}
