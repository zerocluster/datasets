import maxmind from "#lib/maxmind";

export default Super =>
    class extends Super {
        async API_asn ( ctx, addr ) {
            return result( 200, maxmind.asn.get( addr ) );
        }

        async API_country ( ctx, addr ) {
            return result( 200, maxmind.country.get( addr ) );
        }

        async API_city ( ctx, addr ) {
            return result( 200, maxmind.city.get( addr ) );
        }
    };
