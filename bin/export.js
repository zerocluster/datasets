#!/usr/bin/env node

import sql from "#core/sql";
import fs from "fs";
import url from "url";
import tar from "tar";
import fetch from "#core/fetch";
import config from "#core/config";

import CONST from "#lib/const";

const location = url.fileURLToPath( new URL( "../data", import.meta.url ) );
if ( !fs.existsSync( location ) ) fs.mkdirSync( location, { "recursive": true } );

const path = location + "/" + CONST.index.datasets.name;
fs.rmSync( path, { "force": true } );

// download and unpack
process.stdout.write( `Downloading: datasets.tar.gz ... ` );

var res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/datasets.tar.gz`, { "timeout": 30000 } );

// request error
if ( !res.ok ) {
    console.log( res + "" );

    process.exit( 2 );
}

await new Promise( resolve => {
    const writable = tar.extract( {
        "cwd": location,
        "sync": true,
        "filter": ( path, entry ) => path.includes( "datasets.sqlite" ),
    } );

    res.body.pipe( writable );

    writable.on( "end", resolve );
} );

const dbh = await sql.new( url.pathToFileURL( path ) );

// export
await _export( "continents", "continent" );
await _export( "countries", "country" );
await _export( "currencies", "currency" );
await _export( "languages", "language" );
await _export( "timezones", "timezone" );

dbh.db.close();

async function _export ( name, table ) {
    config.write( location + `/${name}.json`, ( await dbh.select( `SELECT * FROM "${table}"` ) ).data, { "readable": true } );
}
