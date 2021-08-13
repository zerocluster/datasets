import MMDB from "mmdb-lib";
import fs from "fs";
import CacheLRU from "#core/cache-lru";
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
            READERS[id] = null;
        }
    }

    get asn () {
        if ( !READERS["geolite2-asn"] ) this.#initReader( "geolite2-asn", CONST.index["geolite2-asn"].name );

        return READERS["geolite2-asn"];
    }

    get city () {
        if ( !READERS["geolite2-city"] ) this.#initReader( "geolite2-city", CONST.index["geolite2-city"].name );

        return READERS["geolite2-city"];
    }

    get country () {
        if ( !READERS["geolite2-country"] ) this.#initReader( "geolite2-country", CONST.index["geolite2-country"].name );

        return READERS["geolite2-country"];
    }

    // private
    #initReader ( id, name ) {
        const cache = new CacheLRU( {
            "maxSize": CACHE_SIZE,
        } );

        READERS[id] = new MMDB.default( fs.readFileSync( CONST.path + "/" + name ), { cache } );
    }
}

export default new Maxmind();
