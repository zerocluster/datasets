FROM ghcr.io/zerocluster/node

RUN \
    # install deps
    export DATASETS_DOWNLOAD=false \
    && npm i --omit=dev \
    \
    # cleanup
    && /bin/bash <(curl -fsSL https://raw.githubusercontent.com/softvisio/scripts/main/env-build-node.sh) cleanup
