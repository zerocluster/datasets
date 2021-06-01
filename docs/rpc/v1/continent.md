# /v1/continent

Continent lookup.

-   [Methods](#methods)
    -   [**get** - Get continent by iso2 or name.](#/v1/continent/get)
    -   [**get-all** - Get all continents.](#/v1/continent/get-all)

<a id="methods"></a>

# Methods

<a id="/v1/continent/get"></a>

## get

Get continent by iso2 or name.

```
const res = await api.call( "/v1/continent/get", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type: string
    ```

<a id="/v1/continent/get-all"></a>

## get-all

Get all continents.

```
const res = await api.call( "/v1/continent/get-all" );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

Method require no parameters.
