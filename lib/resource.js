import Resources from "#core/resources";
import url from "url";
import fs from "fs";
import fetch from "#core/fetch";
import tar from "#core/tar";

export default class Resource extends Resources.Resource {
    #sourcePath;
    #maxmindLicenseKey;

    // properties
    get sourcePath () {
        this.#sourcePath ??= url.fileURLToPath( new URL( "../resources/sources", import.meta.url ) );

        return this.#sourcePath;
    }

    get maxmindLicenseKey () {
        this.#maxmindLicenseKey ??= process.env.MAXMIND_LICENSE_KEY || process.env.APP_MAXMIND_LICENSE_KEY || this.userConfig.maxmind?.licenseKey;

        return this.#maxmindLicenseKey;
    }

    // protected
    _readJson ( path ) {
        return JSON.parse( fs.readFileSync( path ) );
    }

    async _getMaxmindEtag () {
        if ( !this.maxmindLicenseKey ) return result( [500, `Maxmind license key not found`] );

        return this._getLastModified( this.url );
    }

    async _buildMaxmind ( location ) {
        if ( !this.maxmindLicenseKey ) return result( [500, `Maxmind license key not found`] );

        const res = await fetch( this.url );

        // request error
        if ( !res.ok ) return res;

        // download and unpack
        await new Promise( resolve => {
            const writable = tar.extract( {
                "cwd": location,
                "filter": ( path, entry ) => path.endsWith( ".mmdb" ),
                "strip": 1,
            } );

            res.body.pipe( writable );

            writable.on( "end", resolve );
        } );

        return result( 200 );
    }
}
