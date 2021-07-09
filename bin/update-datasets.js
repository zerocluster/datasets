#!/usr/bin/env node

import "#core";

import updater from "#lib/updater";

const res = await updater.update( { "sync": true } );

if ( !res.ok ) {
    console.log( `Datasets update error: ` + res );

    process.exit( 3 );
}
