#!/usr/bin/env node

import maxmind from "#lib/maxmind";
import updater from "#lib/updater";

var ok = await maxmind.update( { "force": true } );

if ( !ok ) {
    console.log( `Maxmind update error.` );

    process.exit( 3 );
}

ok = await updater.update( { "force": true } );

if ( !ok ) {
    console.log( `Data update error.` );

    process.exit( 3 );
}
