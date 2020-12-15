const fs = require( "fs" );
const fetch = require( "node-fetch" );
const EventEmitter = require( "events" );

const CONST = require( "./const" );

class MaxmindUpdater extends EventEmitter {
    async getIndex () {
        var idx;

        // download index
        try {
            const res = await fetch( `https://api.bitbucket.org/2.0/repositories/${CONST.repo}/downloads` );

            idx = Object.fromEntries( ( await res.json() ).values.map( row => [row.name, new Date( row.created_on )] ) );
        }
        catch ( e ) {
            console.log( e );

            return;
        }

        return idx;
    }

    async update () {
        const idx = await this.getIndex();

        for ( const id in CONST.db ) {
            const name = CONST.db[id] + ".mmdb";
            const remoteMtime = idx[name];
            const path = `${CONST.path}/${name}`;
            const tmp = `${path}.${process.pid}.tmp`;

            const localMtime = fs.existsSync( path ) ? new Date( fs.statSync( path ).mtime ) : null;

            if ( localMtime - remoteMtime !== 0 ) {
                console.log( `Downloading: ${name}` );

                try {
                    const res = await fetch( `https://bitbucket.org/softvisio/softvisio-maxmind/downloads/${name}` );

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

                    if ( fs.existsSync( tmp ) ) {
                        fs.utimesSync( tmp, remoteMtime, remoteMtime );

                        fs.renameSync( tmp, path );

                        this.emit( "update", id );
                    }
                }
                catch ( e ) {}
            }
        }
    }
}

module.exports = new MaxmindUpdater();
