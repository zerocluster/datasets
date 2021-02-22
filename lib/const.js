const os = require( "os" );
const fs = require( "fs" );

const CONST = {
    "repo": "softvisio/softvisio-maxmind",
    "path": os.homedir() + "/.softvisio/maxmind",
    "updateInterval": 1000 * 60 * 60 * 24,
    "index": {
        "asn": { "name": "GeoLite2-ASN" },
        "city": { "name": "GeoLite2-City" },
        "country": { "name": "GeoLite2-Country" },
    },
};

CONST.indexPath = CONST.path + "/index.json";

if ( !fs.existsSync( CONST.path ) ) fs.mkdirSync( CONST.path, { "recursive": true } );

module.exports = CONST;
