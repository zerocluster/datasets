import App from "#core/app";
import resources from "#lib/resources";

export default class extends App {

    // propeties
    get location () {
        return import.meta.url;
    }

    // protected
    async _init () {
        return result( 200 );
    }

    async _start () {

        // update datasets on start
        await resources.update();

        // init auto-update timer
        resources.startUpdate();

        // listen for resources update event
        resources.on( "update", this.#onUpdate.bind( this ) );

        return result( 200 );
    }

    async _startThreads () {
        return this.threads.start( {
            "worker": {
                "numberOfThreads": 1,
                "module": new URL( "threads/worker.js", import.meta.url ),
                "arguments": null,
            },
        } );
    }

    // private
    #onUpdate ( resource ) {
        this.publish( "update", resource.id );

        // each instance of datasets sends events to own clients on update
        this.publishToRpc( "update", resource.id );
    }
}
