import Resources from "#core/resources";
import env from "#core/env";

import GeoLite2ASN from "#lib/resources/geolite2-asn";
import GeoLite2City from "#lib/resources/geolite2-city";
import GeoLite2Country from "#lib/resources/geolite2-country";
import CountriesGeoJSON from "#lib/resources/countries.geo.json";
import CountriesTriangles from "#lib/resources/countries-triangles";
import Datasets from "#lib/resources/datasets";
import GoogleGeoTargets from "#lib/resources/google-geotargets";

export default new Resources( {
    "location": process.platform === "win32" ? env.getXDGDataDir( "softvisio-datasets" ) : "/var/lib/docker/volumes/datasets/_data",
    "repo": "softvisio/datasets",
    "tag": "data",
    "updateInterval": 1000 * 60 * 60 * 4, // 4 hours
    "resources": [GeoLite2ASN, GeoLite2City, GeoLite2Country, CountriesGeoJSON, CountriesTriangles, Datasets, GoogleGeoTargets],
} );
