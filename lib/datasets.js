import sql from "#core/sql";
import resources from "#lib/resources";
import Events from "#core/events";
import url from "url";

class Datasets extends Events {
    #dbh = {};
    #cache;

    constructor () {
        super();

        resources.on( "update", async resource => {
            if ( this.#dbh[resource.id] ) {
                this.#dbh[resource.id].close();

                this.#dbh[resource.id] = null;

                await this.dbh( resource.id );
            }

            this.emit( "update", resource.id );
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
            const res = await this.#cache.schema.migrate( new URL( "./db", import.meta.url ) );

            if ( !res.ok ) {
                console.log( "Error migrating cache chema: " + res );

                process.exit( 2 );
            }
        }

        return this.#cache;
    }
}

export default new Datasets();
