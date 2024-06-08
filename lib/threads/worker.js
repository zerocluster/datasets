import sql from "#core/sql";
import { area } from "@turf/area";
import earcut from "earcut";
import externalResources from "#lib/external-resources";

const dbh = externalResources.cacheDbh;

export default class {
    async API_triangulate ( id ) {
        var geojson = dbh.selectRow( sql`SELECT geojson FROM osm WHERE id = ?`, [ id ] ).data.geojson;

        if ( geojson.type === "Polygon" ) geojson.coordinates = [ geojson.coordinates ];

        const triangles = [];

        let totalArea = 0;

        for ( const polygon of geojson.coordinates ) {
            const vertexes = polygon[ 0 ];

            const _triangles = earcut( vertexes.flat() );

            for ( let n = 0; n < _triangles.length; n += 3 ) {
                const v1 = vertexes[ _triangles[ n ] ],
                    v2 = vertexes[ _triangles[ n + 1 ] ],
                    v3 = vertexes[ _triangles[ n + 2 ] ];

                const triangle = {
                    "type": "Polygon",
                    "properties": {},
                    "coordinates": [ [ v1, v2, v3 ] ],
                };

                triangle.properties.area = area( triangle );

                totalArea += triangle.properties.area;

                triangles.push( triangle );
            }
        }

        const values = [];
        let max = 0;

        for ( const triangle of triangles ) {
            max += triangle.properties.area / totalArea;

            values.push( {
                "geotarget_id": id,
                max,
                "point1_x": triangle.coordinates[ 0 ][ 0 ][ 0 ],
                "point1_y": triangle.coordinates[ 0 ][ 0 ][ 1 ],
                "point2_x": triangle.coordinates[ 0 ][ 1 ][ 0 ],
                "point2_y": triangle.coordinates[ 0 ][ 1 ][ 1 ],
                "point3_x": triangle.coordinates[ 0 ][ 2 ][ 0 ],
                "point3_y": triangle.coordinates[ 0 ][ 2 ][ 1 ],
            } );
        }

        dbh.do( sql`DELETE FROM osm_triangle WHERE geotarget_id = ?`, [ id ] );
        dbh.do( sql`INSERT INTO osm_triangle`.VALUES( values ) );

        const res = result( 200 );

        return res;
    }
}
