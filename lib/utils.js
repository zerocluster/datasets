import fetch from "#core/fetch";
import fs from "fs";

import CONST from "#lib/const";

export async function getRemoteIndex () {

    // download index
    const res = await fetch( `https://github.com/${CONST.repo}/releases/download/${CONST.tag}/index.json` );

    if ( res.status === 404 ) return {};

    if ( !res.ok ) throw res;

    return res.json();
}

export function getLocalIndex () {
    if ( !fs.existsSync( CONST.indexPath ) ) return {};

    return JSON.parse( fs.readFileSync( CONST.indexPath ) );
}

export function writeLocalIndex ( index ) {
    fs.writeFileSync( CONST.indexPath, JSON.stringify( index, null, 4 ) );
}
