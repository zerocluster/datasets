# RPC v1

### API connect URLs

-   API HTTP URL: `http://datasets:8080/`
-   API WebSockets URL: `ws://datasets:8080/`

<!-- tabs:start -->

#### **WebSockets**

<!-- prettier-ignore -->
```javascript
import Api from "@softvisio/core/api";

const api = Api.new( "ws://datasets:8080/" )
```

#### **HTTP**

<!-- prettier-ignore -->
```javascript
import Api from "@softvisio/core/api";

const api = Api.new( "http://datasets:8080/" )
```

<!-- tabs:end -->

## Continent lookup

### Get continent by ISO code or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/continents/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/continents/get"
```

<!-- tabs:end -->

-   `id` <string\> Continent ISO alpha-2 code or name.

### Get all continents

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/continents/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    "http://datasets:8080/v1/continents/get-all"
```

<!-- tabs:end -->

## Country lookup

### Get country by ISO code or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/countries/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/countries/get"
```

<!-- tabs:end -->

-   `id` <string\> Country ISO alpha-2 code, ISO alpha-3 or name.

### Get all countries

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/countries/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    "http://datasets:8080/v1/countries/get-all"
```

<!-- tabs:end -->

### Get country by coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/countries/get-by-coordinates", coordinates );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[coordinates]' \
    "http://datasets:8080/v1/countries/get-by-coordinates"
```

<!-- tabs:end -->

-   `coordinates` <Object\> Coordinates object:
    -   `latitude` <number> Latitude.
    -   `longitude` <number> Longitude.

## Currency lookup

### Get currency by ISO code, symbol or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/currencies/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/currencies/get"
```

<!-- tabs:end -->

-   `id` <string\> Currency ISO alpha-3 code, symbol or name.

### Get all currencies

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/currencies/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    "http://datasets:8080/v1/currencies/get-all"
```

<!-- tabs:end -->

## Maxmind GeoIP lookup

### Search in ASN database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geoip/asn", addr );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[addr]' \
    "http://datasets:8080/v1/geoip/asn"
```

<!-- tabs:end -->

-   `addr` <string\> IP address.

### Search in Country database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geoip/country", addr );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[addr]' \
    "http://datasets:8080/v1/geoip/country"
```

<!-- tabs:end -->

-   `addr` <string\> IP address.

### Search in City database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geoip/city", addr );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[addr]' \
    "http://datasets:8080/v1/geoip/city"
```

<!-- tabs:end -->

-   `addr` <string\> IP address.

## Geo target lookup

### Get geotarget by id, canonical name or country iso2 code

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geotargets/get-geotarget", id, options? );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id, options?]' \
    "http://datasets:8080/v1/geotargets/get-geotarget"
```

<!-- tabs:end -->

-   `id` <number\> | <string\> Search criteria:
    -   <number\> Numeric identifier.
    -   <string\> Canonical name or country iso2 code.
-   `options?` <Object\>

### Suggest geotargets

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geotargets/suggest-geotargets", options );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[options]' \
    "http://datasets:8080/v1/geotargets/suggest-geotargets"
```

<!-- tabs:end -->

-   `options` <Object\>
    -   `where` <Object\> Set of the filters by field values:
        -   `name` <Array\> **Required**. Filter by the `name` field value:
            -   <string\> Filter operator, one of the: `"like"`.
            -   <string\> Field value.
        -   `type` <Array\> **Required**. Filter by the `type` field value:
            -   <string\> Filter operator, one of the: `"="`, `"in"`.
            -   <string\> Field value. Allowed values: `"airport"`, `"autonomous community"`, `"borough"`, `"canton"`, `"city"`, `"city region"`, `"congressional district"`, `"country"`, `"county"`, `"department"`, `"district"`, `"governorate"`, `"municipality"`, `"national park"`, `"neighborhood"`, `"okrug"`, `"postal code"`, `"prefecture"`, `"province"`, `"region"`, `"state"`, `"territory"`, `"tv region"`, `"union territory"`, `"university"`.
        -   `country` <Array\> Country ISO2 code. Filter by the `country` field value:
            -   <string\> Filter operator, one of the: `"="`.
            -   <string\> Field value.
    -   `limit` <integer\> Max rows to return. **Default:** `20`. This method returns `50` rows maximum.
    -   Example (this is the abstract data structure example, not related to the current method):
        ```json
        {
            "where": {
                "field_a": [">=", 100],
                "field_b": ["!=", null],
                "field_c": ["=", "string"]
            },
            "order_by": [
                ["field_a", "asc"],
                ["field_b", "desc"]
            ],
            "offset": 100,
            "limit": 50
        }
        ```

## Language lookup

### Get language by ISO code or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/languages/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/languages/get"
```

<!-- tabs:end -->

-   `id` <string\> Language ISO alpha-2, ISO alpha-3 code or name.

### Get all languages

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/languages/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    "http://datasets:8080/v1/languages/get-all"
```

<!-- tabs:end -->

## Timezone lookup

### Get timezone by abbreviation or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/timezones/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/timezones/get"
```

<!-- tabs:end -->

-   `id` <string\> Timezone id, abbreviatoin or name.

### Get all timezones

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/timezones/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    "http://datasets:8080/v1/timezones/get-all"
```

<!-- tabs:end -->

### Search for the timezone by the geo coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/timezones/get-by-coordinates", coordinates );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[coordinates]' \
    "http://datasets:8080/v1/timezones/get-by-coordinates"
```

<!-- tabs:end -->

-   `coordinates` <Object\> Coordinates object:
    -   `latitude` <number\> Latitude.
    -   `longitude` <number\> Longitude.
