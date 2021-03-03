const { "default": Reader } = require( "mmdb-lib" );
const fs = require( "fs" );
const updater = require( "./updater" );
const Lru = require( "lru-cache" );

const CONST = require( "./const" );

const CACHE = new Lru( {
    "max": 10000,
} );

const READERS = {};

class Maxmind {
    constructor () {
        updater.on( "update", id => delete READERS[id] );

        setInterval( () => updater.update(), CONST.updateInterval ).unref();

        updater.update();
    }

    get asn () {
        if ( !READERS.asn ) READERS.asn = this.#buildReader( `${CONST.path}/${CONST.index.asn.name}.mmdb` );

        return READERS.asn;
    }

    get city () {
        if ( !READERS.city ) READERS.city = this.#buildReader( `${CONST.path}/${CONST.index.city.name}.mmdb` );

        return READERS.city;
    }

    get country () {
        if ( !READERS.country ) READERS.country = this.#buildReader( `${CONST.path}/${CONST.index.country.name}.mmdb` );

        return READERS.country;
    }

    #buildReader ( path ) {
        return new Reader( fs.readFileSync( path ), { "cache": CACHE } );
    }
}

module.exports = new Maxmind();
