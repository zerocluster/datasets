# /v1/geotarget

Google GEOTarget lookup.

-   [Methods](#methods)
    -   [**get** - Get GEOTarget by id or canonical name.](#/v1/geotarget/get)
    -   [**get-geojson** - Get GEOTarget geojson by id or canonical name.](#/v1/geotarget/get-geojson)

<a id="methods"></a>

# Methods

<a id="/v1/geotarget/get"></a>

## get

Get GEOTarget by id or canonical name.

```
const res = await api.call( "/v1/geotarget/get", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type:
        - number
        - string
    ```

<a id="/v1/geotarget/get-geojson"></a>

## get-geojson

Get GEOTarget geojson by id or canonical name.

```
const res = await api.call( "/v1/geotarget/get-geojson", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type:
        - number
        - string
    ```
