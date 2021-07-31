import Events from "#core/events";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "tar";
import Mutex from "#core/threads/mutex";
import env from "#core/env";
import GitHub from "@softvisio/api/github";
import utils from "./utils.js";

import CONST from "#lib/const";

class Index {
    #localIndex;
    #remoteIndex;
    #localIndexUpdated;

    // public
    checkLocalLastModified ( id, date ) {
        const localIndex = this.#getLocalIndex();

        localIndex[id] ||= {};

        if ( localIndex[id].lastModified === date.toISOString() ) {
            return true;
        }
        else {
            return false;
        }
    }

    async checkRemoteLastModified ( id ) {
        const localIndex = this.#getLocalIndex(),
            remoteIndex = await this.#getRemoteIndex();

        localIndex[id] ||= {};
        remoteIndex[id] ||= {};

        if ( localIndex[id].lastModified === remoteIndex[id].lastModified ) {
            return true;
        }
        else {
            return false;
        }
    }

    async setLastModified ( id, date ) {
        const localIndex = this.#getLocalIndex(),
            remoteIndex = await this.#getRemoteIndex();

        localIndex[id] ||= {};
        remoteIndex[id] ||= {};

        if ( !date ) {
            localIndex[id].lastModified = remoteIndex[id].lastModified;

            this.#localIndexUpdated = true;
        }
        else if ( !this.checkLocalLastModified( id, date ) ) {
            localIndex[id].lastModified = date.toISOString();

            this.#localIndexUpdated = true;
        }
    }

    write () {
        if ( !this.#localIndexUpdated ) return;

        fs.writeFileSync( CONST.indexPath, JSON.stringify( this.#localIndex, null, 4 ) );
    }

    async sync ( gitHubToken ) {
        const localIndex = this.#getLocalIndex(),
            remoteIndex = await this.#getRemoteIndex(),
            api = new GitHub( gitHubToken );

        var uploaded;

        for ( const id in remoteIndex ) {
            if ( localIndex[id].lastModified === remoteIndex[id].lastModified ) continue;

            process.stdout.write( `Uploading: ${id} ... ` );

            const tmp = CONST.location + "/" + id + ".tar.gz";

            tar.c( {
                "cwd": CONST.location,
                "gzip": true,
                "sync": true,
                "portable": true,
                "file": tmp,
            },
            [CONST.index[id].name] );

            const res = await utils.uploadAsset( api, tmp );

            fs.rmSync( tmp, { "force": true } );

            console.log( res + "" );

            if ( !res.ok ) return res;

            uploaded = true;
        }

        // upload index
        if ( uploaded ) {
            process.stdout.write( `Uploading: index.json ... ` );

            const res = await utils.uploadAsset( api, CONST.indexPath );

            console.log( res + "" );

            if ( !res.ok ) return res;
        }

        return result( 200 );
    }

    // private
    #getLocalIndex () {
        if ( !this.#localIndex ) {
            if ( fs.existsSync( CONST.indexPath ) ) this.#localIndex = JSON.parse( fs.readFileSync( CONST.indexPath ) );
            else this.#localIndex = {};
        }

        return this.#localIndex;
    }

    async #getRemoteIndex () {
        if ( !this.#remoteIndex ) this.#remoteIndex = await utils.getRemoteIndex();

        return this.#remoteIndex;
    }
}

class Updater extends Events {
    #mutex = new Mutex();
    #userConfig;

    // public
    start ( timeout ) {
        timeout ||= CONST.updateInterval;

        setTimeout( async () => {
            await this.update();

            this.start( timeout );
        }, timeout );
    }

    async update ( options = {} ) {
        if ( !this.#mutex.tryDown() ) return this.#mutex.signal.wait();

        var res = result( 200 );

        // read config
        if ( !this.#userConfig ) this.#userConfig = await env.getUserConfig();
        const maxmindLicenseKey = process.env.APP_MAXMIND_LICENSE_KEY || this.#userConfig.maxmind?.licenseKey;

        const index = new Index();

        for ( const id in CONST.index ) {
            process.stdout.write( `Updating: ${id} ... ` );

            let updated;

            try {
                if ( CONST.index[id].maxmind && maxmindLicenseKey ) {
                    updated = await this.#updateFromMaxmind( id, index, maxmindLicenseKey );
                }
                else {
                    updated = await this.#updateFromRepository( id, index );
                }
            }
            catch ( e ) {
                updated = result.catch( e );
            }

            console.log( updated + "" );

            if ( updated.status !== 304 ) {

                // updated
                if ( updated.ok ) this.emit( "update", id );

                // update error
                else res = updated;
            }
        }

        // write index
        index.write();

        // sync data
        const gitHubToken = process.env.APP_GITHUB_TOKEN || this.#userConfig.github?.token;

        if ( options.sync && gitHubToken ) {
            res = await index.sync( gitHubToken );
        }

        this.#mutex.up();
        this.#mutex.signal.broadcast( res );

        return res;
    }

    // private
    // returns:
    // 200 - updated
    // 304 - not modified
    // 500 - error
    async #updateFromMaxmind ( id, index, maxmindLicenseKey ) {
        const item = CONST.index[id];

        if ( fs.existsSync( item.path ) ) {
            const res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${item.maxmind}&license_key=${maxmindLicenseKey}&suffix=tar.gz`, { "method": "head" } );

            // request error
            if ( !res.ok ) throw res;

            const lastModified = new Date( res.headers.get( "last-modified" ) );

            // not modified
            if ( index.checkLocalLastModified( id, lastModified ) ) return result( 304 );
        }

        // download
        const res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${item.maxmind}&license_key=${maxmindLicenseKey}&suffix=tar.gz`, { "timeout": 30000 } );

        // request error
        if ( !res.ok ) throw res;

        // download and unpack
        await new Promise( resolve => {
            const writable = tar.extract( {
                "cwd": CONST.location,
                "sync": true,
                "filter": ( path, entry ) => path.includes( item.name ),
                "strip": 1,
            } );

            res.body.pipe( writable );

            writable.on( "end", resolve );
        } );

        const lastModified = new Date( res.headers.get( "last-modified" ) );

        await index.setLastModified( id, lastModified );

        return result( 200 );
    }

    // returns:
    // 200 - updated
    // 304 - not modified
    // 500 - error
    async #updateFromRepository ( id, index ) {
        const item = CONST.index[id];

        // not modified
        if ( fs.existsSync( item.path ) && ( await index.checkRemoteLastModified( id ) ) ) return result( 304 );

        const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/${id}.tar.gz`, { "timeout": 30000 } );

        // request error
        if ( !res.ok ) throw res;

        // download and unpack
        await new Promise( resolve => {
            const writable = tar.extract( {
                "cwd": CONST.location,
                "sync": true,
                "filter": ( path, entry ) => path.includes( item.name ),
            } );

            res.body.pipe( writable );

            writable.on( "end", resolve );
        } );

        await index.setLastModified( id );

        return result( 200 );
    }
}

export default new Updater();
