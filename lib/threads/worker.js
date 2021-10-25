import Base from "#app/threads/base";
import sql from "#core/sql";
import area from "@turf/area";
import earcut from "earcut";
import datasets from "#lib/datasets";
import Mutex from "#core/threads/mutex";

const mutexSet = new Mutex.Set();
const dbh = await datasets.cache();

export default class extends Base {
    constructor ( ...args ) {
        super( ...args );
    }

    async _init () {}

    async API_triangulate ( id ) {
        const mutex = mutexSet.get( id );

        if ( !mutex.tryDown() ) return await mutex.signal.wait();

        var json = dbh.selectRow( sql`SELECT polygon FROM geotarget WHERE id = ?`, [id] ).data.polygon;

        for ( const feature of json.features ) {
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
                    "geotarget_id": id,
                    max,
                    "point1_x": triangle.coordinates[0][0][0],
                    "point1_y": triangle.coordinates[0][0][1],
                    "point2_x": triangle.coordinates[0][1][0],
                    "point2_y": triangle.coordinates[0][1][1],
                    "point3_x": triangle.coordinates[0][2][0],
                    "point3_y": triangle.coordinates[0][2][1],
                } );
            }

            dbh.do( sql`DELETE FROM geotarget_triangle WHERE geotarget_id = ?`, [id] );
            dbh.do( sql`INSERT INTO geotarget_triangle`.VALUES( values ) );

            const res = result( 200 );

            mutex.signal.broadcast( res );

            mutexSet.delete( mutex );

            return res;
        }
    }
}
