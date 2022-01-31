import Resource from "#lib/resource";
import url from "url";
import sql from "#core/sql";
import fetch from "#core/fetch";

const VERSION = 3;

export default class GeoTargets extends Resource {

    // properties
    get id () {
        return "geotargets";
    }

    get files () {
        return ["geotargets.sqlite"];
    }

    // public
    async getEtag () {
        const res = await this.#getDownloadUrl();

        if ( !res.ok ) return res;

        return result( 200, VERSION + ":" + new Date( res.data.modified ).toISOString() );
    }

    async build ( location ) {
        const cities = {};
        ( await ( await fetch( "https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/download/?format=json&timezone=Europe/Helsinki&lang=en" ) ).json() ).forEach( city => ( ( cities[city.fields.country_code.toLowerCase()] ||= {} )[city.fields.name.toLowerCase()] = city ) );

        const countries = {};
        this._readJson( this.sourcePath + "/country.json" ).forEach( country => ( countries[country.iso2.toLowerCase()] = country ) );

        var res = await this.#getDownloadUrl();

        if ( !res.ok ) return res;

        const dbh = await sql.new( url.pathToFileURL( location + "/" + this.files[0] ) ),
            { "default": csv } = await import( "fast-csv" ),
            uule = await import( "#core/utils/uule" );

        dbh.exec( sql`
CREATE TABLE IF NOT EXISTS geotarget (
    id int4 PRIMARY KEY NOT NULL,
    name text NOT NULL COLLATE NOCASE,
    canonical_name text NOT NULL COLLATE NOCASE,
    parent_id text,
    country text COLLATE NOCASE,
    type text COLLATE NOCASE,
    status text COLLATE NOCASE,
    uule text,
    coordinates json,
    timezone text
);

CREATE INDEX geotarget_name_idx ON geotarget ( name );
CREATE INDEX geotarget_canonical_name_idx ON geotarget ( canonical_name );
CREATE INDEX geotarget_type_country_idx ON geotarget ( type = 'country', country );
CREATE INDEX geotarget_type_nams_country_idx ON geotarget ( type, name, country );
` );

        res = await fetch( res.data.url );
        if ( !res.ok ) throw res;

        const data = await res.buffer();

        const values = [];

        await new Promise( resolve => {
            csv.parseString( data, { "headers": headers => ["id", "name", "canonical_name", "parent_id", "country", "type", "status"] } )
                .on( "error", error => console.error( error ) )
                .on( "data", row => {
                    row.type = row.type.toLowerCase();
                    row.status = row.status.toLowerCase();

                    row.uule = uule.encode( row.canonical_name );

                    if ( row.type === "country" ) {
                        row.coordinates = countries[row.country.toLowerCase()].coordinates;
                    }
                    else if ( row.type === "city" ) {
                        const city = cities[row.country.toLowerCase()][row.name.toLowerCase()];

                        if ( city ) {
                            row.timezone = city.timezone;
                            row.coordinates = { "latitude": city.coordinates[0], "longitude": city.coordinates[1] };
                        }
                    }

                    values.push( row );
                } )
                .on( "end", rowCount => {
                    resolve();
                } );
        } );

        dbh.do( sql`INSERT INTO "geotarget"`.VALUES( values ) );

        dbh.close();

        return result( 200 );
    }

    // private
    async #getDownloadUrl () {
        const res = await fetch( "https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1" );
        if ( !res.ok ) return res;

        const text = await res.text();

        const match = text.match( /href="\/adwords\/api\/docs\/appendix\/geo\/geotargets-(\d{4}-\d{2}-\d{2})\.csv"/ );

        if ( !match ) return result( [500, `Geotargets parsing error`] );

        return result( 200, {
            "modified": match[1],
            "url": `https://developers.google.com/adwords/api/docs/appendix/geo/geotargets-${match[1]}.csv`,
        } );
    }
}
