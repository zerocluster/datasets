# RPC v1

## Continent lookup

### Get continent by iso2 or name

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/continents/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/continents/get-all"
```

<!-- tabs:end -->

## Country lookup

### Get country by iso2, iso3 or name

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/countries/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/countries/get-all"
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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/countries/get-by-coordinates"
```

<!-- tabs:end -->

**Parameters:**

-   **`coordinates`** <Object\>

    <details>
        <summary>JSON schema</summary>

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

    </details>

## Currency lookup

### Get currency by iso3, symbol or name

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/currencies/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/currencies/get-all"
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

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geotargets/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <number\> | <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

    </details>

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/geotargets/get-geojson"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <number\> | <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type:
        - number
        - string
    ```

    </details>

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
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/languages/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

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
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/languages/get-all"
```

<!-- tabs:end -->

## Timezone lookup

### Get timezone by abbreviation or name

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/timezones/get", id, [options] );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezones/get"
```

<!-- tabs:end -->

**Parameters:**

-   **`id`** <string\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: string
    ```

    </details>

-   **`options?`** <Object\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: object
    properties:
        offsets: true
    additionalProperties: false
    ```

    </details>

### Get all timezones

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/timezones/get-all", [options] );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezones/get-all"
```

<!-- tabs:end -->

**Parameters:**

-   **`options?`** <Object\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: object
    properties:
        offsets: true
    additionalProperties: false
    ```

    </details>

### Search for the timezone by the geo coordinates

<!-- tabs:start -->

#### **JavaScript**

<!-- prettier-ignore -->
```javascript
const res = await api.call( "/v1/timezones/get-by-coordinates", coordinates, [options] );
```

#### **Shell**

<!-- prettier-ignore -->
```shell
curl \
    -X POST \
    -H "Authorization: Bearer <YOUR-API-TOKEN>" \
    -H "Content-Type: application/json" \
    -d '[...PARAMETERS]' \
    "https://api.domain.com/v1/timezones/get-by-coordinates"
```

<!-- tabs:end -->

**Parameters:**

-   **`coordinates`** <Object\>

    <details>
        <summary>JSON schema</summary>

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

    </details>

-   **`options?`** <Object\>

    <details>
        <summary>JSON schema</summary>

    <!-- prettier-ignore -->
    ```yaml
    type: object
    properties:
        offsets: true
    additionalProperties: false
    ```

    </details>
