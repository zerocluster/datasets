import Resource from "#lib/resource";
import fs from "fs";

export default class CountriesGeoJSON extends Resource {

    // properties
    get id () {
        return "countries.geo.json";
    }

    get files () {
        return ["countries.geo.json"];
    }

    get sourcePath () {
        return super.sourcePath + "/countries.geo.json";
    }

    // public
    async getETag () {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJSON( this.sourcePath );

        const hash = this._getHash().update( JSON.stringify( json ) );

        return result( 200, hash );
    }

    async build ( location ) {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJSON( this.sourcePath );

        fs.writeFileSync( location + "/" + this.files[0], JSON.stringify( json ) );

        return result( 200 );
    }
}
