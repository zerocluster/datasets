# /v1/timezone

Timezone lookup.

-   [Methods](#methods)
    -   [**get** - Get timezone by abbreviation or name.](#/v1/timezone/get)
    -   [**get-all** - Get all timezones.](#/v1/timezone/get-all)
    -   [**get-by-coordinates** - Search for the timezone by the geo coordinates.](#/v1/timezone/get-by-coordinates)

<a id="methods"></a>

# Methods

<a id="/v1/timezone/get"></a>

## get

Get timezone by abbreviation or name.

```
const res = await api.call( "/v1/timezone/get", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type: string
    ```

<a id="/v1/timezone/get-all"></a>

## get-all

Get all timezones.

```
const res = await api.call( "/v1/timezone/get-all" );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

Method require no parameters.

<a id="/v1/timezone/get-by-coordinates"></a>

## get-by-coordinates

Search for the timezone by the geo coordinates.

```
const res = await api.call( "/v1/timezone/get-by-coordinates", coordinates );
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
