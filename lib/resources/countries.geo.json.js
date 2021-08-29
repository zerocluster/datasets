import Resources from "#core/resources";
import fs from "fs";
import url from "url";

export default class CountriesGeoJSON extends Resources.Resource {

    // properties
    get id () {
        return "countries.geo.json";
    }

    get files () {
        return ["countries.geo.json"];
    }

    get sourcePath () {
        return url.fileURLToPath( new URL( "../../sources/countries.geo.json", import.meta.url ) );
    }

    // public
    async getETag () {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = JSON.parse( fs.readFileSync( this.sourcePath ) );

        const hash = this._getHash().update( JSON.stringify( json ) );

        return result( 200, hash );
    }

    async build ( tmp ) {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = JSON.parse( fs.readFileSync( this.sourcePath ) );

        fs.writeFileSync( tmp.path + "/" + this.files[0], JSON.stringify( json ) );

        return result( 200 );
    }
}
