import Events from "#core/events";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "tar";
import Mutex from "#core/threads/mutex";
import { getRemoteIndex, getLocalIndex, writeLocalIndex } from "#lib/utils";

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

        for ( const id in CONST.index ) {
            process.stdout.write( `Updating: ${id} ... ` );

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

            console.log( updated + "" );

            if ( updated.status !== 304 ) {

                // updated
                if ( updated.ok ) this.emit( "update", id );

                // update error
                else res = updated;
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
