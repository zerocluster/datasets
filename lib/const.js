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
        "geolite2-asn": {
            "name": "GeoLite2-ASN.mmdb",
            "path": location + "/GeoLite2-ASN.mmdb",
            "sync": true,
            "maxmind": "GeoLite2-ASN",
        },
        "geolite2-city": {
            "name": "GeoLite2-City.mmdb",
            "path": location + "/GeoLite2-City.mmdb",
            "sync": true,
            "maxmind": "GeoLite2-City",
        },
        "geolite2-country": {
            "name": "GeoLite2-Country.mmdb",
            "path": location + "/GeoLite2-Country.mmdb",
            "sync": true,
            "maxmind": "GeoLite2-Country",
        },
        "datasets": {
            "name": "datasets.sqlite",
            "path": location + "/datasets.sqlite",
        },
        "google-geotargets": {
            "name": "google-geotargets.sqlite",
            "path": location + "/google-geotargets.sqlite",
        },
        "countries-polygons": {
            "name": "countries-polygons.sqlite",
            "path": location + "/countries-polygons.sqlite",
        },
        "countries-triangles": {
            "name": "countries-triangles.sqlite",
            "path": location + "/countries-triangles.sqlite",
        },
    },
};

export default CONST;
