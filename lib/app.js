import App from "#core/app";
import updater from "#lib/updater";
import sql from "#core/sql";
import url from "url";

import CONST from "#lib/const";

export default class extends App {
    #datasets = {};

    async run () {

        // signal handlers
        process.on( "SIGINT", () => {
            console.log( "SIGINT" );

            process.exit();
        } );

        process.on( "SIGTERM", () => {
            console.log( "SIGTERM" );

            process.exit();
        } );

        // update datasets on start
        await updater.update();

        // init auto-update timer
        updater.start();

        // listen for updater update event
        updater.on( "update", this.#onUpdate.bind( this ) );

        // init cluster
        var res = await this.initCluster( process.env.APP_CLUSTER );
        if ( !res.ok ) return res;

        // create RPC
        res = await this.createRPC( this.RPC, {
            "apiSchema": new URL( "./rpc", import.meta.url ),
        } );
        if ( !res.ok ) return res;

        // run RPC server
        res = await this.rpc.listen();
        if ( !res.ok ) return res;

        return result( 200 );
    }

    async dbh ( dataset ) {
        if ( !this.#datasets[dataset] ) {
            if ( dataset === "local" ) {

                // update local datasets db schema
                this.#datasets[dataset] = await sql.new( CONST.localDatasetsLocation );
                await this.#datasets[dataset].loadSchema( new URL( "./db", import.meta.url ) );
                await this.#datasets[dataset].migrate();
            }
            else {
                this.#datasets[dataset] = await sql.new( url.pathToFileURL( CONST.index[dataset].path ) );
            }
        }

        return this.#datasets[dataset];
    }

    // private
    #onUpdate ( dataset ) {
        if ( this.#datasets[dataset] ) {
            this.#datasets[dataset].db.close();

            this.#datasets[dataset] = null;
        }

        this.publish( "update", dataset );
        this.publish( "rpc", "update", dataset );
    }
}
