# /v1/geoip

Maxmind GeoIP lookup.

-   [Methods](#methods)
    -   [**asn** - Search in ASN database.](#/v1/geoip/asn)
    -   [**city** - Search in City database.](#/v1/geoip/city)
    -   [**country** - Search in Country database.](#/v1/geoip/country)

<a id="methods"></a>

# Methods

<a id="/v1/geoip/asn"></a>

## asn

Search in ASN database.

```
const res = await api.call( "/v1/geoip/asn", addr );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **addr** `[required]`

    ```
    type: string
    ```

<a id="/v1/geoip/city"></a>

## city

Search in City database.

```
const res = await api.call( "/v1/geoip/city", addr );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **addr** `[required]`

    ```
    type: string
    ```

<a id="/v1/geoip/country"></a>

## country

Search in Country database.

```
const res = await api.call( "/v1/geoip/country", addr );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **addr** `[required]`

    ```
    type: string
    ```
