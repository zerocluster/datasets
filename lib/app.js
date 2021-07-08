import App from "#core/app";
import updater from "#lib/updater";
import sql from "#core/sql";

import CONST from "#lib/const";

// init auto-update timer
setInterval( () => updater.update(), CONST.updateInterval );

// update datasets on start
await updater.update();

export default class extends App {
    #dbh;

    get dbh () {
        return this.#dbh;
    }

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

        // listen for updater update event
        updater.on( "update", this.#onUpdate.bind( this ) );

        // update local db schema
        const dbhLocal = await sql.new( CONST.localDatasetsLocation );
        await dbhLocal.loadSchema( new URL( "./db.local", import.meta.url ) );
        await dbhLocal.migrate();
        dbhLocal.db.close();

        // create DBH
        await this.#openDBH();

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

    // private
    async #openDBH () {
        if ( this.#dbh ) this.#dbh.db.close();

        this.#dbh = await sql.new( CONST.index.datasets.location );

        this.#dbh.attach( "local", CONST.localDatasetsLocation );
    }

    #onUpdate ( target ) {
        if ( target === "datasets" ) this.#openDBH();

        this.publish( "update", target );

        this.pubish( "rpc", "update", target );
    }
}
