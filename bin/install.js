#!/usr/bin/env node

import updater from "#lib/updater";

if ( process.env.DATASETS_DOWNLOAD !== "false" ) {
    const res = await updater.update();

    if ( !res.ok ) {
        console.log( `Datasets update error: ` + res );

        process.exit( 3 );
    }
}
