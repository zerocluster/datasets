import externalResources from "#core/external-resources";
import sql from "#core/sql";
import url from "node:url";
import env from "#core/env";
import fs from "node:fs";

const countriesGeoJson = await externalResources.add( "zerocluster/datasets/resources/countries.geo.json" ).check();

const datasets = await externalResources.add( "zerocluster/datasets/resources/datasets" ).check();

const geotargets = await externalResources.add( "softvisio-node/core/resources/google-geotargets" ).check();

class ExternalResources {
    #countriesGeoJson = countriesGeoJson;
    #datasets = datasets;
    #geotargets = geotargets;
    #datasetsDbh;
    #geotargetsDbh;
    #cacheDbh;

    // properties
    get countriesGeoJson () {
        return this.#countriesGeoJson;
    }

    get datasets () {
        return this.#datasets;
    }

    get datasetsDbh () {
        return this.#datasetsDbh;
    }

    get geotargets () {
        return this.#geotargets;
    }

    get geotargetsDbh () {
        return this.#geotargetsDbh;
    }

    get cacheDbh () {
        return this.#cacheDbh;
    }

    // public
    async init () {
        this.#datasetsDbh = await this.#createDbh( this.#datasets, "datasets.sqlite" );

        this.#datasets.on( "update", async () => {
            this.#datasetsDbh.destroy();

            this.#datasetsDbh = await this.#createDbh( this.#datasets, "datasets.sqlite" );
        } );

        this.#geotargetsDbh = await this.#createDbh( this.#geotargets, "google-geotargets.sqlite" );

        this.#geotargets.on( "update", async () => {
            this.#geotargetsDbh.destroy();

            this.#geotargetsDbh = await this.#createDbh( this.#geotargets, "google-geotargets.sqlite" );
        } );

        // cache
        fs.mkdirSync( env.root + "/data/cache", { "recursive": true } );

        this.#cacheDbh = await sql.new( url.pathToFileURL( env.root + "/data/cache/cache.sqlite" ) );

        const res = await this.#cacheDbh.schema.migrate( new URL( "cache-db", import.meta.url ) );

        if ( !res.ok ) {
            console.log( "Error migrating cache chema: " + res );

            process.exit( 2 );
        }

        return this;
    }

    // private
    async #createDbh ( resource, file ) {
        const _url = url.pathToFileURL( resource.location + "/" + file );

        _url.searchParams.set( "mode", "ro" );

        return sql.new( _url );
    }
}

export default await new ExternalResources().init();
