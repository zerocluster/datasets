const os = require( "os" );
const fs = require( "fs" );
const fetch = require( "node-fetch" );
const EventEmitter = require( "events" );
const maxmind = require( "maxmind" );
const tar = require( "tar" );

const CONST = require( "./const" );

class MaxmindUpdater extends EventEmitter {
    async update ( force ) {
        if ( !force ) {
            const lastUpdated = this.#readLastUpdated();

            if ( lastUpdated && new Date() - lastUpdated < CONST.updateInterval ) return;
        }

        this.#writeLastUpdated();

        // read config
        const cfg = fs.existsSync( os.homedir() + "/.softvisio/config.js" ) ? require( os.homedir() + "/.softvisio/config.js" ) : {};

        // update from maxmind
        if ( cfg.MAXMIND_LICENSE_KEY ) {
            let res = await this.#updateFromMaxmind( cfg.MAXMIND_LICENSE_KEY );

            if ( !res.ok ) return false;

            // sync local index with repository
            if ( cfg.BITBUCKET.username && cfg.BITBUCKET.password ) {
                res = await this.#syncRepository( cfg.BITBUCKET.username, cfg.BITBUCKET.password );

                if ( !res.ok ) return false;
            }

            return true;
        }

        // update from repository
        else {
            return await this.#updateFromRepository();
        }
    }

    async #updateFromMaxmind ( MAXMIND_LICENSE_KEY ) {
        require( "@softvisio/core" );

        const idx = this.#readIndex();

        for ( const id in idx ) {
            const name = idx[id].name;
            const file = name + ".mmdb";
            const path = `${CONST.path}/${file}`;
            const tmp = path + ".tar.gz";
            let lastModified;

            // download file
            try {
                process.stdout.write( `Checking: ${name} ... ` );

                let res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${name}&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz`, { "method": "head" } );

                lastModified = res.headers.get( "last-modified" );

                // content not modified
                if ( lastModified === idx[id].lastModified ) {
                    console.log( "Not Modified" );

                    continue;
                }

                process.stdout.write( `downloading ... ` );

                res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${name}&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz` );

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

                if ( done.ok ) {
                    idx[id].lastModified = lastModified;
                    idx[id].buildEpoch = await this.#getBuildEpoch( path );

                    this.#writeIndex( idx );
                }

                console.log( done + "" );
            }
            catch ( e ) {
                return result( [500, e.message] );
            }
        }

        return result( 200 );
    }

    async #syncRepository ( username, password ) {
        const Bitbucket = require( "@softvisio/core/api/bitbucket" );

        const bitbucket = new Bitbucket( { username, password } );

        var updated;

        const remoteIndex = ( await this.#downloadIndex() ) || {},
            localIndex = this.#readIndex();

        for ( const id in localIndex ) {
            const name = localIndex[id].name;
            const file = name + ".mmdb";
            const path = `${CONST.path}/${file}`;
            const tmp = path + ".tar.gz";

            process.stdout.write( `Uploading: ${file} ... ` );

            if ( !remoteIndex[id] ) {
                remoteIndex[id] = {
                    "name": localIndex[id].name,
                };
            }

            if ( localIndex[id].buildEpoch !== remoteIndex[id].buildEpoch ) {
                tar.c( {
                    "cwd": CONST.path,
                    "gzip": true,
                    "sync": true,
                    "portable": true,
                    "file": tmp,
                },
                [file] );

                const res = await bitbucket.upload( CONST.repo, file + ".tar.gz", tmp );

                console.log( res + "" );

                fs.unlinkSync( tmp );

                if ( !res.ok ) throw res;

                updated = true;
            }
            else {
                console.log( "Not Modified" );
            }
        }

        // upload index
        if ( updated ) {
            process.stdout.write( `Uploading: index.json ... ` );

            const res = await bitbucket.upload( CONST.repo, "index.json", CONST.indexPath );

            console.log( res + "" );

            // upload error
            if ( !res.ok ) throw res;
        }

        return result( 200 );
    }

    async #updateFromRepository () {
        const remoteIndex = await this.#downloadIndex(),
            localIndex = this.#readIndex();

        // unable to download remote index
        if ( !remoteIndex ) return false;

        for ( const id in remoteIndex ) {
            if ( !localIndex[id] || localIndex[id].buildEpoch !== remoteIndex[id].buildEpoch ) {
                const name = remoteIndex[id].name;
                const file = name + ".mmdb";
                const path = `${CONST.path}/${file}`;
                const tmp = path + ".tar.gz";

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

                        localIndex[id] = remoteIndex[id];

                        this.#writeIndex( localIndex );

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

    #readLastUpdated () {
        if ( fs.existsSync( CONST.lastUpdatedPath ) ) {
            try {
                return new Date( fs.readFileSync( CONST.lastUpdatedPath ) );
            }
            catch ( e ) {}
        }
    }

    #writeLastUpdated () {
        fs.writeFileSync( CONST.lastUpdatedPath, new Date().toISOString() );
    }

    #readIndex () {
        if ( fs.existsSync( CONST.indexPath ) ) return JSON.parse( fs.readFileSync( CONST.indexPath ) );
        else return JSON.parse( JSON.stringify( CONST.index ) );
    }

    #writeIndex ( index ) {
        fs.writeFileSync( CONST.indexPath, JSON.stringify( index, null, 4 ) );
    }

    async #downloadIndex () {

        // download index
        try {
            const res = await fetch( `https://bitbucket.org/${CONST.repo}/downloads/index.json` );

            return await res.json();
        }
        catch ( e ) {}
    }

    async #getBuildEpoch ( path ) {
        if ( !fs.existsSync( path ) ) return;

        const reader = await maxmind.open( path );

        return reader.metadata.buildEpoch.toISOString();
    }
}

module.exports = new MaxmindUpdater();
