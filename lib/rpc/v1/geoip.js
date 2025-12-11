import geoipAsn from "@c0rejs/geoip-asn";
import geoipCity from "@c0rejs/geoip-city";
import geoipCountry from "#core/geoip-country";

export default Super =>
    class extends Super {

        // public
        async [ "API_asn" ] ( ctx, addr ) {
            return result( 200, geoipAsn.get( addr ) );
        }

        async [ "API_country" ] ( ctx, addr ) {
            return result( 200, geoipCountry.get( addr ) );
        }

        async [ "API_city" ] ( ctx, addr ) {
            return result( 200, geoipCity.get( addr ) );
        }
    };
