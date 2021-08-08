import sql from "#core/sql";
import earcut from "earcut";
import fs from "fs";
import url from "url";
import * as config from "#core/config";
import area from "@turf/area";
import bbox from "@turf/bbox";
import csv from "fast-csv";
import * as uule from "#core/api/google/uule";
import CONST from "#lib/const";
import fetch from "#core/fetch";

const sources = url.fileURLToPath( new URL( "./", import.meta.url ) );
const data = url.fileURLToPath( new URL( "../data", import.meta.url ) );

const DATASETS = {
    async ["datasets"] ( dataset, path ) {
        const dbh = await sql.new( url.pathToFileURL( path ) );

        await dbh.exec( sql`

-- continent
CREATE TABLE "continent" (
    "id" text PRiMARY KEY NOT NULL, -- iso2
    "iso2" text NOT NULL,
    "name" text NOT NULL
);

CREATE UNIQUE INDEX idx_continent_name ON "continent" ("name");

-- currency
CREATE TABLE "currency" (
    "id" text PRIMARY KEY NOT NULL, -- iso3
    "iso3" text NOT NULL,
    "name" text NOT NULL,
    "symbol" text NOT NULL
);

CREATE UNIQUE INDEX idx_currency_name ON "currency" ("name");
CREATE INDEX idx_currency_symbol ON "currency" ("symbol");

-- country
CREATE TABLE "country" (
    "id" text PRIMARY KEY NOT NULL, -- iso2
    "iso2" text NOT NULL,
    "iso3" text NOT NULL,
    "ison" text NOT NULL,
    "name" text NOT NULL,
    "official_name" text NOT NULL,
    "flag" text NOT NULL,
    "flag_unicode" text NOT NULL,
    "continent" text NOT NULL,
    "timezones" json,
    "tld" text,
    "postal_code_format" text,
    "postal_code_regexp" text,
    "calling_code" text,
    "locales" json,
    "languages" json NOT NULL,
    "region" text NOT NULL,
    "subregion" text NOT NULL,
    "currencies" json NOT NULL,
    "currency" text,
    "coordinates" json
);

CREATE UNIQUE INDEX idx_country_iso3 ON "country" ("iso3");
CREATE UNIQUE INDEX idx_country_name ON "country" ("name");

-- language
CREATE TABLE "language" (
    "id" text PRIMARY KEY NOT NULL, -- iso3
    "iso3" text NOT NULL,
    "iso2" text,
    "name" text NOT NULL,
    "bibliographic" text
);

CREATE UNIQUE INDEX idx_language_iso2 ON "language" ("iso2");
CREATE UNIQUE INDEX idx_language_name ON "language" ("name");

-- timezone
CREATE TABLE "timezone" (
    "id" text PRIMARY KEY NOT NULL, -- name
    "name" text NOT NULL,
    "abbr" text NOT NULL
);

CREATE INDEX idx_timezone_abbr ON "timezone" ("abbr");

    ` );

        const _import = async function _import ( name, table ) {
            const data = config.read( sources + "/" + name + ".json" );

            await dbh.do( dbh.queryToString( sql`INSERT INTO "__name__"`.VALUES( data ) ).replace( "__name__", table ) );
        };

        await _import( "continents", "continent" );
        await _import( "countries", "country" );
        await _import( "currencies", "currency" );
        await _import( "languages", "language" );
        await _import( "timezones", "timezone" );

        dbh.db.close();

        return new Date();
    },

    async ["google-geotargets"] ( dataset, path ) {
        const dbh = await sql.new( url.pathToFileURL( path ) );

        await dbh.exec( sql`
CREATE TABLE IF NOT EXISTS "geotarget" (
    "id" int4 PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "canonical_name" text NOT NULL,
    "parent_id" text,
    "country" text,
    "type" text,
    "status" text,
    "uule" text
);

CREATE INDEX idx_geotarget_canonical_name ON "geotarget" ("canonical_name");
CREATE INDEX idx_geotarget_type ON "geotarget" ("type");
CREATE INDEX idx_geotarget_status ON "geotarget" ("status");
    ` );

        let res = await fetch( "https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1" );
        if ( !res.ok ) throw res;

        const text = await res.text();

        const match = text.match( /href="\/adwords\/api\/docs\/appendix\/geo\/geotargets-(\d{4}-\d{2}-\d{2})\.csv"/ );

        if ( !match ) throw Error( `Geotargets parsing error` );

        res = await fetch( `https://developers.google.com/adwords/api/docs/appendix/geo/geotargets-${match[1]}.csv` );
        if ( !res.ok ) throw res;

        const values = [];

        await new Promise( resolve => {
            const stream = csv
                .parse( { "headers": headers => ["id", "name", "canonical_name", "parent_id", "country", "type", "status"] } )
                .on( "error", error => console.error( error ) )
                .on( "data", row => {
                    row.type = row.type.toLowerCase();
                    row.status = row.status.toLowerCase();

                    row.uule = uule.encode( row.canonical_name );

                    values.push( row );
                } )
                .on( "end", rowCount => {
                    resolve();
                } );

            res.body.pipe( stream );
        } );

        await dbh.do( sql`INSERT INTO "geotarget"`.VALUES( values ) );

        dbh.db.close();

        return new Date( match[1] );
    },

    async ["countries-geojson"] ( dataset, path ) {
        const dbh = await sql.new( url.pathToFileURL( path ) );

        await dbh.exec( sql`
CREATE TABLE "countries" (
    "country" text NOT NULL,
    "minLongitude" float NOT NULL,
    "minLatitude" float NOT NULL,
    "maxLongitude" float NOT NULL,
    "maxLatitude" float NOT NULL,
    "geojson" json NOT NULL
);

CREATE INDEX "countries_country_bbox" ON "countries" ("country", "minLongitude", "minLatitude", "maxLongitude", "maxLatitude");
    ` );

        const json = config.read( data + "/ne_10m_admin_0_countries.geo.json" );

        const values = [];

        for ( const feature of json.features ) {
            const polygons = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

            for ( const coordinates of polygons ) {
                const _bbox = bbox( { "type": "Polygon", coordinates } );

                const record = {
                    "country": feature.properties.ISO_A2,
                    "minLongitude": _bbox[0],
                    "minLatitude": _bbox[1],
                    "maxLongitude": _bbox[2],
                    "maxLatitude": _bbox[3],
                    "geojson": { "type": "Polygon", coordinates },
                };

                values.push( record );
            }
        }

        await dbh.do( sql`INSERT INTO "countries"`.VALUES( values ) );

        dbh.db.close();

        return new Date();
    },

    async ["countries-triangles"] ( dataset, path ) {
        const dbh = await sql.new( url.pathToFileURL( path ) );

        await dbh.exec( sql`
CREATE TABLE "triangles" (
    "country" text NOT NULL,
    "max" float NOT NULL,
    "point1_x" float NOT NULL,
    "point1_y" float NOT NULL,
    "point2_x" float NOT NULL,
    "point2_y" float NOT NULL,
    "point3_x" float NOT NULL,
    "point3_y" float NOT NULL
);

CREATE INDEX "triangles_country_max" ON "triangles" ("country", "max");
    ` );

        const json = config.read( data + "/ne_10m_admin_0_countries.geo.json" );

        for ( const feature of json.features ) {
            const country = feature.properties.ISO_A2;

            const index = [];

            const polygons = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

            let totalArea = 0;

            for ( const polygon of polygons ) {
                const vertexes = polygon[0];

                const triangles = earcut( vertexes.flat() );

                for ( let n = 0; n < triangles.length; n += 3 ) {
                    const v1 = vertexes[triangles[n]],
                        v2 = vertexes[triangles[n + 1]],
                        v3 = vertexes[triangles[n + 2]];

                    const triangle = {
                        "type": "Polygon",
                        "properties": {},
                        "coordinates": [[v1, v2, v3]],
                    };

                    triangle.properties.area = area( triangle );

                    totalArea += triangle.properties.area;

                    index.push( triangle );
                }
            }

            const values = [];
            let max = 0;

            for ( const triangle of index ) {
                max += triangle.properties.area / totalArea;

                values.push( {
                    country,
                    max,
                    "point1_x": triangle.coordinates[0][0][0],
                    "point1_y": triangle.coordinates[0][0][1],
                    "point2_x": triangle.coordinates[0][1][0],
                    "point2_y": triangle.coordinates[0][1][1],
                    "point3_x": triangle.coordinates[0][2][0],
                    "point3_y": triangle.coordinates[0][2][1],
                } );
            }

            await dbh.do( sql`INSERT INTO "triangles"`.VALUES( values ) );
        }

        dbh.db.close();

        return new Date();
    },
};

const index = {};

for ( const id in DATASETS ) {
    process.stdout.write( `Building "${id}" ... ` );

    const dataset = CONST.index[id];

    const path = data + "/" + dataset.name;

    fs.rmSync( path, { "force": true } );

    index[id] = await DATASETS[id]( dataset, path );

    console.log( index[id] );
}

console.log( index );
