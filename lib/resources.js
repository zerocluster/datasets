import Resources from "#core/resources";
import env from "#core/env";

import GeoLite2ASN from "#lib/resources/geolite2-asn";
import GeoLite2City from "#lib/resources/geolite2-city";
import GeoLite2Country from "#lib/resources/geolite2-country";

export default new Resources( {
    "location": process.platform === "win32" ? env.getXDGDataDir( "softvisio-datasets" ) : "/var/lib/docker/volumes/datasets/_data",
    "repo": "softvisio/datasets",
    "tag": "data",
    "updateInterval": 1000 * 60 * 4, // 4 hours
    "resources": [

        //
        new GeoLite2ASN(),
        new GeoLite2City(),
        new GeoLite2Country(),
    ],
} );
