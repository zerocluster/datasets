const CONST = {
    "repo": "softvisio/softvisio-databases",
    "path": process.platform === "win32" ? process.env.LOCALAPPDATA.replaceAll( "\\", "/" ) + "/databases" : "/var/lib/docker/volumes/databases/_data",
    "updateInterval": 1000 * 60 * 60 * 24,
    "index": {
        "asn": { "name": "GeoLite2-ASN" },
        "city": { "name": "GeoLite2-City" },
        "country": { "name": "GeoLite2-Country" },
    },
};

CONST.indexPath = CONST.path + "/index.json";
CONST.lastUpdatedPath = CONST.path + "/last-updated";

CONST.db = "file:///" + CONST.path + "/data.sqlite";
CONST.dbLocal = "file:///" + CONST.path + "/data-local.sqlite";

export default CONST;
