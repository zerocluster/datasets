FROM softvisio/core

HEALTHCHECK NONE

RUN \
    # setup node build environment
    # curl -fsSL https://raw.githubusercontent.com/softvisio/scripts/main/env-build-node.sh | /bin/bash -s -- setup \
    \
    # install deps
    DATASETS_DOWNLOAD=false \
    && npm i --omit=dev \
    \
    # cleanup node build environment
    # && curl -fsSL https://raw.githubusercontent.com/softvisio/scripts/main/env-build-node.sh | /bin/bash -s -- cleanup \
    \
    # clean npm cache
    && rm -rf ~/.npm-cache
