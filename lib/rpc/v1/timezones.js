import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";
import { IANAZone, DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );

const QUERIES = {
    "get": sql`SELECT * FROM "timezone" WHERE "abbr" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "timezone"`.prepare(),
};

export default class extends Base {
    #ianaZones = {};

    async API_get ( ctx, id, options = {} ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        if ( res.ok && options.offsets ) res.data = { ...res.data, ...this.#getOffsets( res.data.id ) };

        return res;
    }

    async API_get_all ( ctx, options = {} ) {
        const res = await this.dbh.select( QUERIES.get_all );

        if ( res.data && options.offsets ) {
            res.data = res.data.map( tz => {
                return { ...tz, ...this.#getOffsets( tz.id ) };
            } );
        }

        return res;
    }

    async API_get_by_coordinates ( ctx, coordinates, options = {} ) {
        const names = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !names ) return result( 200 );

        const res = await this.dbh.select( sql`SELECT * FROM "timezone" WHERE "id"`.IN( names ) );

        if ( res.data && options.offsets ) {
            res.data = res.data.map( tz => {
                return { ...tz, ...this.#getOffsets( tz.id ) };
            } );
        }

        return res;
    }

    // private
    #getOffsets ( tz ) {
        const offsetMinutes = DateTime.fromObject( { "zone": this.#getIANAZone( tz ) } ).offset;

        var offsetText;

        if ( offsetMinutes < 0 ) offsetText = "-" + Duration.fromObject( { "minutes": Math.abs( offsetMinutes ) } ).toFormat( "hh:mm" );
        else if ( offsetMinutes > 0 ) offsetText = "+" + Duration.fromObject( { "minutes": offsetMinutes } ).toFormat( "hh:mm" );
        else offsetText = "±" + Duration.fromObject( { "minutes": offsetMinutes } ).toFormat( "hh:mm" );

        return { offsetMinutes, offsetText };
    }

    #getIANAZone ( id ) {
        this.#ianaZones[id] ||= new IANAZone( id );

        return this.#ianaZones[id];
    }
}
