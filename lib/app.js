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

        this.#dbh = await sql.connect( CONST.db );

        const dbhLocal = await sql.connect( CONST.dbLocal );
        await dbhLocal.loadSchema( new URL( "./db-local", import.meta.url ) );
        await dbhLocal.migrate();
        this.#dbh.attach( "local", CONST.dbLocals );

        // init cluster
        var res = await this.initCluster( {
            "url": process.env.APP_CLUSTER,
            "namespace": process.env.APP_CLUSTER_NAMESPACE,
        } );
        if ( !res.ok ) return res;

        // init services
        res = await this.initServices();
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
}
