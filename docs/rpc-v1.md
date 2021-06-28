# RPC v1

## Continent lookup

### Get continent by iso2 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`id`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all continents

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

## Country lookup

### Get country by iso2, iso3 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`id`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all countries

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

### Get country by coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`coordinates`** <Object\>

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

### Get currency by iso3, symbol or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`id`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all currencies

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/asn"
```

<!-- tabs:end -->

**Parameters:**

-   **`addr`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/country"
```

<!-- tabs:end -->

**Parameters:**

-   **`addr`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geoip/city"
```

<!-- tabs:end -->

**Parameters:**

-   **`addr`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

## Google GEOTarget lookup

### Get GEOTarget by id or canonical name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`id`** <number\> | <string\>

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
```javascript
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

-   **`id`** <number\> | <string\>

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

## Language lookup

### Get language by iso2, iso3 or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`id`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all languages

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

## Timezone lookup

### Get timezone by abbreviation or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`id`** <string\>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

### Get all timezones

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

### Search for the timezone by the geo coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
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

-   **`coordinates`** <Object\>

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
