import Resource from "#lib/resource";
import fs from "fs";
import url from "url";
import sql from "#core/sql";

export default class CountriesTriangles extends Resource {

    // properties
    get id () {
        return "countries-triangles";
    }

    get files () {
        return ["countries-triangles.sqlite"];
    }

    get sourcePath () {
        return super.sourcePath + "/countries.geo.json";
    }

    // public
    async getETag () {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJSON( this.sourcePath );

        const hash = this._getHash().update( JSON.stringify( json ) );

        return result( 200, hash );
    }

    async build ( location ) {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJSON( this.sourcePath ),
            { "default": area } = await import( "@turf/area" ),
            { "default": earcut } = await import( "earcut" ),
            dbh = await sql.new( url.pathToFileURL( location + "/" + this.files[0] ) );

        await dbh.exec( sql`
CREATE TABLE "triangle" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "country_iso2" text NOT NULL,
    "max" float NOT NULL,
    "point1_x" float NOT NULL,
    "point1_y" float NOT NULL,
    "point2_x" float NOT NULL,
    "point2_y" float NOT NULL,
    "point3_x" float NOT NULL,
    "point3_y" float NOT NULL
);

CREATE INDEX "triangle_country_iso2_max" ON "triangle" ("country_iso2", "max");
` );

        for ( const feature of json.features ) {
            const country_iso2 = feature.properties.ISO_A2;

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

            const values = [];
            let max = 0;

            for ( const triangle of index ) {
                max += triangle.properties.area / totalArea;

                values.push( {
                    country_iso2,
                    max,
                    "point1_x": triangle.coordinates[0][0][0],
                    "point1_y": triangle.coordinates[0][0][1],
                    "point2_x": triangle.coordinates[0][1][0],
                    "point2_y": triangle.coordinates[0][1][1],
                    "point3_x": triangle.coordinates[0][2][0],
                    "point3_y": triangle.coordinates[0][2][1],
                } );
            }

            await dbh.do( sql`INSERT INTO "triangle"`.VALUES( values ) );
        }

        dbh.close();

        return result( 200 );
    }
}
