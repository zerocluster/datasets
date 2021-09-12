<!-- !!! DO NOT EDIT, THIS FILE IS GENERATED AUTOMATICALLY !!!  -->

> :information_source: Please, see the full project documentation here: [https://softvisio.github.io/datasets/](https://softvisio.github.io/datasets/).

# Introduction

Shared datasets for use as service.

Link to the datasets: [https://github.com/softvisio/datasets/releases/tag/data](https://github.com/softvisio/datasets/releases/tag/data).

## Install

Use `docker-stack.yaml` and `.config.yaml` files, provided in this repository.

```shell
# deploy
docker stack deploy --with-registry-auth -c docker-stack.yaml datasets
```

## Usage

<!-- Tell about how to use the project, give code examples -->

## Datasets

-   Google Geo Targets: [https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1](https://developers.google.com/adwords/api/docs/appendix/geotargeting?csw=1).

### countries.geojson

```shell
docker run --rm -it -v $PWD:/var/local/host softvisio/node

# inside socker
dnf install -y unzip wget gdal

wget http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip

unzip ne_10m_admin_0_countries.zip

ogr2ogr -select iso_a2 -f geojson countries.geo.json ne_10m_admin_0_countries.shp

cp countries.geo.json /var/local/host
```
