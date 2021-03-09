#!/usr/bin/env node

const maxmind = require( "@softvisio/core/maxmind" );

( async () => {
    setInterval( () => maxmind.update(), 1000 * 60 * 60 * 4 );

    maxmind.update();
} )();
