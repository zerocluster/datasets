import Prototype from "#core/app/prototype";
import maxmind from "#lib/maxmind";

export default class extends Prototype {
    async API_asn ( ctx, addr ) {
        return result( 200, maxmind.asn.get( addr ) );
    }

    async API_country ( ctx, addr ) {
        return result( 200, maxmind.country.get( addr ) );
    }

    async API_city ( ctx, addr ) {
        return result( 200, maxmind.city.get( addr ) );
    }
}
