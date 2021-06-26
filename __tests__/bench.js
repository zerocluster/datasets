#!/usr/bin/env node

import API from "#core/api";

const api = new API( "ws://devel:8080/" );
const apiHTTP = new API( "http://devel:8080/" );

const ip = "22.12.41.1";

const t = {
    async remote () {
        return api.call( "geoip/asn", ip );
    },
    async remoteHTTP () {
        return apiHTTP.call( "geoip/asn", ip );
    },
    async country () {
        return api.call( "country/get", "RU" );
    },
    async continent () {
        return api.call( "continent/get", "AN" );
    },
};

// console.log( await t.remote() );
// console.log( await t.remoteHTTP() );
// console.log( await t.country() );
// console.log( await t.continent() );

bench( "databases", t, 10000 );

// process.exit();
