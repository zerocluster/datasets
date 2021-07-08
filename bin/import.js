#!/usr/bin/env node

// NOTE download latest database from here: https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1

import sql from "#core/sql";
import fs from "#core/fs";
import url from "url";
import csv from "fast-csv";
import * as uule from "#core/api/google/uule";
import env from "#core/env";
import GitHub from "#core/api/github";
import tar from "tar";
import utils from "#lib/utils";

import CONST from "#lib/const";
const GEOTARGETS = "geotargets-2021-07-01.csv";

const location = url.fileURLToPath( new URL( "../data", import.meta.url ) );

const path = location + "/" + CONST.index.datasets.name;
fs.rmSync( path, { "force": true } );

const dbh = await sql.new( url.pathToFileURL( path ) );

await dbh.loadSchema( new URL( "../lib/db", import.meta.url ) );
var res = await dbh.migrate();
if ( !res.ok ) process.exit( 2 );

await _import( "continents", "continent" );
await _import( "countries", "country" );
await _import( "currencies", "currency" );
await _import( "languages", "language" );
await _import( "timezones", "timezone" );

// import geotargets
const geotargets = [];

await new Promise( resolve => {
    csv.parseFile( location + "/" + GEOTARGETS, { "headers": headers => ["id", "name", "canonical_name", "parent_id", "country", "type", "status"] } )
        .on( "error", error => console.error( error ) )
        .on( "data", row => {
            row.type = row.type.toLowerCase();
            row.status = row.status.toLowerCase();

            row.uule = uule.encode( row.canonical_name );

            geotargets.push( row );
        } )
        .on( "end", rowCount => {
            console.log( `Geotargets: ${rowCount} rows` );

            resolve();
        } );
} );

await dbh.do( sql`INSERT INTO "geotarget"`.VALUES( geotargets ) );

dbh.db.close();

// upload
const config = await env.getUserConfig();
if ( !config.github.token ) {
    console.log( `No GitHub token found` );

    process.exit();
}

const github = new GitHub( config.github.token );

tar.c( {
    "cwd": location,
    "gzip": true,
    "sync": true,
    "portable": true,
    "file": location + "datasets.tar.gz",
},
[CONST.index.datasets.name] );

const remoteIndex = await utils.getRemoteIndex();

process.stdout.write( `Uploading: datasets.tar.gz ... ` );
res = await utils.uploadAsset( github, location + "datasets.tar.gz" );
console.log( res + "" );
if ( !res.ok ) process.exit( 2 );

remoteIndex.datasets.lastModified = new Date();
fs.config.write( location + "index.json", remoteIndex, { "readable": true } );

process.stdout.write( `Uploading: index.json ... ` );
res = await utils.uploadAsset( github, location + "index.json" );
console.log( res + "" );
if ( !res.ok ) process.exit( 2 );

async function _import ( name, table ) {
    const data = fs.config.read( location + name + ".json" );

    await dbh.do( dbh.queryToString( sql`INSERT INTO "__name__"`.VALUES( data ) ).replace( "__name__", table ) );
}
