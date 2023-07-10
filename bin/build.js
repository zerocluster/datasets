#!/usr/bin/env node

import Cli from "#lib/cli";
import CountriesGeoJson from "#lib/external-resources/countries.geo.json";
import Datasets from "#lib/external-resources/datasets";
import Geotargets from "#lib/external-resources/geotargets";

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

var res;

res = await new CountriesGeoJson().build( { "force": process.cli.options.force } );
if ( !res.ok ) process.exit( 1 );

res = await new Datasets().build( { "force": process.cli.options.force } );
if ( !res.ok ) process.exit( 1 );

res = await new Geotargets().build( { "force": process.cli.options.force } );
if ( !res.ok ) process.exit( 1 );
