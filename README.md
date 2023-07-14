<!-- !!! DO NOT EDIT, THIS FILE IS GENERATED AUTOMATICALLY !!!  -->

> :information_source: Please, see the full project documentation here: [https://zerocluster.github.io/datasets/](https://zerocluster.github.io/datasets/).

# Introduction

Shared datasets for use as service.

Link to the datasets: [https://github.com/zerocluster/datasets/releases/tag/resources](https://github.com/zerocluster/datasets/releases/tag/resources).

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
docker run --rm -it -v $PWD:/var/local/host ghcr.io/zerocluster/node

# inside socker
apt update
apt install -y unzip wget gdal-bin

wget https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip

# without boundary lakes
# wget https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries_lakes.zip

unzip ne_10m_admin_0_countries.zip

ogr2ogr -select iso_a2 -f geojson countries.geo.json ne_10m_admin_0_countries.shp

cp countries.geo.json /var/local/host

softvisio-cli lint -a compress countries.geo.json
```
