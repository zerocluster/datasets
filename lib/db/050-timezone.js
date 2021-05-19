import sql from "#core/sql";

export default sql`

CREATE TABLE "timezone" (
    "id" text PRIMARY KEY NOT NULL, -- name
    "name" text NOT NULL,
    "abbr" text NOT NULL
);

CREATE INDEX idx_timezone_abbr ON "timezone" ("abbr");

`;
