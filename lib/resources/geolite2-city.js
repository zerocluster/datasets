import Resource from "#lib/resource";

const MAXMIND_ID = "GeoLite2-City";

export default class GeoLite2City extends Resource {

    // properties
    get id () {
        return "geolite2-city";
    }

    get files () {
        return [MAXMIND_ID + ".mmdb"];
    }

    get url () {
        return `https://download.maxmind.com/app/geoip_download?edition_id=${MAXMIND_ID}&license_key=${this.maxmindLicenseKey}&suffix=tar.gz`;
    }

    // public
    async getETag () {
        return this._getMaxmindETag();
    }

    async build ( location ) {
        return this._buildMaxmind( location );
    }
}
