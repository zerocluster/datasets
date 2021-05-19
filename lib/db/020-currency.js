import sql from "#core/sql";

export default sql`

CREATE TABLE "currency" (
    "id" text PRIMARY KEY NOT NULL, -- iso3
    "iso3" text NOT NULL,
    "name" text NOT NULL,
    "symbol" text NOT NULL
);

CREATE UNIQUE INDEX idx_currency_name ON "currency" ("name");
CREATE INDEX idx_currency_symbol ON "currency" ("symbol");

`;
