const maxmind = require( "maxmind" );
const fs = require( "fs" );
const updater = require( "./updater" );

const CONST = require( "./const" );
const READER = {};

class Maxmind {
    constructor () {
        updater.on( "update", id => delete READER[id] );

        setInterval( () => updater.update(), CONST.updateInterval ).unref();

        updater.update();
    }

    get asn () {
        if ( !READER.asn ) {
            const buf = fs.readFileSync( `${CONST.path}/${CONST.db.asn}.mmdb` );

            READER.asn = new maxmind.Reader( buf );
        }

        return READER.asn;
    }

    get city () {
        if ( !READER.city ) {
            const buf = fs.readFileSync( `${CONST.path}/${CONST.db.city}.mmdb` );

            READER.city = new maxmind.Reader( buf );
        }

        return READER.city;
    }

    get country () {
        if ( !READER.country ) {
            const buf = fs.readFileSync( `${CONST.path}/${CONST.db.country}.mmdb` );

            READER.country = new maxmind.Reader( buf );
        }

        return READER.country;
    }
}

module.exports = new Maxmind();
