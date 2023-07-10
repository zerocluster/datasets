import ExternalResourceBuilder from "#core/external-resources/builder";
import fs from "node:fs";
import url from "node:url";
import { readConfig } from "#core/config";

const SOURCE_PATH = url.fileURLToPath( new URL( "../../resources/sources", import.meta.url ) );

export default class CountriesGeoJson extends ExternalResourceBuilder {

    // properties
    get id () {
        return "softvisio-node/geoip-asn/resources/countries.geo.json";
    }

    get sourcePath () {
        return SOURCE_PATH + "/countries.geo.json";
    }

    // prorected
    async _getEtag () {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = readConfig( this.sourcePath );

        const hash = this._getHash().update( JSON.stringify( json ) );

        return result( 200, hash );
    }

    async _build ( location ) {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = readConfig( this.sourcePath );

        fs.writeFileSync( location + "/countries.geo.json", JSON.stringify( json ) );

        return result( 200 );
    }
}
