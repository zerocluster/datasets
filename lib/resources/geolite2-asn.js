import Resources from "#core/resources";
import fetch from "#core/fetch";
import tar from "#core/tar";

const MAXMIND_ID = "GeoLite2-ASN";

export default class GeoLite2ASN extends Resources.Resource {
    #maxmindLicenseKey;

    // properties
    get id () {
        return "geolite2-asn";
    }

    get files () {
        return [MAXMIND_ID + ".mmdb"];
    }

    get maxmindLicenseKey () {
        this.#maxmindLicenseKey ??= process.env.MAXMIND_LICENSE_KEY || process.env.APP_MAXMIND_LICENSE_KEY || this.userConfig.maxmind?.licenseKey;

        return this.#maxmindLicenseKey;
    }

    get url () {
        return `https://download.maxmind.com/app/geoip_download?edition_id=${MAXMIND_ID}&license_key=${this.maxmindLicenseKey}&suffix=tar.gz`;
    }

    // public
    async getETag () {
        if ( !this.maxmindLicenseKey ) return result( [500, `Maxmind license key not found`] );

        return this._getLastModified( this.url );
    }

    async build ( location ) {
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
