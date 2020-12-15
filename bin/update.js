#!/usr/bin/env node

const fetch = require( "@softvisio/core/http/fetch" );
const fs = require( "@softvisio/core/fs" );
const os = require( "os" );
const Bitbucket = require( "@softvisio/core/api/bitbucket" );
const tar = require( "tar" );
const updater = require( "../lib/updater" );

const CONST = require( "../lib/const" );
const cfg = fs.existsSync( os.homedir() + "/.softvisio/config.js" ) ? require( os.homedir() + "/.softvisio/config.js" ) : {};

const bitbucket = new Bitbucket( {
    "username": cfg.BITBUCKET.username,
    "password": cfg.BITBUCKET.password,
} );

( async () => {
    await updater.update();

    for ( const id in CONST.db ) {
        const name = CONST.db[id];
        const hash1 = await getHash( name );

        // download file
        try {
            console.log( `Downloading: ${name}` );

            const res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${name}&license_key=${cfg.MAXMIND_LICENSE_KEY}&suffix=tar.gz` );

            const tmp = CONST.path + name + ".tmp.tar.gz";

            const dest = fs.createWriteStream( tmp );

            res.body.pipe( dest );

            await new Promise( resolve => {
                res.body.on( "error", () => {
                    res.body.destroy();

                    fs.unlinkSync( tmp );

                    resolve();
                } );

                res.body.on( "end", () => {
                    if ( fs.existsSync( tmp ) ) {
                        console.log( `Extracting: ${name}` );

                        tar.extract( {
                            "cwd": CONST.path,
                            "file": tmp,
                            "sync": true,
                            "strip": 1,
                            "filter": ( path, entry ) => path.indexOf( ".mmdb" ) !== -1,
                        } );

                        fs.unlinkSync( tmp );

                        resolve();
                    }
                } );
            } );
        }
        catch ( e ) {
            console.log( e );
        }

        const hash2 = await getHash( name );

        // upload file
        if ( hash1 !== hash2 ) {
            console.log( `Uploading: ${name}` );

            const res = await bitbucket.upload( "softvisio/softvisio-maxmind", `${name}.mmdb`, `${CONST.path}/${name}.mmdb` );

            // upload error
            if ( !res.ok ) throw res;
        }
    }

    const idx = await updater.getIndex();

    // sync local and remote mtime
    for ( const name in idx ) {
        fs.utimesSync( `${CONST.path}/${name}`, idx[name], idx[name] );
    }
} )();

async function getHash ( name ) {
    const path = `${CONST.path}/${name}.mmdb`;

    if ( !fs.existsSync( path ) ) return;

    return await fs.getHash( path, "sha3-512" );
}
