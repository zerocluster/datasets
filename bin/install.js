#!/usr/bin/env node

import "#core";

import updater from "#lib/updater";

if ( process.env.DATASETS_DOWNLOAD !== "false" ) {
    const res = await updater.update( { "force": true } );

    if ( !res.ok ) {
        console.log( `Datasets update error: ` + res );

        process.exit( 3 );
    }
}
