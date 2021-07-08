import "#core";

import MMDB from "mmdb-lib";
import fs from "fs";
import LRUCache from "lru-cache";

import CONST from "#lib/const";

const CACHE_SIZE = 10000;
const READERS = {};
const WATCHERS = {};

class Maxmind {
    destroy () {

        // destrot fs watchers
        for ( const id in WATCHERS ) {
            WATCHERS[id].close();

            delete WATCHERS[id];
        }

        // destroy mmdb readers
        for ( const id in READERS ) {
            delete READERS[id];
        }
    }

    get asn () {
        if ( !READERS.asn ) this.#initReader( "asn", CONST.index.asn.path );

        return READERS.asn;
    }

    get city () {
        if ( !READERS.city ) this.#initReader( "city", CONST.index.city.path );

        return READERS.city;
    }

    get country () {
        if ( !READERS.country ) this.#initReader( "country", CONST.index.country.path );

        return READERS.country;
    }

    // private
    #initReader ( id, path ) {

        // init watcher
        if ( !WATCHERS[id] ) {
            WATCHERS[id] = fs.watch( path, { "persistent": false } );

            let change;

            WATCHERS[id].on( "change", () => {
                if ( !fs.existsSync( path ) ) return;

                if ( change ) return;

                change = true;

                setTimeout( () => {

                    // drop reader
                    READERS[id] = null;

                    change = false;
                }, 1000 );
            } );
        }

        // init reader
        if ( !READERS[id] ) READERS[id] = this.#getReader( path );
    }

    #getReader ( path ) {
        const cache = new LRUCache( {
            "max": CACHE_SIZE,
        } );

        const reader = new MMDB.default( fs.readFileSync( path ), { cache } );

        return reader;
    }
}

export default new Maxmind();
