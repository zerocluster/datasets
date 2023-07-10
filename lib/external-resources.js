import externalResources from "#core/external-resources";
import sql from "#core/sql";
import url from "node:url";
import env from "#core/env";

class ExternalResources {
    #countriesGeoJson = externalResources.add( "zerocluster/datasets/resources/countries.geo.json", import.meta.url );
    #datasets = externalResources.add( "zerocluster/datasets/resources/datasets", import.meta.url );
    #geotargets = externalResources.add( "zerocluster/datasets/resources/geotargets", import.meta.url );
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
            this.#datasetsDbh.close();

            this.#datasetsDbh = await this.#createDbh( this.#datasets, "datasets.sqlite" );
        } );

        this.#geotargetsDbh = await this.#createDbh( this.#geotargets, "geotargets.sqlite" );

        this.#geotargets.on( "update", async () => {
            this.#geotargetsDbh.close();

            this.#geotargetsDbh = await this.#createDbh( this.#geotargets, "geotargets.sqlite" );
        } );

        // cache
        this.#cacheDbh = await sql.new( url.pathToFileURL( env.root + "/data/cache.sqlite" ) );

        const res = await this.#cacheDbh.schema.migrate( new URL( "db", import.meta.url ) );

        if ( !res.ok ) {
            console.log( "Error migrating cache chema: " + res );

            process.exit( 2 );
        }
    }

    // private
    async #createDbh ( resource, file ) {
        const _url = url.pathToFileURL( resource.location + "/" + file );

        _url.searchParams.set( "mode", "ro" );

        return sql.new( _url );
    }
}

export default await new ExternalResources().init();
