import sql from "#core/sql";
import externalResources from "#lib/external-resources";

const SQL = {
    "get": sql`SELECT point1_x, point1_y, point2_x, point2_y, point3_x, point3_y FROM osm_triangle WHERE geotarget_id = ? AND max >= ?`.prepare(),
};

const dbh = externalResources.cacheDbh;

function getTriangle ( geoTargetId ) {
    const probability = Math.random();

    const coords = dbh.selectRow( SQL.get, [ geoTargetId, probability ] );

    // no triangles
    if ( !coords.data ) return;

    return {
        "type": "Polygon",
        "coordinates": [
            [

                //
                [ coords.data.point1_x, coords.data.point1_y ],
                [ coords.data.point2_x, coords.data.point2_y ],
                [ coords.data.point3_x, coords.data.point3_y ],
            ],
        ],
    };
}

function getRandomPoinOnTriangle ( triangle ) {
    const coords = triangle.coordinates[ 0 ];

    const x = Math.random(),
        y = Math.random();

    const q = Math.abs( x - y );

    const s = q;
    const t = 0.5 * ( x + y - q );
    const u = 1 - 0.5 * ( q + x + y );

    return {
        "longitude": s * coords[ 0 ][ 0 ] + t * coords[ 1 ][ 0 ] + u * coords[ 2 ][ 0 ],
        "latitude": s * coords[ 0 ][ 1 ] + t * coords[ 1 ][ 1 ] + u * coords[ 2 ][ 1 ],
    };
}

export default function getGeoTargetRandomCoordinates ( geoTargetId ) {
    const triangle = getTriangle( geoTargetId );

    if ( !triangle ) return;

    const point = getRandomPoinOnTriangle( triangle );

    return point;
}
