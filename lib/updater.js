const fs = require( "fs" );
const fetch = require( "node-fetch" );
const EventEmitter = require( "events" );
const maxmind = require( "maxmind" );

const CONST = require( "./const" );

class MaxmindUpdater extends EventEmitter {
    async getIndex () {

        // download index
        try {
            const res = await fetch( `https://bitbucket.org/${CONST.repo}/downloads/index.json` );

            if ( !res.ok ) {
                if ( res.status === 404 ) return CONST.index;

                return;
            }

            return await res.json();
        }
        catch ( e ) {}
    }

    async update () {
        const idx = await this.getIndex();

        // index download error
        if ( !idx ) return;

        for ( const id in idx ) {
            const file = idx[id].name + ".mmdb";
            const path = `${CONST.path}/${file}`;
            const tmp = path + ".tmp";

            const buildEpoch = await this.#getBuildEpoch( path );

            if ( buildEpoch !== idx[id].buildEpoch ) {
                console.log( `Downloading: ${file}` );

                try {
                    const res = await fetch( `https://bitbucket.org/${CONST.repo}/downloads/${file}` );

                    if ( !res.ok ) return;

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

                    // download error
                    if ( !fs.existsSync( tmp ) ) return;

                    fs.renameSync( tmp, path );

                    this.emit( "update", id );
                }
                catch ( e ) {
                    console.log( e );

                    // download error
                    return;
                }
            }
        }

        return true;
    }

    async updateLocal () {
        const os = require( "os" );
        const Bitbucket = require( "@softvisio/core/api/bitbucket" );
        const tar = require( "tar" );

        const cfg = fs.existsSync( os.homedir() + "/.softvisio/config.js" ) ? require( os.homedir() + "/.softvisio/config.js" ) : {};

        const bitbucket = new Bitbucket( {
            "username": cfg.BITBUCKET.username,
            "password": cfg.BITBUCKET.password,
        } );

        const idx = await this.getIndex();
        if ( !idx ) throw `Unable to get remove index`;

        let updated;

        for ( const id in idx ) {
            const name = idx[id].name;
            const file = name + ".mmdb";
            const path = `${CONST.path}/${file}`;
            const tmp = path + ".tar.gz";

            // download file
            try {
                console.log( `Downloading: ${name}` );

                const res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${name}&license_key=${cfg.MAXMIND_LICENSE_KEY}&suffix=tar.gz` );

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

            // update index
            if ( fs.existsSync( path ) ) {
                const buildEpoch = await this.#getBuildEpoch( path );

                if ( buildEpoch !== idx[id].buildEpoch ) {
                    console.log( `Uploading: ${file}` );

                    const res = await bitbucket.upload( CONST.repo, file, path );

                    // upload error
                    if ( !res.ok ) throw res;

                    updated = true;

                    idx[id].buildEpoch = buildEpoch;
                }
            }
        }

        // upload index
        if ( updated ) {
            console.log( `Uploading: index.json` );

            const path = CONST.path + "/index.json";

            fs.writeFileSync( path, JSON.stringify( idx, null, 4 ) );

            const res = await bitbucket.upload( CONST.repo, "index.json", path );

            fs.unlinkSync( path );

            // upload error
            if ( !res.ok ) throw res;
        }
    }

    async #getBuildEpoch ( path ) {
        if ( !fs.existsSync( path ) ) return;

        const reader = await maxmind.open( path );

        return reader.metadata.buildEpoch.toISOString();
    }
}

module.exports = new MaxmindUpdater();
