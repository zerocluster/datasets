import Events from "#core/events";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "tar";
import Mutex from "#core/threads/mutex";
import { getRemoteIndex, getLocalIndex, writeLocalIndex } from "#lib/utils";
import ansi from "#core/text/ansi";

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

    async update ( options = {} ) {
        if ( !this.#mutex.tryDown() ) return this.#mutex.signal.wait();

        var res = result( 200 ),
            remoteIndex,
            localIndex;

        const maxLength = Object.keys( CONST.index ).reduce( ( val, name ) => {
            if ( name.length > val ) val = name.length;

            return val;
        }, 0 );

        for ( const id in CONST.index ) {
            process.stdout.write( `Updating "${id}" `.padEnd( maxLength + 15 ) );

            let updated;

            if ( options.build ) {
                const { "default": Builder } = await import( "./build/" + id + ".js" );

                updated = await new Builder().build( id );
            }
            else {
                remoteIndex ??= await getRemoteIndex();
                localIndex ??= getLocalIndex();

                updated = await this.#updateFromRepository( id, remoteIndex, localIndex );
            }

            // not modified
            if ( updated.status === 304 ) {
                console.log( " " + updated.statusText + " " );
            }

            // source not found
            else if ( updated.status === 404 ) {
                console.log( " " + updated.statusText + " " );
            }
            else {

                // updated
                if ( updated.ok ) {
                    console.log( ansi.ok( " " + updated.statusText + " " ) );

                    this.emit( "update", id );
                }

                // error
                else {
                    console.log( ansi.error( " " + updated.statusText + " " ) );

                    res = updated;
                }
            }
        }

        this.#mutex.up();
        this.#mutex.signal.broadcast( res );

        return res;
    }

    async #updateFromRepository ( id, remoteIndex, localIndex ) {
        const item = CONST.index[id];

        // not updated
        if ( fs.existsSync( CONST.path + "/" + item.name ) && ( ( remoteIndex[id]?.hash && remoteIndex[id].hash === localIndex[id]?.hash ) || ( remoteIndex[id]?.lastModified && remoteIndex[id].lastModified === localIndex[id]?.lastModified ) ) ) return result( 304 );

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

        localIndex[id] ||= {};
        if ( remoteIndex[id].hash ) localIndex[id].hash = remoteIndex[id].hash;
        else if ( remoteIndex[id].lastModified ) localIndex[id].lastModified = remoteIndex[id].lastModified;

        writeLocalIndex( localIndex );

        return result( 200 );
    }
}

export default new Updater();
