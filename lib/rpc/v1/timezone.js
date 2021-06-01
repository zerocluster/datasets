import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";

// import { IANAZone, DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "timezone" WHERE "abbr" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "timezone"`.prepare(),
};

export default class extends Base {
    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx ) {
        return this.dbh.selectAll( QUERIES.get_all );
    }

    async API_get_by_coordinates ( ctx, coordinates ) {
        const names = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !names ) return result( 200 );

        return await this.dbh.selectAll( sql`SELECT * FROM "timezone" WHERE "id"`.IN( names ) );
    }
}

// XXX cache???
// get offsetMinutes () {
//     const offset = DateTime.fromObject( { "zone": this } ).offset;

//     return offset;
// }

// // XXX cache???
// get offsetHours () {
//     const offset = this.offsetMinutes;

//     if ( offset < 0 ) return "-" + Duration.fromObject( { "minutes": Math.abs( offset ) } ).toFormat( "hh:mm" );
//     else if ( offset > 0 ) return "+" + Duration.fromObject( { "minutes": offset } ).toFormat( "hh:mm" );
//     else return "±" + Duration.fromObject( { "minutes": offset } ).toFormat( "hh:mm" );
// }
