#!/usr/bin/env node

const maxmind = require( "../lib" );

( async () => {
    if ( process.env.MAXMIND_SKIP_DOWNLOAD ) return;

    const ok = await maxmind.update( true );

    if ( !ok ) {
        console.log( `Maxmind update error.` );

        process.exit( 3 );
    }
} )();
