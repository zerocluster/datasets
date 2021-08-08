import sql from "#core/sql";
import earcut from "earcut";
import fs from "fs";
import url from "url";
import * as config from "#core/config";
import area from "@turf/area";
import CONST from "#lib/const";

// const sources = url.fileURLToPath( new URL( "./", import.meta.url ) );
const data = url.fileURLToPath( new URL( "../data", import.meta.url ) );

const DATASETS = {
    async ["countries-triangles"] ( dataset, path ) {
        const dbh = await sql.new( url.pathToFileURL( path ) );

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

        const json = config.read( data + "/ne_10m_admin_0_countries.geo.json" );

        for ( const feature of json.features ) {
            const country = feature.properties.ISO_A2;

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

        return new Date();
    },
};

const index = {};

for ( const id in DATASETS ) {
    process.stdout.write( `Building "${id}" ... ` );

    const dataset = CONST.index[id];

    const path = data + "/" + dataset.name;

    fs.rmSync( path, { "force": true } );

    index[id] = await DATASETS[id]( dataset, path );

    console.log( index[id] );
}
