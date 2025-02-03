import fs from "node:fs";
import url from "node:url";
import { readConfig } from "#core/config";
import ExternalResourceBuilder from "#core/external-resource-builder";
import sql from "#core/sql";

const SOURCES = {
    "continents": "continent",
    "countries": "country",
    "currencies": "currency",
    "languages": "language",
    "timezones": "timezone",
};

export default class Datasets extends ExternalResourceBuilder {

    // properties
    get id () {
        return "zerocluster/datasets/resources/datasets";
    }

    // protected
    async _getEtag () {
        const hash = this._getHash();

        for ( const source of Object.keys( SOURCES ) ) {
            const sourcePath = url.fileURLToPath( import.meta.resolve( "#resources/" + source + ".json" ) );

            if ( !fs.existsSync( sourcePath ) ) return result( [ 404, `Source "${ source }" not found` ] );

            const json = await readConfig( sourcePath );

            hash.update( JSON.stringify( json ) );
        }

        return result( 200, hash );
    }

    async _build ( location ) {
        const dbh = sql.new( url.pathToFileURL( location + "/datasets.sqlite" ) );

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

        for ( const [ source, tableName ] of Object.entries( SOURCES ) ) {
            const sourcePath = url.fileURLToPath( import.meta.resolve( "#resources/" + source + ".json" ) );

            if ( !fs.existsSync( sourcePath ) ) return result( [ 404, `Source "${ source }" not found` ] );

            const json = await readConfig( sourcePath );

            const res = dbh.do( sql`INSERT INTO`.ID( tableName ).VALUES( json ) );

            if ( !res.ok ) return res;
        }

        await dbh.destroy();

        return result( 200 );
    }
}
