import Events from "#core/events";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "tar";
import Mutex from "#core/threads/mutex";
import env from "#core/env";

import CONST from "#lib/const";

class Index {
    #localIndex;
    #remoteIndex;
    #updated;

    // public
    async checkRemoteLastModified ( id ) {}

    async checkLastModified ( id, date ) {
        this.#localIndex[id] ||= {};

        if ( !this.#localIndex[id].lastModified || this.#localIndex[id].lastModified !== date ) {
            return true;
        }
    }

    setLastModified ( id, date ) {
        this.#localIndex[id] ||= {};

        if ( !this.#localIndex[id].lastModified || this.#localIndex[id].lastModified !== date ) {
            this.#localIndex[id].lastModified = date;

            this.#updated = true;
        }
    }

    // XXX
    async sync ( gitHubToken ) {}

    // private
    #getLocalIndex () {}

    async #getRemoteIndex () {
        if ( !this.#remoteIndex ) {

            // download index
            try {
                const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/index.json` );

                if ( !res.ok ) throw res + "";

                return await res.json();
            }
            catch ( e ) {
                return {};
            }
        }

        return this.#remoteIndex;
    }
}

class Updater extends Events {
    #mutex = new Mutex();
    #userConfig;

    // public
    // XXX return result
    // XXX fire: update, target
    async update ( options = {} ) {

        // check last updated
        if ( !options.force ) {
            const lastUpdated = this.#readLastUpdated();

            if ( lastUpdated && new Date() - lastUpdated < CONST.updateInterval ) return result( 204 );
        }

        if ( !this.#mutex.tryDown() ) return this.#mutex.signal.wait();

        var res = result( 200 );

        // read config
        if ( !this.#userConfig ) this.#userConfig = await env.getUserConfig();
        const maxmindLicenseKey = process.env.MAXMIND_LICENSE_KEY || this.#userConfig.maxmind?.licenseKey;

        const index = new Index();

        for ( const id in CONST.index ) {
            process.stdout.write( `Updating: ${id} ... ` );

            let updated;

            if ( CONST.index[id].maxmind && maxmindLicenseKey ) {
                updated = await this.#updateFromMaxmind( id, index, maxmindLicenseKey );
            }
            else {
                updated = await this.#updateFromRepository( id, index );
            }

            console.log( updated + "" );

            // update error
            if ( !updated.ok ) res = updated;

            // updated
            if ( updated.status === 200 ) this.emit( "update", id );
        }

        // sync data
        if ( options.sync && this.#userConfig.github?.token ) {
            await index.sync( this.#userConfig.github.token );
        }

        this.#writeLastUpdated();

        this.#mutex.up();
        this.#mutex.signal.broadcast( res );

        return res;
    }

    // private
    #unpack ( tmp, file, strip ) {
        fs.mkdirSync( CONST.path + "/tmp", { "recursive": true } );

        try {
            tar.extract( {
                "cwd": CONST.path + "/tmp",
                "file": tmp,
                "sync": true,
                strip,
                "filter": ( path, entry ) => path.includes( file ),
            } );

            fs.rmSync( tmp, { "force": true } );
            fs.renameSync( CONST.path + "/tmp/" + file, CONST.path + "/" + file );
            fs.rmSync( CONST.path + "/tmp", { "recursive": true, "force": true } );

            return true;
        }
        catch ( e ) {
            return false;
        }
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

    // returns:
    // 200 - updated
    // 204 - not updated
    // 500 - error
    async #updateFromMaxmind ( id, index, maxmindLicenseKey ) {
        return result( 200 );
    }

    // returns:
    // 200 - updated
    // 204 - not updated
    // 500 - error
    async #updateFromRepository ( id, index ) {
        if ( !( await index.checkRemoteLastModified( id ) ) ) return result( 204 );

        return result( 200 );
    }
}

export default new Updater();
