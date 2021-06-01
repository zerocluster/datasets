# /v1/language

Language lookup.

-   [Methods](#methods)
    -   [**get** - Get language by iso2, iso3 or name.](#/v1/language/get)
    -   [**get-all** - Get all languages.](#/v1/language/get-all)

<a id="methods"></a>

# Methods

<a id="/v1/language/get"></a>

## get

Get language by iso2, iso3 or name.

```
const res = await api.call( "/v1/language/get", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type: string
    ```

<a id="/v1/language/get-all"></a>

## get-all

Get all languages.

```
const res = await api.call( "/v1/language/get-all" );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

Method require no parameters.
