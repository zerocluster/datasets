# RPC v1

## Continent lookup

Methods:

-   [Get continent by iso2 or name](#get-continent-by-iso2-or-name)
-   [Get all continents](#get-all-continents)

### Get continent by iso2 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/continent/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/continent/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all continents

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/continent/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/continent/get-all"
```

<!-- tabs:end -->

**Parameters:**

Method require no parameters.

## Country lookup

Methods:

-   [Get country by iso2, iso3 or name](#get-country-by-iso2-iso3-or-name)
-   [Get all countries](#get-all-countries)
-   [Get country by coordinates](#get-country-by-coordinates)

### Get country by iso2, iso3 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/country/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/country/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all countries

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/country/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/country/get-all"
```

<!-- tabs:end -->

**Parameters:**

Method require no parameters.

### Get country by coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/country/get-by-coordinates", coordinates );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/country/get-by-coordinates"
```

<!-- tabs:end -->

**Parameters:**

-   **`coordinates`** \<object\>

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

-   [Get currency by iso3, symbol or name](#get-currency-by-iso3-symbol-or-name)
-   [Get all currencies](#get-all-currencies)

### Get currency by iso3, symbol or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/currency/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/currency/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all currencies

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/currency/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/currency/get-all"
```

<!-- tabs:end -->

**Parameters:**

Method require no parameters.

## Maxmind GeoIP lookup

Methods:

-   [Search in ASN database](#search-in-asn-database)
-   [Search in Country database](#search-in-country-database)
-   [Search in City database](#search-in-city-database)

### Search in ASN database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geoip/asn", addr );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/asn"
```

<!-- tabs:end -->

**Parameters:**

-   **`addr`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Search in Country database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geoip/country", addr );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/country"
```

<!-- tabs:end -->

**Parameters:**

-   **`addr`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Search in City database

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geoip/city", addr );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/city"
```

<!-- tabs:end -->

**Parameters:**

-   **`addr`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

## Google GEOTarget lookup

Methods:

-   [Get GEOTarget by id or canonical name](#get-geotarget-by-id-or-canonical-name)
-   [Get GEOTarget geojson by id or canonical name](#get-geotarget-geojson-by-id-or-canonical-name)

### Get GEOTarget by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geotarget/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geotarget/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<number,string\>

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

### Get GEOTarget geojson by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/geotarget/get-geojson", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geotarget/get-geojson"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<number,string\>

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

## Language lookup

Methods:

-   [Get language by iso2, iso3 or name](#get-language-by-iso2-iso3-or-name)
-   [Get all languages](#get-all-languages)

### Get language by iso2, iso3 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/language/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/language/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all languages

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/language/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/language/get-all"
```

<!-- tabs:end -->

**Parameters:**

Method require no parameters.

## Timezone lookup

Methods:

-   [Get timezone by abbreviation or name](#get-timezone-by-abbreviation-or-name)
-   [Get all timezones](#get-all-timezones)
-   [Search for the timezone by the geo coordinates](#search-for-the-timezone-by-the-geo-coordinates)

### Get timezone by abbreviation or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/timezone/get", id );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezone/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** \<string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all timezones

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/timezone/get-all" );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezone/get-all"
```

<!-- tabs:end -->

**Parameters:**

Method require no parameters.

### Search for the timezone by the geo coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```js
const res = await api.call( "/v1/timezone/get-by-coordinates", coordinates );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezone/get-by-coordinates"
```

<!-- tabs:end -->

**Parameters:**

-   **`coordinates`** \<object\>

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
