import * as config from "#core/config";
import booleanContains from "@turf/boolean-contains";
import bbox from "@turf/bbox";
import RBush from "rbush";
import CONST from "#lib/const";
import updater from "#lib/updater";

updater.on( "update", dataset => {
    if ( dataset === "gountries.geo.json" ) buildTree();
} );

var tree;

buildTree();

function buildTree () {
    const json = config.read( CONST.path + "/" + CONST.index["countries.geo.json"].name );

    tree = new RBush( 7 );

    for ( const feature of json.features ) {
        const country_iso2 = feature.properties.ISO_A2;

        const multipolygon = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

        for ( const coordinates of multipolygon ) {
            const _bbox = bbox( { "type": "Polygon", coordinates } );

            const record = {
                country_iso2,
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
}

export default function getCountryByCoordinates ( coordinates ) {
    if ( !Array.isArray( coordinates ) ) coordinates = [coordinates.longitude, coordinates.latitude];

    var polygons = tree.search( {
        "minX": coordinates[0],
        "minY": coordinates[1],
        "maxX": coordinates[0],
        "maxY": coordinates[1],
    } );

    const point = { "type": "Point", coordinates };

    for ( const polygon of polygons ) {
        if ( booleanContains( polygon, point ) ) {
            return polygon.country_iso2;
        }
    }
}
