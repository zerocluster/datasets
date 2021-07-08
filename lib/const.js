import url from "url";
import fs from "fs";

const location = process.platform === "win32" ? process.env.LOCALAPPDATA.replaceAll( "\\", "/" ) + "/softvisio-datasets" : "/var/lib/docker/volumes/datasets/_data";

if ( !fs.existsSync( location ) ) fs.mkdirSync( location, { "recursive": true } );

const CONST = {
    "repo": "softvisio/datasets",
    "tag": "data",
    "updateInterval": 1000 * 60 * 60 * 8, // 8 hours
    location,
    "indexPath": location + "/index.json",
    "lastUpdatedPath": location + "/last-updated",
    "localDatasetsLocation": url.pathToFileURL( location + "/datasets.local.sqlite" ),
    "index": {
        "asn": {
            "maxmind": true,
            "sync": true,
            "name": "GeoLite2-ASN",
            "path": location + "/GeoLite2-ASN.mmdb",
        },
        "city": {
            "maxmind": true,
            "sync": true,
            "name": "GeoLite2-City",
            "path": location + "/GeoLite2-City.mmdb",
        },
        "country": {
            "maxmind": true,
            "sync": true,
            "name": "GeoLite2-Country",
            "path": location + "/GeoLite2-Country.mmdb",
        },
        "datasets": {
            "path": location + "/datasets.sqlite",
            "location": url.pathToFileURL( location + "/datasets.sqlite" ),
        },
    },
};

export default CONST;
