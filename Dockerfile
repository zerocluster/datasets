FROM zerocluster/node

HEALTHCHECK NONE

RUN \
    # install deps
    export DATASETS_DOWNLOAD=false \
    && npm i --omit=dev \
    \
    # cleanup
    && curl -fsSL https://raw.githubusercontent.com/softvisio/scripts/main/env-build-node.sh | /bin/bash -s -- cleanup
