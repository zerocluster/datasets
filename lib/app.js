import App from "#core/app";
import maxmind from "#lib/maxmind";
import sql from "#core/sql";

import CONST from "#lib/const";

setInterval( () => maxmind.update(), 1000 * 60 * 60 * 4 );

await maxmind.update();

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

        const dbhLocal = await sql.new( CONST.dbLocal );
        await dbhLocal.loadSchema( new URL( "./db-local", import.meta.url ) );
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

        this.#dbh = await sql.new( CONST.db );

        this.#dbh.attach( "local", CONST.dbLocal );
    }
}
