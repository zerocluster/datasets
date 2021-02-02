const fs = require( "fs" );
const fetch = require( "node-fetch" );
const EventEmitter = require( "events" );
const maxmind = require( "maxmind" );
const tar = require( "tar" );

const CONST = require( "./const" );

class MaxmindUpdater extends EventEmitter {
    async getIndex () {

        // download index
        try {
            const res = await fetch( `https://bitbucket.org/${CONST.repo}/downloads/index.json` );

            return await res.json();
        }
        catch ( e ) {}
    }

    async update () {
        const idx = await this.getIndex();

        // index download error
        if ( !idx ) return;

        for ( const id in idx ) {
            const name = idx[id].name;
            const file = name + ".mmdb";
            const path = `${CONST.path}/${file}`;
            const tmp = path + ".tar.gz";

            const buildEpoch = await this.#getBuildEpoch( path );

            if ( buildEpoch !== idx[id].buildEpoch ) {
                while ( 1 ) {
                    console.log( `Downloading: ${file}` );

                    try {
                        const res = await fetch( `https://bitbucket.org/${CONST.repo}/downloads/${file}.tar.gz` );

                        // download error, redo
                        if ( !res.ok ) continue;

                        const dest = fs.createWriteStream( tmp );

                        res.body.pipe( dest );

                        await new Promise( resolve => {
                            res.body.on( "error", () => {
                                res.body.destroy();

                                fs.unlinkSync( tmp );

                                resolve();
                            } );

                            res.body.on( "end", () => resolve() );
                        } );

                        // download error, redo
                        if ( !fs.existsSync( tmp ) ) continue;

                        tar.extract( {
                            "cwd": CONST.path,
                            "file": tmp,
                            "sync": true,
                        } );

                        fs.unlinkSync( tmp );

                        this.emit( "update", id );

                        break;
                    }
                    catch ( e ) {

                        // download error, redo
                        continue;
                    }
                }
            }
        }

        console.log( `Maxmind update finished` );

        return true;
    }

    async updateLocal () {
        const os = require( "os" );
        const Bitbucket = require( "@softvisio/core/api/bitbucket" );

        const cfg = fs.existsSync( os.homedir() + "/.softvisio/config.js" ) ? require( os.homedir() + "/.softvisio/config.js" ) : {};

        // check credentials
        if ( !cfg.MAXMIND_LICENSE_KEY || !cfg.BITBUCKET.username || !cfg.BITBUCKET.password ) {
            console.log( `Maxmind or Bitbucket api credentials not found, updating from shared storage` );

            await this.update();

            return;
        }

        const bitbucket = new Bitbucket( {
            "username": cfg.BITBUCKET.username,
            "password": cfg.BITBUCKET.password,
        } );

        var idx = await this.getIndex();
        if ( !idx ) idx = CONST.index;
        else if ( !idx.asn.buildEpoch ) throw `Unable to get remove index`;

        let updated;

        for ( const id in idx ) {
            const name = idx[id].name;
            const file = name + ".mmdb";
            const path = `${CONST.path}/${file}`;
            const tmp = path + ".tar.gz";
            let lastModified;

            // download file
            try {
                process.stdout.write( `Checking: ${name} ... ` );

                let res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${name}&license_key=${cfg.MAXMIND_LICENSE_KEY}&suffix=tar.gz`, { "method": "head" } );

                lastModified = res.headers.get( "last-modified" );

                // content not modified
                if ( lastModified === idx[id].lastModified ) {
                    console.log( "Not Modified" );

                    continue;
                }

                process.stdout.write( `downloading ... ` );

                res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${name}&license_key=${cfg.MAXMIND_LICENSE_KEY}&suffix=tar.gz` );

                const dest = fs.createWriteStream( tmp );

                res.body.pipe( dest );

                const done = await new Promise( resolve => {
                    res.body.on( "error", () => {
                        res.body.destroy();

                        fs.unlinkSync( tmp );

                        resolve( result( 500 ) );
                    } );

                    res.body.on( "end", () => {
                        if ( fs.existsSync( tmp ) ) {
                            process.stdout.write( `extracting ... ` );

                            tar.extract( {
                                "cwd": CONST.path,
                                "file": tmp,
                                "sync": true,
                                "strip": 1,
                                "filter": ( path, entry ) => path.indexOf( ".mmdb" ) !== -1,
                            } );

                            fs.unlinkSync( tmp );

                            resolve( result( 200 ) );
                        }
                    } );
                } );

                console.log( done + "" );
            }
            catch ( e ) {
                console.log( e );
            }

            // upload
            if ( fs.existsSync( path ) && lastModified !== idx[id].lastModified ) {
                idx[id].lastModified = lastModified;
                idx[id].buildEpoch = await this.#getBuildEpoch( path );

                updated = true;

                tar.c( {
                    "cwd": CONST.path,
                    "gzip": true,
                    "sync": true,
                    "portable": true,
                    "file": tmp,
                },
                [file] );

                process.stdout.write( `Uploading: ${file} ... ` );

                const res = await bitbucket.upload( CONST.repo, file + ".tar.gz", tmp );

                console.log( res + "" );

                fs.unlinkSync( tmp );

                // upload error
                if ( !res.ok ) throw res;
            }
        }

        // upload index
        if ( updated ) {
            process.stdout.write( `Uploading: index.json ... ` );

            const path = CONST.path + "/index.json";

            fs.writeFileSync( path, JSON.stringify( idx, null, 4 ) );

            const res = await bitbucket.upload( CONST.repo, "index.json", path );

            fs.unlinkSync( path );

            console.log( res + "" );

            // upload error
            if ( !res.ok ) throw res;
        }

        await this.update();
    }

    async #getBuildEpoch ( path ) {
        if ( !fs.existsSync( path ) ) return;

        const reader = await maxmind.open( path );

        return reader.metadata.buildEpoch.toISOString();
    }
}

module.exports = new MaxmindUpdater();
