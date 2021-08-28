import Build from "#lib/build";
import fs from "fs";

const SOURCE = "countries.geo.json";

export default class extends Build {

    // protected
    async _getUpdated () {
        const sourcePath = this.sourcesDir + "/" + SOURCE;

        if ( !fs.existsSync( sourcePath ) ) return result( [404, `Source "${SOURCE}" not found`] );

        const json = JSON.parse( fs.readFileSync( sourcePath ) );

        this.hash.update( JSON.stringify( json ) );

        return result( 200, { "hash": this.digest } );
    }

    async _build ( path ) {
        const sourcePath = this.sourcesDir + "/" + SOURCE;

        if ( !fs.existsSync( sourcePath ) ) return result( [404, `Source "${SOURCE}" not found`] );

        const json = JSON.parse( fs.readFileSync( sourcePath ) );

        fs.writeFileSync( path, JSON.stringify( json ) );

        return result( 200 );
    }
}
