import ExternalResourceBuilder from "#core/external-resource-builder";
import url from "node:url";
import sql from "#core/sql";
import fetch from "#core/fetch";
import { DOMParser } from "linkedom";
import csv from "#core/csv";
import * as uule from "#core/api/google/uule";

const VERSION = 4;

export default class GeoTargets extends ExternalResourceBuilder {

    // properties
    get id () {
        return "zerocluster/datasets/resources/geotargets";
    }

    // protected
    async _getEtag () {
        const res = await this.#getDownloadUrl();

        if ( !res.ok ) return res;

        return result( 200, VERSION + ":" + new Date( res.data.modified ).toISOString() );
    }

    async _build ( location ) {
        var res = await this.#getDownloadUrl();

        if ( !res.ok ) return res;

        const dbh = await sql.new( url.pathToFileURL( location + "/geotargets.sqlite" ) );

        dbh.exec( sql`
CREATE TABLE IF NOT EXISTS geotarget (
    id int4 PRIMARY KEY,
    name text NOT NULL COLLATE NOCASE,
    canonical_name text NOT NULL COLLATE NOCASE,
    parent_id text,
    country text COLLATE NOCASE,
    type text COLLATE NOCASE,
    status text COLLATE NOCASE,
    uule text
);

CREATE INDEX geotarget_name_idx ON geotarget ( name );
CREATE INDEX geotarget_canonical_name_idx ON geotarget ( canonical_name );
CREATE INDEX geotarget_type_country_idx ON geotarget ( type = 'country', country );
CREATE INDEX geotarget_type_nams_country_idx ON geotarget ( type, name, country );
` );

        res = await fetch( res.data.url );
        if ( !res.ok ) throw res;

        let data = await res.text();

        // NOTE patch
        data = data.replace( `"9041231","Athens International Airport """Eleftherios Venizelos"""","Athens International Airport """Eleftherios Venizelos""",Decentralized Administration of Attica,Greece","9069538","GR","Airport",Active\n`, "" );

        const values = csv.parse( data, { "header": ["id", "name", "canonical_name", "parent_id", "country", "type", "status"] } ).map( row => {
            row.type = row.type.toLowerCase();
            row.status = row.status.toLowerCase();

            row.uule = uule.encode( row.canonical_name );

            return row;
        } );

        dbh.do( sql`INSERT INTO "geotarget"`.VALUES( values ) );

        dbh.destroy();

        return result( 200 );
    }

    // private
    async #getDownloadUrl () {
        const res = await fetch( "https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1" );
        if ( !res.ok ) return res;

        const text = await res.text();

        const document = new DOMParser().parseFromString( text, "text/html" );

        const link = document.querySelector( `a:contains("Latest zipped CSV")` );

        if ( !link ) return result( [500, `Geotargets parsing error`] );

        const href = link.getAttribute( "href" );

        return result( 200, {
            "modified": href.slice( -18, -8 ),
            "url": `https://developers.google.com${href.replace( ".zip", "" )}`,
        } );
    }
}
