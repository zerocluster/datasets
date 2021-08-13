import sql from "#core/sql";
import updater from "#lib/updater";
import Events from "#core/events";
import CONST from "#lib/const";
import url from "url";

class Datasets extends Events {
    #dbh = {};
    #cache;

    constructor () {
        super();

        updater.on( "update", async id => {
            if ( this.#dbh[id] ) {
                this.#dbh[id].db.close();

                this.#dbh[id] = null;

                await this.dbh( id );
            }

            this.emit( "update", id );
        } );
    }

    async dbh ( id ) {
        this.#dbh[id] ??= await sql.new( url.pathToFileURL( CONST.path + "/" + CONST.index[id].name ) );

        return this.#dbh[id];
    }

    async cache () {
        if ( !this.#cache ) {
            this.#cache = await sql.new( url.pathToFileURL( CONST.path + "/cache.sqlite" ) );
            await this.#cache.loadSchema( new URL( "./db", import.meta.url ) );
            await this.#cache.migrate();
        }

        return this.#cache;
    }
}

export default new Datasets();
