# RPC v1

### API connect URLs

-   API HTTP URL: `http://datasets:8080/`
-   API WebSockets URL: `ws://datasets:8080/`

<!-- tabs:start -->

#### **WebSockets**

<!-- prettier-ignore -->
```javascript
const api = API.new( "ws://datasets:8080/" )
```

#### **HTTP**

<!-- prettier-ignore -->
```javascript
const api = API.new( "http://datasets:8080/" )
```

<!-- tabs:end -->

## Continent lookup

### Get continent by ISO2 or name

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

### Get country by ISO2, ISO3 or name

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

### Get currency by ISO3, symbol or name

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

## Google GEOTarget lookup

### Get GEOTarget by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geotargets/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/geotargets/get"
```

<!-- tabs:end -->

-   `id` <number\> | <string\> Search criteria:
    -   <number\> Numeric identifier.
    -   <string\> Canonical name.

### Get GEOTarget geojson by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/geotargets/get-geojson", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[id]' \
    "http://datasets:8080/v1/geotargets/get-geojson"
```

<!-- tabs:end -->

-   `id` <number\> | <string\> Search criteria:
    -   <number\> Numeric identifier.
    -   <string\> Canonical name.

## Language lookup

### Get language by iso2, iso3 or name

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

-   `id` <string\>

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

-   `id` <string\>

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
