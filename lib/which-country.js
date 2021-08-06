import * as config from "#core/config";
import * as turf from "@turf/turf";
import rbush from "rbush";

const json = config.read( "countries.geo.json" );

const tree = rbush( 7, [".minLng", ".minLat", ".maxLng", ".maxLat"] );

for ( const feature of json.features ) {
    const country = feature.properties.ISO_A3;

    const multipolygon = feature.geometry.type === "MultiPolygon" ? feature.geometry.coordinates : [feature.geometry.coordinates];

    for ( const coordinates of multipolygon ) {
        const bbox = turf.bbox( { "type": "Polygon", coordinates } );

        const record = {
            country,
            "type": "Polygon",
            coordinates,
            "minLng": bbox[0],
            "minLat": bbox[1],
            "maxLng": bbox[2],
            "maxLat": bbox[3],
        };

        tree.insert( record );
    }
}

export default function getCountry ( coordinates ) {
    var polygons = tree.search( [coordinates.longitude, coordinates.latitude, coordinates.longitude, coordinates.latitude] );

    const point = { "type": "Point", "coordinates": [coordinates.longitude, coordinates.latitude] };

    for ( const polygon of polygons ) {
        if ( turf.booleanContains( polygon, point ) ) {
            return polygon.country;
        }
    }
}
