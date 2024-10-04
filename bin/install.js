#!/usr/bin/env node

import Cli from "#core/cli";
import externalResources from "#core/external-resources";

const CLI = {
    "title": "Update resources",
    "options": {
        "force": {
            "description": "Force update",
            "default": false,
            "schema": {
                "type": "boolean",
            },
        },
    },
};

await Cli.parse( CLI );

externalResources.add( "zerocluster/datasets/resources/countries.geo.json" );
externalResources.add( "zerocluster/datasets/resources/datasets" );
externalResources.add( "softvisio-node/core/resources/google-geotargets" );

const res = await externalResources.update( {
    "force": process.cli.options.force,
    "silent": false,
} );

if ( !res.ok ) process.exit( 1 );
