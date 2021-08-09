# Introduction

Shared datasets for use as service.

Link to the datasets: [https://github.com/softvisio/datasets/releases/tag/data](https://github.com/softvisio/datasets/releases/tag/data).

## Install

```shell
npm i @softvisio/datasets
```

## Usage

<!-- Tell about how to use the project, give code examples -->

## Datasets

-   Google Geo Targets: [https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1](https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1).

### countries.geojson

```shell
docker run --rm -it -v $PWD:/var/local/host softvisio/core

# inside socker
dnf install -y unzip wget gdal

wget http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip

unzip ne_10m_admin_0_countries.zip

ogr2ogr -f geojson ne_10m_admin_0_countries.geojson ne_10m_admin_0_countries.shp

cp ne_10m_admin_0_countries.geojson /var/local/host
```
