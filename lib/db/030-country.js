import sql from "#core/sql";

export default sql`

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

`;
