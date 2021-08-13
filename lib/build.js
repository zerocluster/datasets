import "#core/stream";
import CONST from "#lib/const";
import GitHub from "@softvisio/api/github";
import env from "#core/env";
import tar from "tar";
import crypto from "crypto";
import url from "url";
import fs from "fs";
import fetch from "#core/fetch";

const HASH_ALGORITHM = "sha3-512";
const HASH_ENCODING = "hex";

const userConfig = await env.getUserConfig();
const maxmindLicenseKey = process.env.APP_MAXMIND_LICENSE_KEY || userConfig.maxmind?.licenseKey;
const sourcesDir = url.fileURLToPath( new URL( "../sources", import.meta.url ) );
const dataDir = url.fileURLToPath( new URL( "../data", import.meta.url ) );

if ( !fs.existsSync( dataDir ) ) fs.mkDirSync( dataDir, { "recursive": true } );

export default class Build {
    #hash;
    #digest;
    #remoteIndex;
    #gitHub;

    get hash () {
        this.#hash ??= crypto.createHash( HASH_ALGORITHM );

        return this.#hash;
    }

    get digest () {
        if ( !this.#digest ) this.#digest = this.hash.digest( HASH_ENCODING );

        return this.#digest;
    }

    get gitHub () {
        if ( this.#gitHub === undefined ) {
            const token = process.env.APP_GITHUB_TOKEN || userConfig.github?.token;

            if ( !token ) this.#gitHub = null;
            else this.#gitHub = new GitHub( token );
        }

        return this.#gitHub;
    }

    get sourcesDir () {
        return sourcesDir;
    }

    get dataDir () {
        return dataDir;
    }

    // public
    // XXX
    async build ( id ) {
        const remoteIndex = await this._getRemoteIndex();

        const updated = await this._getUpdated();
        if ( !updated.ok ) return updated;

        // not modified
        if ( ( remoteIndex[id]?.hash && remoteIndex[id]?.hash === updated.data.hash ) || ( remoteIndex[id]?.lastModified && remoteIndex[id]?.lastModified === updated.data.lastModified ) ) return result( 304 );

        const path = this.dataDir + "/" + CONST.index[id].name;

        fs.rmSync( path, { "force": true } );

        const res = await this._build( this.dataDir + "/" + CONST.index[id].name );

        return res;
    }

    // protected
    async _getRemoteIndex () {
        if ( !this.#remoteIndex ) {

            // download index
            const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/index.json` );

            if ( !res.ok ) throw res;

            this.#remoteIndex = await res.json();
        }

        return this.#remoteIndex;
    }

    // XXX tar
    async _uploadDataset ( file ) {
        const gitHub = this.gitHub;

        if ( !gitHub ) return result( [500, `GitHub token was not found`] );

        // get release id
        var res = await gitHub.getReleaseByTagName( CONST.repo, CONST.tag );
        if ( !res.ok ) return res;

        // upload
        // tar.c( {
        //     "cwd": data,
        //     "gzip": true,
        //     "sync": true,
        //     "portable": true,
        //     "file": `${data}/${id}.tar.gz`,
        // },
        // [dataset.name] );

        return gitHub.updateReleaseAsset( CONST.repo, res.data.id, file );
    }

    async _checkMaxmind ( id ) {
        if ( !maxmindLicenseKey ) return result( [400, `Maxmind license key nod found`] );

        // download
        const res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${id}&license_key=${maxmindLicenseKey}&suffix=tar.gz`, { "timeout": 30000 } );

        // request error
        if ( !res.ok ) return res;

        const lastModified = new Date( res.headers.get( "last-modified" ) ).toISOString();

        return result( 200, { lastModified } );
    }

    async _downloadMaxmind ( id ) {
        if ( !maxmindLicenseKey ) return result( [400, `Maxmind license key nod found`] );

        const res = await fetch( `https://download.maxmind.com/app/geoip_download?edition_id=${id}&license_key=${maxmindLicenseKey}&suffix=tar.gz`, { "timeout": 30000 } );

        // request error
        if ( !res.ok ) return res;

        // download and unpack
        await new Promise( resolve => {
            const writable = tar.extract( {
                "cwd": this.dataDir,
                "sync": true,
                "filter": ( path, entry ) => path.includes( id + ".mmdb" ),
                "strip": 1,
            } );

            res.body.pipe( writable );

            writable.on( "end", resolve );
        } );

        return result( 200 );
    }
}
