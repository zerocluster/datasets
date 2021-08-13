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
            "path": path + "/GeoLite2-ASN.mmdb",
        },
        "geolite2-city": {
            "name": "GeoLite2-City.mmdb",
            "path": path + "/GeoLite2-City.mmdb",
        },
        "geolite2-country": {
            "name": "GeoLite2-Country.mmdb",
            "path": path + "/GeoLite2-Country.mmdb",
        },
        "datasets": {
            "name": "datasets.sqlite",
            "path": path + "/datasets.sqlite",
        },
        "google-geotargets": {
            "name": "google-geotargets.sqlite",
            "path": path + "/google-geotargets.sqlite",
        },
        "countries.geo.json": {
            "name": "countries.geo.json",
            "path": path + "/countries.geo.json",
        },
        "countries-triangles": {
            "name": "countries-triangles.sqlite",
            "path": path + "/countries-triangles.sqlite",
        },
    },
};

export default CONST;
