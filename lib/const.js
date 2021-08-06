import url from "url";
import fs from "fs";
import env from "#core/env";

const location = process.platform === "win32" ? env.getXDGDataDir( "softvisio-datasets" ) : "/var/lib/docker/volumes/datasets/_data";

if ( !fs.existsSync( location ) ) fs.mkdirSync( location, { "recursive": true } );

const CONST = {
    "repo": "softvisio/datasets",
    "tag": "data",
    "updateInterval": 1000 * 60 * 60 * 4, // 4 hours
    location,
    "indexPath": location + "/index.json",
    "localDatasetsLocation": url.pathToFileURL( location + "/datasets.local.sqlite" ),
    "index": {
        "asn": {
            "name": "GeoLite2-ASN.mmdb",
            "path": location + "/GeoLite2-ASN.mmdb",
            "sync": true,
            "maxmind": "GeoLite2-ASN",
        },
        "city": {
            "name": "GeoLite2-City.mmdb",
            "path": location + "/GeoLite2-City.mmdb",
            "sync": true,
            "maxmind": "GeoLite2-City",
        },
        "country": {
            "name": "GeoLite2-Country.mmdb",
            "path": location + "/GeoLite2-Country.mmdb",
            "sync": true,
            "maxmind": "GeoLite2-Country",
        },
        "datasets": {
            "name": "datasets.sqlite",
            "path": location + "/datasets.sqlite",
            "location": url.pathToFileURL( location + "/datasets.sqlite" ),
        },
        "countries.geo.json": {
            "name": "countries.geo.json",
            "path": location + "/countries.geo.json",
            "location": url.pathToFileURL( location + "/countries.geo.json" ),
        },
    },
};

export default CONST;
