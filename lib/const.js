import url from "url";

const CONST = {
    "repo": "softvisio/datasets",
    "tag": "data",
    "path": process.platform === "win32" ? process.env.LOCALAPPDATA.replaceAll( "\\", "/" ) + "/softvisio-datasets" : "/var/lib/docker/volumes/datasets/_data",
    "updateInterval": 1000 * 60 * 60 * 8, // 8 hours
    "index": {
        "asn": { "name": "GeoLite2-ASN" },
        "city": { "name": "GeoLite2-City" },
        "country": { "name": "GeoLite2-Country" },
    },
};

CONST.indexPath = CONST.path + "/index.json";
CONST.lastUpdatedPath = CONST.path + "/last-updated";

CONST.db = url.pathToFileURL( CONST.path + "/data.sqlite" );
CONST.dbLocal = url.pathToFileURL( CONST.path + "/data.local.sqlite" );

console.log( CONST );

export default CONST;
