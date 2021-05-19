import sql from "#core/sql";

export default sql`

CREATE TABLE IF NOT EXISTS "geotarget" (
    "id" int4 PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "canonical_name" text NOT NULL,
    "parent_id" text,
    "iso2" text,
    "type" text,
    "status" text,
    "uule" text
);

CREATE UNIQUE INDEX idx_geotarget_canonical_name ON "geotarget" ("canonical_name");
CREATE INDEX idx_geotarget_type ON "geotarget" ("type");
CREATE INDEX idx_geotarget_status ON "geotarget" ("status");

`;
