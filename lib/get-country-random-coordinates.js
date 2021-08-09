import sql from "#core/sql";

const q = sql`SELECT "point1_x", "point1_y", "point2_x", "point2_y", "point3_x", "point3_y" FROM "triangle" WHERE "country_iso2" = ? AND "max" >= ?`.prepare();

async function getTriangle ( app, country_iso2 ) {
    const probability = Math.random();

    const coords = await ( await app.dbh( "countries-triangles" ) ).selectRow( q, [country_iso2, probability] );

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

export default async function getCountryRandomCoordinates ( app, country_iso2 ) {
    const triangle = await getTriangle( app, country_iso2 );

    const point = getRandomPoinOnTriangle( triangle );

    return point;
}
