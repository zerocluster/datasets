import sql from "#core/sql";

export default sql`

CREATE TABLE "geotarget_geojson" (
    id int4 PRiMARY KEY NOT NULL,
    updated date NOT NULL DEFAULT CURRENT_TIMESTAMP,
    geojson json
);

`;
