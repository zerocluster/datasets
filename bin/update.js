#!/usr/bin/env node

import Cli from "#core/cli";
import externalResources from "#core/external-resources";

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

externalResources.add( "softvisio-node/geoip-asn/resources/countries.geo.json", import.meta.url );
externalResources.add( "softvisio-node/geoip-asn/resources/datasets", import.meta.url );
externalResources.add( "softvisio-node/geoip-asn/resources/geotargets", import.meta.url );

const res = await externalResources.update( {
    "remote": true,
    "force": process.cli.options.force,
    "silent": false,
} );

if ( !res.ok ) process.exit( 1 );
