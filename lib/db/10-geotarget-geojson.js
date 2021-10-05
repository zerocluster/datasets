import sql from "#core/sql";

export default sql`

CREATE TABLE "geoTargetGeoJson" (
    "id" int4 PRiMARY KEY NOT NULL,
    "updated" date NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geoJson" json
);

`;
