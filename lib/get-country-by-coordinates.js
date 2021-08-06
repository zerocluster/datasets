import * as config from "#core/config";
import booleanContains from "@turf/boolean-contains";
import _bbox from "@turf/bbox";
import RBush from "rbush";
import CONST from "#lib/const";

const tree = buildTree();

export default function getCountryByCoordinates ( coordinates ) {
    var polygons = tree.search( {
        "minX": coordinates.longitude,
        "minY": coordinates.latitude,
        "maxX": coordinates.longitude,
        "maxY": coordinates.latitude,
    } );

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

    const tree = new RBush( 7 );

    for ( const feature of json.features ) {
        const country = feature.properties.ISO_A3;

        const multipolygon = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

        for ( const coordinates of multipolygon ) {
            const bbox = _bbox( { "type": "Polygon", coordinates } );

            const record = {
                country,
                "type": "Polygon",
                "minX": bbox[0],
                "minY": bbox[1],
                "maxX": bbox[2],
                "maxY": bbox[3],
                coordinates,
            };

            tree.insert( record );
        }
    }

    console.log( "OK" );

    return tree;
}
