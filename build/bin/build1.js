#!/usr/bin/env node

import Cli from "#core/cli";
import { resolve } from "#core/utils";
import glob from "#core/glob";
import fs from "node:fs";
import path from "node:path";
import ExternalResourcesBuilder from "#core/external-resources/builder";
import { readConfig } from "#core/config";

const CLI = {
    "title": "Update resources",
    "options": {
        "force": {
            "description": "Force build",
            "default": false,
            "schema": {
                "type": "boolean",
            },
        },
    },
};

await Cli.parse( CLI );

const id = "softvisio-node/uws/resources";

// find uws location
const cwd = path.dirname( resolve( "uws", import.meta.url ) );

const meta = { "uws": "v" + readConfig( cwd + "/package.json" ).version };

class ExternalResource extends ExternalResourcesBuilder {
    #file;
    #name;

    constructor ( file, name ) {
        super( id + "/" + name );

        this.#file = file;
        this.#name = name;
    }

    async _getEtag () {
        return result( 200, await this._getFileHash( this.#file ) );
    }

    async _build ( location ) {
        fs.copyFileSync( this.#file, location + "/uws.node" );

        return result( 200 );
    }

    async _getMeta () {
        return meta;
    }
}

const ARCHITECTURES = new Set( ["x64"] );

for ( const file of glob( "*.node", { cwd } ) ) {
    const [platform, arch, version] = path.basename( file ).replace( "uws_", "" ).replace( ".node", "" ).split( "_" );

    if ( version !== process.versions.modules || !ARCHITECTURES.has( arch ) ) continue;

    const name = `node-v${version}-${platform}-${arch}.node`;

    const resource = new ExternalResource( cwd + "/" + file, name );

    const res = await resource.build( { "force": process.cli.options.force } );

    if ( !res.ok ) process.exit( 1 );
}
