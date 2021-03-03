#!/usr/bin/env node

const updater = require( "../lib/updater" );

( async () => {
    const ok = await updater.update( true );

    if ( !ok ) {
        console.log( `Maxmind update error.` );

        process.exit( 3 );
    }
} )();
