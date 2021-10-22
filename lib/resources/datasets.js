import Resource from "#lib/resource";
import url from "url";
import sql from "#core/sql";
import fs from "fs";

const SOURCES = ["continent", "country", "currency", "language", "timezone"];

export default class Datasets extends Resource {

    // properties
    get id () {
        return "datasets";
    }

    get files () {
        return ["datasets.sqlite"];
    }

    // public
    async getEtag () {
        const hash = this._getHash();

        for ( const source of SOURCES ) {
            const sourcePath = this.sourcePath + "/" + source + ".json";

            if ( !fs.existsSync( sourcePath ) ) return result( [404, `Source "${source}" not found`] );

            const json = this._readJson( sourcePath );

            hash.update( JSON.stringify( json ) );
        }

        return result( 200, hash );
    }

    async build ( location ) {
        const dbh = await sql.new( url.pathToFileURL( location + "/" + this.files[0] ) );

        dbh.exec( sql`

-- continent
CREATE TABLE continent (
    id text PRiMARY KEY NOT NULL, -- iso2
    iso2 text NOT NULL,
    name text NOT NULL
);

CREATE UNIQUE INDEX continent_name_nocase_key ON continent ( name COLLATE NOCASE );

-- currency
CREATE TABLE currency (
    id text PRIMARY KEY NOT NULL, -- iso3
    iso3 text NOT NULL UNIQUE,
    name text NOT NULL,
    symbol text NOT NULL
);

CREATE INDEX currency_name_nocase_idx ON currency ( name COLLATE NOCASE );
CREATE INDEX currency_symbol_idx ON currency (symbol);

-- country
CREATE TABLE "country" (
    id text PRIMARY KEY NOT NULL, -- iso2
    iso2 text NOT NULL,
    iso3 text NOT NULL UNIQUE,
    ison text NOT NULL,
    name text NOT NULL,
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

CREATE UNIQUE INDEX country_name_nocase_key ON country ( name COLLATE NOCASE );

-- language
CREATE TABLE language (
    id text PRIMARY KEY NOT NULL, -- iso3
    iso3 text NOT NULL,
    iso2 text UNIQUE,
    name text NOT NULL,
    bibliographic text
);

CREATE UNIQUE INDEX language_name_nocase_key ON language ( name COLLATE NOCASE );

-- timezone
CREATE TABLE timezone (
    id text PRIMARY KEY NOT NULL, -- name
    name text NOT NULL,
    abbr text NOT NULL
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
