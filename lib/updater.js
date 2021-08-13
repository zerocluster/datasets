import Events from "#core/events";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "tar";
import Mutex from "#core/threads/mutex";

import CONST from "#lib/const";

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

    // XXX write local index
    async update ( options = {} ) {
        if ( !this.#mutex.tryDown() ) return this.#mutex.signal.wait();

        var res = result( 200 );

        for ( const id in CONST.index ) {
            process.stdout.write( `Updating: ${id} ... ` );

            let updated;

            if ( options.build ) {
                const { "default": Builder } = await import( "./build/" + id + ".js" );

                updated = await new Builder().build( id );
            }
            else {
                updated = await this.#updateFromRepository( id );
            }

            console.log( updated + "" );

            if ( updated.status !== 304 ) {

                // updated
                if ( updated.ok ) this.emit( "update", id );

                // update error
                else res = updated;
            }
        }

        // XXX if updated - write local index

        this.#mutex.up();
        this.#mutex.signal.broadcast( res );

        return res;
    }

    // returns:
    // 200 - updated
    // 304 - not modified
    // 500 - error
    async #updateFromRepository ( id, index ) {
        const item = CONST.index[id];

        // not updated
        if ( fs.existsSync( item.path ) && !( await index.checkRemoteUpdated( id ) ) ) return result( 304 );

        const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/${id}.tar.gz`, { "timeout": 30000 } );

        // request error
        if ( !res.ok ) throw res;

        // download and unpack
        await new Promise( resolve => {
            const writable = tar.extract( {
                "cwd": CONST.path,
                "sync": true,
                "filter": ( path, entry ) => path.includes( item.name ),
            } );

            res.body.pipe( writable );

            writable.on( "end", resolve );
        } );

        await index.setUpdated( id );

        return result( 200 );
    }
}

export default new Updater();
