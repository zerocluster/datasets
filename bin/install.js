#!/usr/bin/env node

const maxmind = require( "@softvisio/core/maxmind" );

( async () => {
    const ok = await maxmind.update( true );

    if ( !ok ) {
        console.log( `Maxmind update error.` );

        process.exit( 3 );
    }
} )();
