#!/usr/bin/env node

const updater = require( "../lib/updater" );

( async () => {
    const ok = await updater.update();

    if ( !ok ) process.exit( 3 );
} )();
