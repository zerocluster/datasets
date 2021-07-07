#!/usr/bin/env node

import "#core";

import maxmind from "#lib/maxmind";

const ok = await maxmind.update( { "force": true } );

if ( !ok ) {
    console.log( `Maxmind update error.` );

    process.exit( 3 );
}
