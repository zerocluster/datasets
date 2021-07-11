import Base from "#core/app/api/prototypes/base";
import sql from "#core/sql";
import geoTZ from "geo-tz";
import LRUCache from "lru-cache";
import { IANAZone, DateTime, Duration } from "luxon";

var IDX_ID;
var IDX_NAME;
var IDX_ABBR;
const CACHE = new LRUCache();
const IANA_ZONE_CACHE = {};
const OFFSET_TEXT_CACHE = {};
const ALL_CACHE_ID = Symbol();

const QUERIES = {
    "all": sql`SELECT * from "timezone"`.prepare(),
};

export default class extends Base {
    constructor ( api ) {
        super( api );

        // set update listener
        api.app.on( "update", target => {
            if ( target === "datasets" ) {
                IDX_ID = null;
                IDX_NAME = null;
                IDX_ABBR = null;

                CACHE.reset();
            }
        } );
    }

    async API_get ( ctx, id ) {
        id = id.toUpperCase();

        if ( !IDX_ID ) await this.#fetchAll();

        const tz = IDX_ID[id] || IDX_NAME[id] || IDX_ABBR[id];

        // timezone not found
        if ( !tz ) return result( 200 );

        var res = CACHE.get( tz.id );

        // from cache
        if ( res ) return res;

        res = result( 200, tz );

        IANA_ZONE_CACHE[tz.id] ||= new IANAZone( tz.id );

        const dt = DateTime.fromObject( { "zone": IANA_ZONE_CACHE[tz.id] } ),
            midnight = dt.set( { "hours": 23, "minutes": 59, "seconds": 59, "milliseconds": 999 } );

        tz.offsetMinutes = dt.offset;
        tz.offsetText = this.#getOffsetText( tz.offsetMinutes );

        res["cache-control-expires"] = midnight.toUTC();

        CACHE.set( tz.id, res, midnight.diff( dt ).toMillis() );

        return res;
    }

    async API_get_all ( ctx ) {
        var res = CACHE.get( ALL_CACHE_ID );

        // from cache
        if ( res ) return res;

        if ( !IDX_ID ) await this.#fetchAll();

        res = result( 200, [] );

        for ( const id in IDX_ID ) {
            const tz = await this.API_get( ctx, id );

            res.data.push( tz.data );

            if ( !res["cache-control-expires"] || tz["cache-control-expires"] < res["cache-control-expires"] ) {
                res["cache-control-expires"] = tz["cache-control-expires"];
            }
        }

        CACHE.set( ALL_CACHE_ID, res, res["cache-control-expires"] - DateTime.utc() );

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
    async #fetchAll () {
        const res = await this.dbh.select( QUERIES.all );

        IDX_ID = {};
        IDX_NAME = {};
        IDX_ABBR = {};

        for ( const row of res.data ) {
            IDX_ID[row.id.toUpperCase()] = row;
            IDX_NAME[row.name.toUpperCase()] = row;
            IDX_ABBR[row.abbr.toUpperCase()] = row;
        }
    }

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
