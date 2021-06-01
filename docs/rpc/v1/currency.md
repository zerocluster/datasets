# /v1/currency

Currency lookup.

-   [Methods](#methods)
    -   [**get** - Get currency by iso3, symbol or name.](#/v1/currency/get)
    -   [**get-all** - Get all currencies.](#/v1/currency/get-all)

<a id="methods"></a>

# Methods

<a id="/v1/currency/get"></a>

## get

Get currency by iso3, symbol or name.

```
const res = await api.call( "/v1/currency/get", id );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

-   **id** `[required]`

    ```
    type: string
    ```

<a id="/v1/currency/get-all"></a>

## get-all

Get all currencies.

```
const res = await api.call( "/v1/currency/get-all" );
```

#### Permissions

-   "\*" - any connected user;

#### Parameters

Method require no parameters.
