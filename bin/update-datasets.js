#!/usr/bin/env node

import "#core";

import updater from "#lib/updater";

const res = await updater.update( { "force": true } );

if ( !res.ok ) {
    console.log( `Datasets update error.` );

    process.exit( 3 );
}
