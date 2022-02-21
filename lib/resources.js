import Resources from "#core/resources";
import env from "#core/env";

import GeoLite2Asn from "#lib/resources/geolite2-asn";
import GeoLite2City from "#lib/resources/geolite2-city";
import GeoLite2Country from "#lib/resources/geolite2-country";
import CountriesGeoJson from "#lib/resources/countries.geo.json";
import Datasets from "#lib/resources/datasets";
import GeoTargets from "#lib/resources/geotargets";

export default new Resources( {
    "location": process.platform === "win32" ? env.getXdgDataDir( "zerocluster-datasets" ) : "/var/lib/docker/volumes/datasets/_data",
    "repository": "zerocluster/datasets",
    "tag": "data",
    "updateInterval": 1000 * 60 * 60 * 4, // 4 hours
    "resources": [GeoLite2Asn, GeoLite2City, GeoLite2Country, CountriesGeoJson, Datasets, GeoTargets],
    "githubToken": null,
} );
