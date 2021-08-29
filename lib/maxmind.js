import MMDB from "mmdb-lib";
import fs from "fs";
import CacheLRU from "#core/cache-lru";
import resources from "#lib/resources";

const CACHE_SIZE = 10000;
const READERS = {};

class Maxmind {
    constructor () {
        resources.on( "update", id => {
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
        if ( !READERS["geolite2-asn"] ) this.#initReader( "geolite2-asn", resources.get( "geolite2-asn" ).files[0] );

        return READERS["geolite2-asn"];
    }

    get city () {
        if ( !READERS["geolite2-city"] ) this.#initReader( "geolite2-city", resources.get( "geolite2-city" ).files[0] );

        return READERS["geolite2-city"];
    }

    get country () {
        if ( !READERS["geolite2-country"] ) this.#initReader( "geolite2-country", resources.get( "geolite2-country" ).files[0] );

        return READERS["geolite2-country"];
    }

    // private
    #initReader ( id, name ) {
        const cache = new CacheLRU( {
            "maxSize": CACHE_SIZE,
        } );

        READERS[id] = new MMDB.default( fs.readFileSync( resources.location + "/" + name ), { cache } );
    }
}

export default new Maxmind();
