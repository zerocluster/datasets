import * as config from "#core/config";
import booleanContains from "@turf/boolean-contains";
import bbox from "@turf/bbox";
import RBush from "rbush";
import CONST from "#lib/const";

const tree = buildTree();

function buildTree () {
    const json = config.read( CONST.index["countries.geo.json"].path );

    const tree = new RBush( 7 );

    for ( const feature of json.features ) {
        const country = feature.properties.ISO_A3;

        const multipolygon = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

        for ( const coordinates of multipolygon ) {
            const _bbox = bbox( { "type": "Polygon", coordinates } );

            const record = {
                country,
                "type": "Polygon",
                "minX": _bbox[0],
                "minY": _bbox[1],
                "maxX": _bbox[2],
                "maxY": _bbox[3],
                coordinates,
            };

            tree.insert( record );
        }
    }

    return tree;
}

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
