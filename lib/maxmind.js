import "#core";

import MMDB from "mmdb-lib";
import fs from "fs";
import LRUCache from "lru-cache";
import updater from "./updater.js";

import CONST from "#lib/const";

const CACHE_SIZE = 10000;
const READERS = {};

class Maxmind {
    constructor () {
        updater.on( "update", id => {
            if ( READERS[id] ) READERS[id] = null;
        } );
    }

    destroy () {

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
        const cache = new LRUCache( {
            "max": CACHE_SIZE,
        } );

        READERS[id] = new MMDB.default( fs.readFileSync( path ), { cache } );
    }
}

export default new Maxmind();
