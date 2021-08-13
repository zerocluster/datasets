import Build from "#lib/build";

const ID = "GeoLite2-ASN";

export default class extends Build {

    // protected
    async _getUpdated () {
        return this._checkMaxMind( ID );
    }

    async _build ( path ) {
        return this._downloadMaxmind( ID );
    }
}
