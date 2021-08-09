import App from "#core/app";
import updater from "#lib/updater";

export default class extends App {
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

    // private
    #onUpdate ( dataset ) {
        this.publish( "update", dataset );
        this.publish( "rpc", "update", dataset );
    }
}
