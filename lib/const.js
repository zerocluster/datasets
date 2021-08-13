import fs from "fs";
import env from "#core/env";

const path = process.platform === "win32" ? env.getXDGDataDir( "softvisio-datasets" ) : "/var/lib/docker/volumes/datasets/_data";

if ( !fs.existsSync( path ) ) fs.mkdirSync( path, { "recursive": true } );

const CONST = {
    "repo": "softvisio/datasets",
    "tag": "data",
    "updateInterval": 1000 * 60 * 60 * 4, // 4 hours
    path,
    "indexPath": path + "/index.json",
    "index": {
        "geolite2-asn": {
            "name": "GeoLite2-ASN.mmdb",
        },
        "geolite2-city": {
            "name": "GeoLite2-City.mmdb",
        },
        "geolite2-country": {
            "name": "GeoLite2-Country.mmdb",
        },
        "datasets": {
            "name": "datasets.sqlite",
        },
        "google-geotargets": {
            "name": "google-geotargets.sqlite",
        },
        "countries.geo.json": {
            "name": "countries.geo.json",
        },
        "countries-triangles": {
            "name": "countries-triangles.sqlite",
        },
    },
};

export default CONST;
