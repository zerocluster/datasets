#!/usr/bin/env node

import Cli from "#core/cli";
import updater from "#lib/updater";

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
    },
};

await Cli.parse( CLI );

if ( process.env.DATASETS_DOWNLOAD === "false" ) process.exit( 0 );

const res = await updater.update( { "build": process.cli.options.build } );

if ( !res.ok ) {
    console.log( `Datasets update error: ` + res );

    process.exit( 3 );
}
