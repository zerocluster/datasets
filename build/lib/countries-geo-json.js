import childProcess from "node:child_process";
import fs from "node:fs";
import { readConfig } from "#core/config";
import ExternalResourceBuilder from "#core/external-resource-builder";
import fetch from "#core/fetch";
import { TmpDir } from "#core/tmp";
import Zip from "#core/zip";

const sourceUrl = "https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries.zip";

export default class CountriesGeoJson extends ExternalResourceBuilder {
    #tmpDir;
    #version;

    // properties
    get id () {
        return "zerocluster/datasets/resources/countries-geo-json";
    }

    // prorected
    async _getEtag () {
        const res = await this.#download();
        if ( !res.ok ) return res;

        return result( 200, this.#version );
    }

    async _build ( location ) {
        var res;

        res = childProcess.spawnSync( "ogr2ogr -select iso_a2 -f geojson countries.geo.json ne_10m_admin_0_countries.shp", {
            "shell": true,
            "cwd": this.#tmpDir.path,
            "stdio": "inherit",
        } );
        if ( res.status ) return result( 500 );

        const json = await readConfig( this.#tmpDir + "/countries.geo.json" );

        fs.writeFileSync( location + "/countries.geo.json", JSON.stringify( json ) );

        return result( 200 );
    }

    async _getMeta () {
        return result( 200, {
            "version": "v" + this.#version,
        } );
    }

    // private
    async #download () {
        const res = await fetch( sourceUrl );
        if ( !res.ok ) return res;

        const tmpFile = await res.tmpFile();

        this.#tmpDir = new TmpDir();

        const zip = new Zip( tmpFile.path );

        for ( const entry of zip.getEntries() ) {
            if ( !entry.name ) continue;

            fs.writeFileSync( this.#tmpDir + "/" + entry.name, entry.getData() );
        }

        this.#version = fs.readFileSync( this.#tmpDir + "/ne_10m_admin_0_countries.VERSION.txt", "utf8" ).trim();

        return result( 200 );
    }
}
