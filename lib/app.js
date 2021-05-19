import App from "#core/app";
import maxmind from "#core/maxmind";
import sql from "#core/sql";
import fs from "#core/fs";
import env from "#core/env";

setInterval( () => maxmind.update(), 1000 * 60 * 60 * 4 );

await maxmind.update();

export default class extends App {
    #rpc;
    #dbh;

    get rpc () {
        return this.#rpc;
    }

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

        this.#dbh = await sql.connect( "sqlite:" + fs.resolve( "../data/data.sqlite", import.meta.url ) );

        const localPath = env.root + "/data/data-local.sqlite";
        const dbhLocal = await sql.connect( "sqlite:" + localPath, import.meta.url );
        await dbhLocal.loadSchema( new URL( "./db-local", import.meta.url ) );
        await dbhLocal.migrate();
        this.#dbh.attach( "local", localPath );

        // connect to the cluster
        if ( process.env.APP_CLUSTER ) {
            process.stdout.write( "Connecting to the cluster ... " );
            var res = await this.cluster.connect( process.env.APP_CLUSTER, {
                "groups": process.env.APP_CLUSTER_GROUPS,
                "publish": {
                    "app": process.env.APP_CLUSTER_PUBLISH_APP,
                },
            } );
            console.log( res + "" );
            if ( !res.ok ) return res;
        }

        // create rpc endpoint
        this.#rpc = await this.RPC.new( this, {
            "apiSchema": new URL( "./rpc", import.meta.url ),
        } );
        if ( !this.#rpc ) return result( 500 );

        // run RPC service
        res = await this.cluster.listen( this.#rpc );
        if ( !res.ok ) throw res;

        return result( 200 );
    }
}
