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
    async getEtag () {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJson( this.sourcePath );

        const hash = this._getHash().update( JSON.stringify( json ) );

        return result( 200, hash );
    }

    async build ( location ) {
        if ( !fs.existsSync( this.sourcePath ) ) return result( [404, `Source not found`] );

        const json = this._readJson( this.sourcePath ),
            { "default": area } = await import( "@turf/area" ),
            { "default": earcut } = await import( "earcut" ),
            dbh = await sql.new( url.pathToFileURL( location + "/" + this.files[0] ) );

        dbh.exec( sql`
CREATE TABLE "triangle" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "countryIso2" text NOT NULL,
    "max" float NOT NULL,
    "point1x" float NOT NULL,
    "point1y" float NOT NULL,
    "point2x" float NOT NULL,
    "point2y" float NOT NULL,
    "point3x" float NOT NULL,
    "point3y" float NOT NULL
);

CREATE INDEX "triangle_countryIso2_max" ON "triangle" ("countryIso2", "max");
` );

        for ( const feature of json.features ) {
            const countryIso2 = feature.properties.ISO_A2;

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
                    countryIso2,
                    max,
                    "point1x": triangle.coordinates[0][0][0],
                    "point1y": triangle.coordinates[0][0][1],
                    "point2x": triangle.coordinates[0][1][0],
                    "point2y": triangle.coordinates[0][1][1],
                    "point3x": triangle.coordinates[0][2][0],
                    "point3y": triangle.coordinates[0][2][1],
                } );
            }

            dbh.do( sql`INSERT INTO "triangle"`.VALUES( values ) );
        }

        dbh.close();

        return result( 200 );
    }
}
