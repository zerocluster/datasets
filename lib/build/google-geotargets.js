import Build from "#lib/build";
import sql from "#core/sql";
import csv from "fast-csv";
import * as uule from "#core/api/google/uule";
import url from "url";
import fetch from "#core/fetch";

export default class extends Build {
    #lastModified;
    #downloadURL;

    // protected
    async _getUpdated () {
        if ( !this.#lastModified ) {
            const res = await this.#getDownloadURL();

            if ( !res.ok ) return res;
        }

        return { "lastModified": this.#lastModified };
    }

    async _build ( path ) {
        if ( !this.#downloadURL ) {
            const res = await this.#getDownloadURL();

            if ( !res.ok ) return res;
        }

        const dbh = await sql.new( url.pathToFileURL( path ) );

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

        const res = await fetch( this.#downloadURL );
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

        dbh.db.close();

        return result( 200 );
    }

    // private
    async #getDownloadURL () {
        if ( !this.#lastModified ) {
            const res = await fetch( "https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1" );
            if ( !res.ok ) return res;

            const text = await res.text();

            const match = text.match( /href="\/adwords\/api\/docs\/appendix\/geo\/geotargets-(\d{4}-\d{2}-\d{2})\.csv"/ );

            if ( !match ) return result( [500, `Geotargets parsing error`] );

            this.#lastModified = new Date( match[1] ).toISOString();
            this.#downloadURL = `https://developers.google.com/adwords/api/docs/appendix/geo/geotargets-${match[1]}.csv`;
        }

        return result( 200 );
    }
}
