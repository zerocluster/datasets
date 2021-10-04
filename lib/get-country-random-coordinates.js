import sql from "#core/sql";
import datasets from "#lib/datasets";

const q = sql`SELECT "point1x", "point1y", "point2x", "point2y", "point3x", "point3y" FROM "triangle" WHERE "country_iso2" = ? AND "max" >= ?`.prepare();

var dbh = await datasets.dbh( "countries-triangles" );

datasets.on( "update", async dataset => {
    if ( dataset === "countries-triangles" ) dbh = await datasets.dbh( "countries-triangles" );
} );

function getTriangle ( countryIso2 ) {
    const probability = Math.random();

    const coords = dbh.selectRow( q, [countryIso2, probability] );

    return {
        "type": "Polygon",
        "coordinates": [
            [

                //
                [coords.data.point1x, coords.data.point1y],
                [coords.data.point2x, coords.data.point2y],
                [coords.data.point3x, coords.data.point3y],
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

export default function getCountryRandomCoordinates ( countryIso2 ) {
    const triangle = getTriangle( countryIso2 );

    const point = getRandomPoinOnTriangle( triangle );

    return point;
}
