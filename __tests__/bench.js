#!/usr/bin/env node

import API from "#core/api";

const api = API.new( "ws://devel:10000/" );
const apiHTTP = API.new( "http://devel:10000/" );

const ip = "22.12.41.1";

const t = {
    async geoip_asn () {
        return api.call( "geoip/asn", ip );
    },
    async geoip_asn_http () {
        return apiHTTP.call( "geoip/asn", ip );
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

bench( "datasets", t, 10000, 50 );
