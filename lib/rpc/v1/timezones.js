import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";
import { IANAZone, DateTime, Duration } from "luxon";

const CACHE = new LRUCache( { "max": 1000 } );
const IANA_ZONE_CACHE = {};
const OFFSET_TEXT_CACHE = {};
var ALL_TIMEZONES;
const ALL_ID = Symbol();
const QUERIES = {
    "get": sql`SELECT * FROM "timezone" WHERE "abbr" = ? OR "name" LIKE ?`.prepare(),
    "get_all": sql`SELECT "id" FROM "timezone"`.prepare(),
};

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        api.app.on( "update", target => {
            if ( target === "datasets" ) {
                CACHE.reset();
                ALL_TIMEZONES = null;
            }
        } );
    }

    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        var res = CACHE.get( id );

        if ( res ) return res;

        res = await this.dbh.selectRow( QUERIES.get, [id, id] );

        if ( res.ok ) {
            IANA_ZONE_CACHE[res.data.id] ||= new IANAZone( id );

            const dt = DateTime.fromObject( { "zone": IANA_ZONE_CACHE[res.data.id] } ),
                midnight = dt.set( { "hours": 23, "minutes": 59, "seconds": 59, "milliseconds": 999 } );

            res.data.offsetMinutes = dt.offset;
            res.data.offsetText = this.#getOffsetText( res.data.offsetMinutes );

            res["cache-control-expires"] = midnight.toUTC();

            CACHE.set( id, res, midnight.diff( dt ).toMillis() );
        }
        else {
            CACHE.set( id, res );
        }

        return res;
    }

    async API_get_all ( ctx ) {
        var res = CACHE.get( ALL_ID );

        if ( res ) return res;

        if ( !ALL_TIMEZONES ) {
            ALL_TIMEZONES = ( await this.dbh.select( QUERIES.get_all ) ).data.map( row => row.id );
        }

        res = result( 200, [] );

        for ( const id of ALL_TIMEZONES ) {
            const tz = await this.API_get( ctx, id );

            res.data.push( tz.data );

            if ( !res["cache-control-expires"] || tz["cache-control-expires"] < res["cache-control-expires"] ) {
                res["cache-control-expires"] = tz["cache-control-expires"];
            }
        }

        CACHE.set( ALL_ID, res, res["cache-control-expires"] - DateTime.utc() );

        return res;
    }

    async API_get_by_coordinates ( ctx, coordinates ) {
        const timezones = geoTZ( coordinates.latitude, coordinates.longitude );

        if ( !timezones ) return result( 200 );

        const res = result( 200, [] );

        for ( const id of timezones ) {
            const tz = await this.API_get( ctx, id );

            res.data.push( tz.data );

            if ( !res["cache-control-expires"] || tz["cache-control-expires"] < res["cache-control-expires"] ) {
                res["cache-control-expires"] = tz["cache-control-expires"];
            }
        }

        return res;
    }

    // private
    #getOffsetText ( offsetMinutes ) {
        if ( !OFFSET_TEXT_CACHE[offsetMinutes] ) {
            const offsetText = Duration.fromObject( { "minutes": Math.abs( offsetMinutes ) } ).toFormat( "hh:mm" );

            if ( offsetMinutes < 0 ) OFFSET_TEXT_CACHE[offsetMinutes] = "-" + offsetText;
            else if ( offsetMinutes > 0 ) OFFSET_TEXT_CACHE[offsetMinutes] = "+" + offsetText;
            else OFFSET_TEXT_CACHE[offsetMinutes] = "±" + offsetText;
        }

        return OFFSET_TEXT_CACHE[offsetMinutes];
    }
}
