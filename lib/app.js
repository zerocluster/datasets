import App from "#core/app";
import maxmind from "#core/maxmind";

setInterval( () => maxmind.update(), 1000 * 60 * 60 * 4 );

await maxmind.update();

export default class extends App {
    #rpc;

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
