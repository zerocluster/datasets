#!/usr/bin/env node

const updater = require( "../lib/updater" );

updater.update().then( () => process.exit() );
