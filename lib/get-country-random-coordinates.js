import * as config from "#core/config";
import area from "@turf/area";
import earcut from "earcut";
import sql from "#core/sql";
import CONST from "#lib/const";
import fs from "fs";

const q = sql`SELECT "point1_x", "point1_y", "point2_x", "point2_y", "point3_x", "point3_y" FROM "triangles" WHERE "country" = ? AND "max" >= ?`.prepare();

const dbh = await buildIndex();

async function buildIndex () {
    const path = CONST.location + "/country-triangles.sqlite";

    const exists = fs.existsSync( path );

    var dbh = await sql.new( "sqlite://" + path );

    if ( exists ) return dbh;

    await dbh.exec( sql`
        CREATE TABLE "triangles" (
            "country" text NOT NULL,
            "max" float NOT NULL,
            "point1_x" float NOT NULL,
            "point1_y" float NOT NULL,
            "point2_x" float NOT NULL,
            "point2_y" float NOT NULL,
            "point3_x" float NOT NULL,
            "point3_y" float NOT NULL
        );

        CREATE INDEX "triangles_country_max" ON "triangles" ("country", "max");
    ` );

    const json = config.read( CONST.index["countries.geo.json"].location );

    for ( const feature of json.features ) {
        const country = feature.properties.ISO_A3;

        const index = [];

        const polygons = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

        let totalArea = 0;

        for ( const polygon of polygons ) {
            const vertexes = polygon[0];

            const triangles = earcut( vertexes.flat() );

            for ( let n = 0; n < triangles.length; n += 3 ) {
                const v1 = vertexes[triangles[n]],
                    v2 = vertexes[triangles[n + 1]],
                    v3 = vertexes[triangles[n + 2]];

                const triangle = {
                    "type": "Polygon",
                    "properties": {},
                    "coordinates": [[v1, v2, v3]],
                };

                triangle.properties.area = area( triangle );

                totalArea += triangle.properties.area;

                index.push( triangle );
            }
        }

        const data = [];
        let max = 0;

        for ( const triangle of index ) {
            max += triangle.properties.area / totalArea;

            data.push( {
                country,
                max,
                "point1_x": triangle.coordinates[0][0][0],
                "point1_y": triangle.coordinates[0][0][1],
                "point2_x": triangle.coordinates[0][1][0],
                "point2_y": triangle.coordinates[0][1][1],
                "point3_x": triangle.coordinates[0][2][0],
                "point3_y": triangle.coordinates[0][2][1],
            } );
        }

        await dbh.do( sql`INSERT INTO "triangles"`.VALUES( data ) );
    }

    return dbh;
}

async function getTriangle ( country ) {
    const probability = Math.random();

    const coords = await dbh.selectRow( q, [country, probability] );

    return {
        "type": "Polygon",
        "coordinates": [
            [

                //
                [coords.data.point1_x, coords.data.point1_y],
                [coords.data.point2_x, coords.data.point2_y],
                [coords.data.point3_x, coords.data.point3_y],
            ],
        ],
    };
}

function getRandomPoinOnTriangle ( triangle ) {
    const coords = triangle.coordinates[0];

    const x = Math.random(),
        y = Math.random();

    const q = Math.abs( x - y );

    const s = q;
    const t = 0.5 * ( x + y - q );
    const u = 1 - 0.5 * ( q + x + y );

    return {
        "type": "Point",
        "coordinates": [

            //
            s * coords[0][0] + t * coords[1][0] + u * coords[2][0],
            s * coords[0][1] + t * coords[1][1] + u * coords[2][1],
        ],
    };
}

export default async function getCountryRandomCoordinates ( iso3 ) {
    const triangle = await getTriangle( iso3 );

    const point = getRandomPoinOnTriangle( triangle );

    return point;
}
