#!/usr/bin/env node

import Api from "#core/api";

const port = 8080;

const api = Api.new( `ws://devel:${port}/` );
const apiHttp = Api.new( `http://devel:${port}/` );

const ip = "22.12.41.1";

const t = {
    async geoipAsn () {
        return api.call( "geoip/asn", ip );
    },
    async geoipAsnHttp () {
        return apiHttp.call( "geoip/asn", ip );
    },
    async country () {
        return api.call( "countries/get", "RU" );
    },
    async continent () {
        return api.call( "continents/get", "AN" );
    },
    async geoipCountry () {
        const ip = Math.ceil( Math.random() * 4_294_967_296 );

        return api.call( "geoip/country", ip );
    },
};

// console.log( await t.geoipAsn() );
// console.log( await t.geoipAsnHttp() );
// console.log( await t.country() );
// console.log( await t.continent() );
// console.log( await t.geoipCountry() );

bench( "datasets", t, 10000, 50 );
