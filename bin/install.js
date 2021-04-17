#!/usr/bin/env node

import maxmind from "@softvisio/core/maxmind";

const ok = await maxmind.update( { "force": true } );

if ( !ok ) {
    console.log( `Maxmind update error.` );

    process.exit( 3 );
}
