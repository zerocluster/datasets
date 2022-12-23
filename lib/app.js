import App from "#core/app";
import resources from "#lib/resources";

export default class extends App {

    // propeties
    get location () {
        return import.meta.url;
    }

    // protected
    async _init () {
        var res;

        res = await super._init();
        if ( !res.ok ) return res;

        return result( 200 );
    }

    async _runThreads () {
        return this.threads.run( {
            "worker": {
                "num": 1,
                "module": new URL( "threads/worker.js", import.meta.url ),
                "arguments": null,
            },
        } );
    }

    async _run () {

        // update datasets on start
        await resources.update();

        // init auto-update timer
        resources.startUpdate();

        // listen for resources update event
        resources.on( "update", this.#onUpdate.bind( this ) );

        return super._run();
    }

    // private
    #onUpdate ( resource ) {
        this.publish( "update", resource.id );

        // each instance of datasets sends events to own clients on update
        this.publish( "rpc/update", resource.id );
    }
}
