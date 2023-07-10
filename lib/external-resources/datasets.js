import Builder from "#core/external-resources/builder";
import url from "node:url";
import sql from "#core/sql";
import fs from "node:fs";

const VERSION = 2;

const SOURCES = ["continent", "country", "currency", "language", "timezone"];

export default class Datasets extends Builder {

    // properties
    get id () {
        return "softvisio-node/geoip-asn/resources/datasets";
    }

    // protected
    async _getEtag () {
        const hash = this._getHash();

        for ( const source of SOURCES ) {
            const sourcePath = this.sourcePath + "/" + source + ".json";

            if ( !fs.existsSync( sourcePath ) ) return result( [404, `Source "${source}" not found`] );

            const json = this._readJson( sourcePath );

            hash.update( JSON.stringify( json ) );
        }

        return result( 200, VERSION + ":" + hash.digest( "hex" ) );
    }

    async _build ( location ) {
        const dbh = await sql.new( url.pathToFileURL( location + "/datasets.sqlite" ) );

        dbh.exec( sql`

-- continent
CREATE TABLE continent (
    id text PRiMARY KEY NOT NULL COLLATE NOCASE, -- iso2
    iso2 text NOT NULL COLLATE NOCASE,
    name text NOT NULL COLLATE NOCASE
);

CREATE UNIQUE INDEX continent_name_key ON continent ( name );

-- currency
CREATE TABLE currency (
    id text PRIMARY KEY COLLATE NOCASE, -- iso3
    iso3 text NOT NULL UNIQUE COLLATE NOCASE,
    name text NOT NULL COLLATE NOCASE,
    symbol text NOT NULL
);

CREATE INDEX currency_name_idx ON currency ( name );
CREATE INDEX currency_symbol_idx ON currency (symbol);

-- country
CREATE TABLE "country" (
    id text PRIMARY KEY COLLATE NOCASE, -- iso2
    iso2 text NOT NULL COLLATE NOCASE,
    iso3 text NOT NULL UNIQUE COLLATE NOCASE,
    ison text NOT NULL,
    name text NOT NULL UNIQUE COLLATE NOCASE,
    official_name text NOT NULL,
    flag text NOT NULL,
    flag_unicode text NOT NULL,
    continent text NOT NULL,
    timezones json,
    tld text,
    postal_code_format text,
    postal_code_regexp text,
    calling_code text,
    locales json,
    languages json NOT NULL,
    region text NOT NULL,
    subregion text NOT NULL,
    currencies json NOT NULL,
    currency text,
    coordinates json
);

-- language
CREATE TABLE language (
    id text PRIMARY KEY COLLATE NOCASE, -- iso3
    iso3 text NOT NULL COLLATE NOCASE,
    iso2 text UNIQUE COLLATE NOCASE,
    name text NOT NULL UNIQUE COLLATE NOCASE,
    bibliographic text COLLATE NOCASE
);

-- timezone
CREATE TABLE timezone (
    id text PRIMARY KEY COLLATE NOCASE, -- name
    name text NOT NULL COLLATE NOCASE,
    abbr text NOT NULL COLLATE NOCASE
);

CREATE INDEX timezone_abbr_idx ON timezone ( abbr );

    ` );

        for ( const source of SOURCES ) {
            const sourcePath = this.sourcePath + "/" + source + ".json";

            if ( !fs.existsSync( sourcePath ) ) return result( [404, `Source "${source}" not found`] );

            const json = this._readJson( sourcePath );

            const res = dbh.do( dbh.queryToString( sql`INSERT INTO "__name__"`.VALUES( json ) ).replace( "__name__", source ) );

            if ( !res.ok ) return res;
        }

        dbh.close();

        return result( 200 );
    }
}
