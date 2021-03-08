#!/usr/bin/env node

const maxmind = require( "../lib" );

const CONST = require( "../lib" );

( async () => {

    // start updater

    setInterval( () => maxmind.update(), CONST.updateInterval );

    maxmind.update();
} )();
