import Resource from "#lib/resource";

const MAXMIND_ID = "GeoLite2-ASN";

export default class GeoLite2Asn extends Resource {

    // properties
    get id () {
        return "geolite2-asn";
    }

    get files () {
        return [MAXMIND_ID + ".mmdb"];
    }

    get url () {
        return `https://download.maxmind.com/app/geoip_download?edition_id=${MAXMIND_ID}&license_key=${this.maxmindLicenseKey}&suffix=tar.gz`;
    }

    // public
    async getEtag () {
        return this._getMaxmindEtag();
    }

    async build ( location ) {
        return this._buildMaxmind( location );
    }
}
