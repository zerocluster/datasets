#!/usr/bin/env node

import Cli from "#core/cli";
import resources from "#lib/resources";

const CLI = {
    "title": "Update datasets",
    "options": {
        "build": {
            "description": "build datasets",
            "default": false,
            "schema": {
                "type": "boolean",
            },
        },
        "force": {
            "description": "ignore DATASETS_DOWNLOAD environment variable",
            "default": false,
            "schema": {
                "type": "boolean",
            },
        },
    },
};

await Cli.parse( CLI );

if ( process.env.DATASETS_DOWNLOAD === "false" && !process.cli.options.build && !process.cli.options.force ) process.exit( 0 );

const res = await resources.update( { "build": process.cli.options.build } );

if ( !res.ok ) {
    console.log( `Datasets update error: ` + res );

    process.exit( 3 );
}
