import Build from "#lib/build";
import fs from "fs";

const SOURCE = "ne_10m_admin_0_countries.geo.json";

export default class extends Build {

    // protected
    async _getUpdated () {
        const sourcePath = this.dataDir + "/" + SOURCE;

        if ( !fs.existsSync( sourcePath ) ) return result( [400, `Source "${SOURCE}" not found`] );

        const json = JSON.parse( fs.readFileSync( sourcePath ) );

        this.hash.update( JSON.stringify( json ) );

        return result( 200, { "hash": this.digest } );
    }

    async _build ( path ) {
        const sourcePath = this.dataDir + "/" + SOURCE;

        if ( !fs.existsSync( sourcePath ) ) return result( [400, `Source "${SOURCE}" not found`] );

        const json = JSON.parse( fs.readFileSync( sourcePath ) );

        fs.writeFileSync( path, JSON.stringify( json ) );

        return result( 200 );
    }
}
