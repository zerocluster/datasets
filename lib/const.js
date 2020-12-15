const os = require( "os" );
const fs = require( "fs" );

const CONST = {
    "repo": "softvisio/softvisio-maxmind",
    "path": os.homedir() + "/.softvisio/maxmind",
    "updateInterval": 1000 * 60 * 60 * 24,
    "db": {
        "asn": "GeoLite2-ASN",
        "city": "GeoLite2-City",
        "country": "GeoLite2-Country",
    },
};

if ( !fs.existsSync( CONST.path ) ) fs.mkdirSync( CONST.path, { "recursive": true } );

module.exports = CONST;
