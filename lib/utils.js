import fetch from "#core/fetch";
import File from "#core/file";

import CONST from "#lib/const";

class Utils {
    async getRemoteIndex () {

        // download index
        const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/index.json` );

        if ( !res.ok ) throw res;

        return res.json();
    }

    async uploadAsset ( api, path ) {
        const file = new File( { path } );

        // get release id
        var res = await api.getReleaseByTagName( CONST.repo, CONST.tag );
        if ( !res.ok ) return res;

        const releaseId = res.data.id;

        // get assets
        res = await api.listReleaseAssets( CONST.repo, releaseId );
        if ( !res.ok ) return res;

        // find and remove asset
        for ( const asset of res.data ) {
            if ( asset.name === file.name ) {
                res = await api.deleteReleaseAsset( CONST.repo, asset.id );
                if ( !res.ok ) return res;

                break;
            }
        }

        res = await api.uploadReleaseAsset( CONST.repo, releaseId, file );

        return res;
    }
}

export default new Utils();
