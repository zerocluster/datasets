import externalResources from "#core/external-resources";
import getCountryByCoordinates from "./datasets/get-country-by-coordinates.js";
import getOsmRandomCoordinates from "./datasets/get-osm-random-coordinates.js";
import resources from "./datasets/resources.js";

export default class Datasets {
    #app;
    #config;

    constructor ( app, config ) {
        this.#app = app;
        this.#config = config;
    }

    // properties
    get app () {
        return this.#app;
    }

    get config () {
        return this.#config;
    }

    get resources () {
        return resources;
    }

    get getCountryByCoordinates () {
        return getCountryByCoordinates;
    }

    get getOsmRandomCoordinates () {
        return getOsmRandomCoordinates;
    }

    // protected
    async start () {

        // listen for resources update event
        externalResources.on( "update", this.#onUpdate.bind( this ) );

        const res = await this.app.threads.start( {
            "name": "worker",
            "numberOfThreads": 1,
            "module": new URL( "datasets/worker.js", import.meta.url ),
            "args": null,
        } );
        if ( !res.ok ) return res;

        return result( 200 );
    }

    // private
    #onUpdate ( resource ) {

        // each instance of datasets sends events to own clients on update
        this.app.publishToRpc( "update", resource.name );
    }
}
