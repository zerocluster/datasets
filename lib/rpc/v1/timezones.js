import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";
import { DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "timezone" WHERE "abbr" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "timezone"`.prepare(),
};

export default class extends Base {
    async API_get ( ctx, id, options = {} ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        return res;
    }

    async API_get_all ( ctx, options = {} ) {
        return this.dbh.select( QUERIES.get_all );
    }

    async API_get_by_coordinates ( ctx, coordinates, options = {} ) {
        const names = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !names ) return result( 200 );

        return await this.dbh.select( sql`SELECT * FROM "timezone" WHERE "id"`.IN( names ) );
    }

    // private
    #getOffsets ( tz ) {
        const offsetMinutes = DateTime.fromObject( { "zone": this } ).offset;

        var offsetText;

        if ( offsetMinutes < 0 ) offsetText = "-" + Duration.fromObject( { "minutes": Math.abs( offsetMinutes ) } ).toFormat( "hh:mm" );
        else if ( offsetMinutes > 0 ) offsetText = "+" + Duration.fromObject( { "minutes": offsetMinutes } ).toFormat( "hh:mm" );
        else offsetText = "±" + Duration.fromObject( { "minutes": offsetMinutes } ).toFormat( "hh:mm" );

        return { offsetMinutes, offsetText };
    }
}
