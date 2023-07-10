import Builder from "#core/external-resources/builder";
import fs from "node:fs";

export default class CountriesGeoJson extends Builder {

    // properties
    get id () {
        return "softvisio-node/geoip-asn/resources/countries.geo.json";
    }

    get sourcePath () {
        return super.sourcePath + "/countries.geo.json";
    }

    // prorected
    async _getEtag () {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJson( this.sourcePath );

        const hash = this._getHash().update( JSON.stringify( json ) );

        return result( 200, hash );
    }

    async _build ( location ) {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJson( this.sourcePath );

        fs.writeFileSync( location + "/countries.geo.json", JSON.stringify( json ) );

        return result( 200 );
    }
}
