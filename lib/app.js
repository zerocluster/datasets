import App from "#core/app";
import resources from "#lib/resources";

export default class extends App {
    constructor () {
        super( import.meta.url, {
            "rpcEnabled": true,
        } );
    }

    async run () {

        // update datasets on start
        await resources.update();

        // init auto-update timer
        resources.startUpdate();

        // listen for resources update event
        resources.on( "update", this.#onUpdate.bind( this ) );

        return super.run();
    }

    // protected
    _initThreads () {
        return {
            "worker": {
                "num": 1,
                "path": new URL( "./threads/worker.js", import.meta.url ),
                "arguments": null,
            },
        };
    }

    // private
    #onUpdate ( dataset ) {
        this.publish( "update", dataset );

        // each instance of datasets sends events to own clients on update
        this.publish( "rpc/update", dataset );
    }
}
