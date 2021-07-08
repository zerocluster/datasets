#!/usr/bin/env node

import sql from "#core/sql";
import fs from "#core/fs";
import url from "url";

import CONST from "#lib/const";

const dbh = await sql.new( CONST.db );

const root = url.fileURLToPath( new URL( ".", import.meta.url ) );

await _export( "continent" );
await _export( "country" );
await _export( "currency" );
await _export( "language" );
await _export( "timezone" );
await _export( "geotarget" );

async function _export ( name ) {
    fs.config.write( root + `/${name}.json`, ( await dbh.selectAll( `SELECT * FROM "${name}"` ) ).data, { "readable": true } );
}
