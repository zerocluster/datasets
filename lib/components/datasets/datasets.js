import externalResources from "#core/external-resources";
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

    // protected
    async _start () {

        // listen for resources update event
        externalResources.on( "update", this.#onUpdate.bind( this ) );

        return result( 200 );
    }

    // private
    #onUpdate ( resource ) {

        // each instance of datasets sends events to own clients on update
        this.app.publishToRpc( "update", resource.name );
    }
}
