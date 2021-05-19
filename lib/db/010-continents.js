import sql from "#core/sql";

export default sql`

CREATE TABLE "continent" (
    "id" text PRiMARY KEY NOT NULL, -- iso2
    "iso2" text NOT NULL,
    "name" text NOT NULL
);

CREATE UNIQUE INDEX idx_continent_name ON "continent" ("name");

`;
