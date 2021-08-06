import * as config from "#core/config";
import booleanContains from "@turf/boolean-contains";
import _bbox from "@turf/bbox";
import rbush from "rbush";
import CONST from "#lib/const";

const tree = buildTree();

export default function getCountryByCoordinates ( coordinates ) {
    var polygons = tree.search( [coordinates.longitude, coordinates.latitude, coordinates.longitude, coordinates.latitude] );

    const point = { "type": "Point", "coordinates": [coordinates.longitude, coordinates.latitude] };

    for ( const polygon of polygons ) {
        if ( booleanContains( polygon, point ) ) {
            return polygon.country;
        }
    }
}

function buildTree () {
    process.stdout.write( "Building countries index ... " );

    const json = config.read( CONST.index["countries.geo.json"].location );

    const tree = rbush( 7, [".minLongitude", ".minLatitude", ".maxLongitude", ".maxLatitude"] );

    for ( const feature of json.features ) {
        const country = feature.properties.ISO_A3;

        const multipolygon = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

        for ( const coordinates of multipolygon ) {
            const bbox = _bbox( { "type": "Polygon", coordinates } );

            const record = {
                country,
                "type": "Polygon",
                "minLongitude": bbox[0],
                "minLatitude": bbox[1],
                "maxLongitude": bbox[2],
                "maxLatitude": bbox[3],
                coordinates,
            };

            tree.insert( record );
        }
    }

    console.log( "OK" );

    return tree;
}
