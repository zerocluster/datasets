#!/usr/bin/env node

import Api from "#core/api";
import benchmark from "#core/benchmark";

// const port = 80;
const port = 10_000;

const api = new Api( `ws://devel:${ port }/` );
const apiHttp = new Api( `http://devel:${ port }/` );

const ip = "22.12.41.1";

const tests = {
    async geoip_asn () {
        return api.call( "geoip/asn", ip );
    },

    async geoip_asn_http () {
        return apiHttp.call( "geoip/asn", ip );
    },

    async country () {
        return api.call( "country/get", "RU" );
    },

    async continent () {
        return api.call( "continent/get", "AN" );
    },

    async geoip_country () {
        const ip = Math.ceil( Math.random() * 4_294_967_296 );

        return api.call( "geoip/country", ip );
    },
};

// console.log( await t.geoip_asn() );
// console.log( await t.geoip_asn_http() );
// console.log( await t.country() );
// console.log( await t.continent() );
// console.log( await t.geoip_country() );

await benchmark( "API speed", tests, {
    "iterations": 10_000,
    "seconds": 10,
    "threads": 50,
} );
