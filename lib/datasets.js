import sql from "#core/sql";
import resources from "#lib/resources";
import Events from "#core/events";
import url from "url";

class Datasets extends Events {
    #dbh = {};
    #cache;

    constructor () {
        super();

        resources.on( "update", async id => {
            if ( this.#dbh[id] ) {
                this.#dbh[id].close();

                this.#dbh[id] = null;

                await this.dbh( id );
            }

            this.emit( "update", id );
        } );
    }

    async dbh ( id ) {
        if ( !this.#dbh[id] ) {
            const _url = url.pathToFileURL( resources.location + "/" + resources.get( id ).files[0] );

            _url.searchParams.set( "mode", "ro" );

            this.#dbh[id] = await sql.new( _url );
        }

        return this.#dbh[id];
    }

    async cache () {
        if ( !this.#cache ) {
            this.#cache = await sql.new( url.pathToFileURL( resources.location + "/cache.sqlite" ) );
            await this.#cache.loadSchema( new URL( "./db", import.meta.url ) );
            await this.#cache.migrate();
        }

        return this.#cache;
    }
}

export default new Datasets();
