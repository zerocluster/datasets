import App from "#core/app";
import externalResources from "#core/external-resources";

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

        // listen for resources update event
        externalResources.on( "update", this.#onUpdate.bind( this ) );

        return result( 200 );
    }

    async _startThreads () {
        return this.threads.start( {
            "worker": {
                "numberOfThreads": 1,
                "module": new URL( "threads/worker.js", import.meta.url ),
                "args": null,
            },
        } );
    }

    // private
    #onUpdate ( resource ) {

        // each instance of datasets sends events to own clients on update
        this.publishToRpc( "update", resource.name );
    }
}
