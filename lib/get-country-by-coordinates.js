import sql from "#core/sql";
import booleanContains from "@turf/boolean-contains";
import RBush from "rbush";

var tree;

export default async function getCountryByCoordinates ( app, coordinates ) {
    tree ??= await buildTree( app );

    var polygons = tree.search( {
        "minX": coordinates.longitude,
        "minY": coordinates.latitude,
        "maxX": coordinates.longitude,
        "maxY": coordinates.latitude,
    } );

    if ( !polygons.length ) return;

    const data = await ( await app.dbh( "countries-polygons" ) ).select( sql`SELECT "country_iso2", "geojson" FROM "polygon" WHERE "id"`.IN( polygons.map( polygon => polygon.id ) ) );

    const point = { "type": "Point", "coordinates": [coordinates.longitude, coordinates.latitude] };

    for ( const polygon of data.data ) {
        if ( booleanContains( polygon.geojson, point ) ) {
            return polygon.country_iso2;
        }
    }
}

async function buildTree ( app ) {
    const res = await ( await app.dbh( "countries-polygons" ) ).select( sql`SELECT "id", "minLongitude" AS "minX", "minLatitude" AS "minY", "maxLongitude" AS "maxX", "maxLatitude" AS "maxY" FROM "polygon"` );

    const tree = new RBush( 7 );

    for ( const feature of res.data ) {
        tree.insert( feature );
    }

    return tree;
}
