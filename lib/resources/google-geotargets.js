import Resource from "#lib/resource";
import url from "url";
import sql from "#core/sql";
import fetch from "#core/fetch";

export default class GoogleGeoTargets extends Resource {

    // properties
    get id () {
        return "google-geotargets";
    }

    get files () {
        return ["google-geotargets.sqlite"];
    }

    // public
    async getETag () {
        const res = await this.#getDownloadURL();

        if ( !res.ok ) return res;

        return result( 200, new Date( res.data.modified ) );
    }

    async build ( location ) {
        var res = await this.#getDownloadURL();

        if ( !res.ok ) return res;

        const dbh = await sql.new( url.pathToFileURL( location + "/" + this.files[0] ) ),
            { "default": csv } = await import( "fast-csv" ),
            uule = await import( "#core/api/google/uule" );

        await dbh.exec( sql`
CREATE TABLE IF NOT EXISTS "geotarget" (
    "id" int4 PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "canonical_name" text NOT NULL,
    "parent_id" text,
    "country" text,
    "type" text,
    "status" text,
    "uule" text
);

CREATE INDEX idx_geotarget_canonical_name ON "geotarget" ("canonical_name");
CREATE INDEX idx_geotarget_type ON "geotarget" ("type");
CREATE INDEX idx_geotarget_status ON "geotarget" ("status");
    ` );

        res = await fetch( res.data.url );
        if ( !res.ok ) throw res;

        const data = await res.body.buffer();

        const values = [];

        await new Promise( resolve => {
            csv.parseString( data, { "headers": headers => ["id", "name", "canonical_name", "parent_id", "country", "type", "status"] } )
                .on( "error", error => console.error( error ) )
                .on( "data", row => {
                    row.type = row.type.toLowerCase();
                    row.status = row.status.toLowerCase();

                    row.uule = uule.encode( row.canonical_name );

                    values.push( row );
                } )
                .on( "end", rowCount => {
                    resolve();
                } );
        } );

        await dbh.do( sql`INSERT INTO "geotarget"`.VALUES( values ) );

        dbh.close();

        return result( 200 );
    }

    // private
    async #getDownloadURL () {
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
