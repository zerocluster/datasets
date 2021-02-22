#!/usr/bin/env node

const updater = require( "../lib/updater" );

( async () => {
    await updater.update();
} )();
