import geoipCountry from "#core/geoip-country";
import geoipAsn from "#core/geoip-asn";
import geoipCity from "#core/geoip-city";

export default Super =>
    class extends Super {
        async API_asn ( ctx, addr ) {
            return result( 200, geoipAsn.get( addr ) );
        }

        async API_country ( ctx, addr ) {
            return result( 200, geoipCountry.get( addr ) );
        }

        async API_city ( ctx, addr ) {
            return result( 200, geoipCity.get( addr ) );
        }
    };
