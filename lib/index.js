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
        if ( !READERS.asn ) READERS.asn = updater.getReader( `${CONST.path}/${CONST.index.asn.name}.mmdb`, CACHE );

        return READERS.asn;
    }

    get city () {
        if ( !READERS.city ) READERS.city = updater.getReader( `${CONST.path}/${CONST.index.city.name}.mmdb`, CACHE );

        return READERS.city;
    }

    get country () {
        if ( !READERS.country ) READERS.country = updater.getReader( `${CONST.path}/${CONST.index.country.name}.mmdb`, CACHE );

        return READERS.country;
    }
}

module.exports = new Maxmind();
