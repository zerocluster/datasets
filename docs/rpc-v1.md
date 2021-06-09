# RPC v1

## Continent lookup

Methods:

-   [Get continent by iso2 or name](#continent-get)
-   [Get all continents](#continent-get-all)

<a id="continent-get"></a>

### Get continent by iso2 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/continent/get", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/continent/get"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="continent-get-all"></a>

### Get all continents

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/continent/get-all" );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/continent/get-all"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

Method require no parameters.

## Country lookup

Methods:

-   [Get country by iso2, iso3 or name](#country-get)
-   [Get all countries](#country-get-all)
-   [Get country by coordinates](#country-get-by-coordinates)

<a id="country-get"></a>

### Get country by iso2, iso3 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/country/get", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/country/get"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="country-get-all"></a>

### Get all countries

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/country/get-all" );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/country/get-all"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

Method require no parameters.

<a id="country-get-by-coordinates"></a>

### Get country by coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/country/get-by-coordinates", coordinates );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/country/get-by-coordinates"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **coordinates** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: object
    properties:
        latitude:
            type: number
        longitude:
            type: number
    required:
        - latitude
        - longitude
    additionalProperties: false
    ```

## Currency lookup

Methods:

-   [Get currency by iso3, symbol or name](#currency-get)
-   [Get all currencies](#currency-get-all)

<a id="currency-get"></a>

### Get currency by iso3, symbol or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/currency/get", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/currency/get"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="currency-get-all"></a>

### Get all currencies

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/currency/get-all" );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/currency/get-all"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

Method require no parameters.

## Maxmind GeoIP lookup

Methods:

-   [Search in ASN database](#geoip-asn)
-   [Search in Country database](#geoip-country)
-   [Search in City database](#geoip-city)

<a id="geoip-asn"></a>

### Search in ASN database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geoip/asn", addr );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/asn"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **addr** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="geoip-country"></a>

### Search in Country database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geoip/country", addr );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/country"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **addr** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="geoip-city"></a>

### Search in City database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geoip/city", addr );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/city"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **addr** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

## Google GEOTarget lookup

Methods:

-   [Get GEOTarget by id or canonical name](#geotarget-get)
-   [Get GEOTarget geojson by id or canonical name](#geotarget-get-geojson)

<a id="geotarget-get"></a>

### Get GEOTarget by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geotarget/get", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geotarget/get"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

<a id="geotarget-get-geojson"></a>

### Get GEOTarget geojson by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geotarget/get-geojson", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geotarget/get-geojson"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

## Language lookup

Methods:

-   [Get language by iso2, iso3 or name](#language-get)
-   [Get all languages](#language-get-all)

<a id="language-get"></a>

### Get language by iso2, iso3 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/language/get", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/language/get"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="language-get-all"></a>

### Get all languages

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/language/get-all" );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/language/get-all"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

Method require no parameters.

## Timezone lookup

Methods:

-   [Get timezone by abbreviation or name](#timezone-get)
-   [Get all timezones](#timezone-get-all)
-   [Search for the timezone by the geo coordinates](#timezone-get-by-coordinates)

<a id="timezone-get"></a>

### Get timezone by abbreviation or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/timezone/get", id );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezone/get"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **id** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

<a id="timezone-get-all"></a>

### Get all timezones

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/timezone/get-all" );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezone/get-all"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

Method require no parameters.

<a id="timezone-get-by-coordinates"></a>

### Search for the timezone by the geo coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/timezone/get-by-coordinates", coordinates );
```

#### **cURL**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Basic <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezone/get-by-coordinates"
```

<!-- tabs:end -->

**Permissions**

-   "\*" - any connected user;

**Parameters**

-   **coordinates** `[required]`

    <!-- prettier-ignore -->
    ```yaml
    type: object
    properties:
        latitude:
            type: number
        longitude:
            type: number
    required:
        - latitude
        - longitude
    additionalProperties: false
    ```
