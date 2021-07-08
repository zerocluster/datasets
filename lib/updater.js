import Events from "#core/events";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "tar";

import CONST from "#lib/const";

class Updater extends Events {

    // public
    // XXX return result
    // XXX fire: update, target
    async update ( options = {} ) {
        await this.#updateFromRepository();

        return result( 200 );
    }

    // private
    async #updateFromRepository () {
        const name = "data";
        const file = name + ".sqlite";
        const path = `${CONST.path}/${file}`;
        const tmp = path + ".tar.gz";

        while ( 1 ) {
            console.log( `Downloading: ${file}` );

            try {
                const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/${file}.tar.gz`, { "timeout": 30000 } );

                // download error, redo
                if ( !res.ok ) continue;

                const dest = fs.createWriteStream( tmp );

                res.body.pipe( dest );

                await new Promise( resolve => {
                    res.body.on( "error", () => {
                        res.body.destroy();

                        fs.rmSync( tmp, { "force": true } );

                        resolve();
                    } );

                    res.body.on( "end", () => resolve() );
                } );

                // download error, redo
                if ( !fs.existsSync( tmp ) ) continue;

                if ( !this.#unpack( tmp, file ) ) continue;

                break;
            }
            catch ( e ) {

                // download error, redo
                continue;
            }
        }

        console.log( `Data update finished` );

        return true;
    }

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
}

export default new Updater();
