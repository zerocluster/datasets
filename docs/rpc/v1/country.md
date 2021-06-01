# /v1/country

Country lookup.

-   [Methods](#methods)
    -   [**get** - Get country by iso2, iso3 or name.](#/v1/country/get)
    -   [**get-all** - Get all countries.](#/v1/country/get-all)
    -   [**get-by-coordinates** - Get country by coordinates.](#/v1/country/get-by-coordinates)

<a id="methods"></a>

# Methods

<a id="/v1/country/get"></a>

## get

Get country by iso2, iso3 or name.

```
const res = await api.call( "/v1/country/get", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type: string
    ```

<a id="/v1/country/get-all"></a>

## get-all

Get all countries.

```
const res = await api.call( "/v1/country/get-all" );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

Method require no parameters.

<a id="/v1/country/get-by-coordinates"></a>

## get-by-coordinates

Get country by coordinates.

```
const res = await api.call( "/v1/country/get-by-coordinates", coordinates );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **coordinates** `[required]`

    ```
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
