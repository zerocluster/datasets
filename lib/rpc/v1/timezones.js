import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";
import { IANAZone, DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );
const IANA_ZONE_CACHE = {};
const OFFSET_TEXT_CACHE = {};
const ALL_ID = Symbol();
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

    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        if ( res.ok ) {
            this.#addOffsets( res.data );

            CACHE.set( id, res, this.#getMaxAge() );
        }
        else {
            CACHE.set( id, res );
        }

        return res;
    }

    async API_get_all ( ctx ) {
        var res = CACHE.get( ALL_ID );

        if ( res ) return res;

        res = await this.dbh.select( QUERIES.get_all );

        for ( const tz of res.data ) this.#addOffsets( tz );

        CACHE.set( ALL_ID, res, this.#getMaxAge() );

        return res;
    }

    async API_get_by_coordinates ( ctx, coordinates ) {
        const names = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !names ) return result( 200 );

        const res = await this.dbh.select( sql`SELECT * FROM "timezone" WHERE "id"`.IN( names ) );

        if ( res.data ) {
            for ( const tz of res.data ) this.#addOffsets( tz );
        }

        return res;
    }

    // private
    #getMaxAge () {
        const d = new Date();

        d.setHours( d.getHours() + 1 );
        d.setMinutes( 0 );
        d.setSeconds( 0 );
        d.setMilliseconds( 0 );

        return d - new Date();
    }

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
