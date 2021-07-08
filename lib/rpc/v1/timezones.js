import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";
import { IANAZone, DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );
const IANA_ZONE_CACHE = {};
const OFFSET_TEXT_CACHE = {};
const QUERIES = {
    "get": sql`SELECT * FROM "timezone" WHERE "abbr" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT * FROM "timezone"`.prepare(),
};

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        api.app.on( "update", target => {
            if ( target === "datasets" ) CACHE.reset();
        } );
    }

    async API_get ( ctx, id, options = {} ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        CACHE.set( id, res );

        if ( options.offsets && res.ok ) {
            this.#addOffsets( res.data );
        }

        return res;
    }

    async API_get_all ( ctx, options = {} ) {
        const res = await this.dbh.select( QUERIES.get_all );

        if ( options.offsets && res.data ) {
            for ( const tz of res.data ) this.#addOffsets( tz );
        }

        return res;
    }

    async API_get_by_coordinates ( ctx, coordinates, options = {} ) {
        const names = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !names ) return result( 200 );

        const res = await this.dbh.select( sql`SELECT * FROM "timezone" WHERE "id"`.IN( names ) );

        if ( options.offsets && res.data ) {
            for ( const tz of res.data ) this.#addOffsets( tz );
        }

        return res;
    }

    // private
    #addOffsets ( tz ) {
        tz.offsetMinutes = DateTime.fromObject( { "zone": this.#getIANAZone( tz.id ) } ).offset;

        tz.offsetText = this.#getOffsetText( tz.offsetMinutes );
    }

    #getIANAZone ( id ) {
        IANA_ZONE_CACHE[id] ||= new IANAZone( id );

        return IANA_ZONE_CACHE[id];
    }

    #getOffsetText ( offsetMinutes ) {
        if ( !OFFSET_TEXT_CACHE[offsetMinutes] ) {
            if ( offsetMinutes < 0 ) OFFSET_TEXT_CACHE[offsetMinutes] = "-" + Duration.fromObject( { "minutes": Math.abs( offsetMinutes ) } ).toFormat( "hh:mm" );
            else if ( offsetMinutes > 0 ) OFFSET_TEXT_CACHE[offsetMinutes] = "+" + Duration.fromObject( { "minutes": offsetMinutes } ).toFormat( "hh:mm" );
            else OFFSET_TEXT_CACHE[offsetMinutes] = "±" + Duration.fromObject( { "minutes": offsetMinutes } ).toFormat( "hh:mm" );
        }

        return OFFSET_TEXT_CACHE[offsetMinutes];
    }
}
