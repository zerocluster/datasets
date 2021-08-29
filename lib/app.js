import App from "#core/app";
import resources from "#lib/resources";

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
        await resources.update();

        // init auto-update timer
        resources.startUpdate();

        // listen for resources update event
        resources.on( "update", this.#onUpdate.bind( this ) );

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
