import sql from "#core/sql";

export default sql`

CREATE TABLE geotarget (
    id int4 PRiMARY KEY NOT NULL,
    updated date NOT NULL DEFAULT CURRENT_TIMESTAMP,
    triangulated bool NOT NULL DEFAULT FALSE,
    center json,
    bbox json,
    polygon json
);

CREATE TABLE geotarget_triangle (
    geotarget_id text NOT NULL REFERENCES geotarget ( id ) ON DELETE CASCADE,
    max float NOT NULL,
    point1_x float NOT NULL,
    point1_y float NOT NULL,
    point2_x float NOT NULL,
    point2_y float NOT NULL,
    point3_x float NOT NULL,
    point3_y float NOT NULL
);

CREATE INDEX triangle_geotarget_id_max ON geotarget_triangle ( geotarget_id, max );

CREATE TRIGGER update_geotarger_polygon UPDATE OF polygon ON geotarget
BEGIN
    DELETE FROM geotarget_triangle WHERE geotarget_id = OLD.id;

    UPDATE geotarget SET triangulated = FALSE WHERE id = OLD.id;
END;

`;
