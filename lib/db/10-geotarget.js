import sql from "#core/sql";

export default sql`

CREATE TABLE osm (
    id int4 PRiMARY KEY NOT NULL,
    updated date NOT NULL DEFAULT CURRENT_TIMESTAMP,
    class text,
    type text,
    display_name text,
    center json,
    bbox json,
    polygon json
);

CREATE TABLE osm_triangle (
    geotarget_id int4 NOT NULL REFERENCES osm ( id ) ON DELETE CASCADE,
    max float NOT NULL,
    point1_x float NOT NULL,
    point1_y float NOT NULL,
    point2_x float NOT NULL,
    point2_y float NOT NULL,
    point3_x float NOT NULL,
    point3_y float NOT NULL
);

`;
