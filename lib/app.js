import App from "@corejslib/app";

export default class extends App {

    // propeties
    get location () {
        return import.meta.url;
    }

    // protected
    async _startThreads () {
        return this.threads.start( {
            "worker": {
                "numberOfThreads": 1,
                "module": new URL( "threads/worker.js", import.meta.url ),
                "args": null,
            },
        } );
    }
}
