import sql from "#core/sql";

export default sql`

CREATE TABLE "language" (
    "id" text PRIMARY KEY NOT NULL, -- iso3
    "iso3" text NOT NULL,
    "iso2" text,
    "name" text NOT NULL,
    "bibliographic" text
);

CREATE UNIQUE INDEX idx_language_iso2 ON "language" ("iso2");
CREATE UNIQUE INDEX idx_language_name ON "language" ("name");

`;
