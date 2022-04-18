FROM ghcr.io/zerocluster/node

LABEL org.opencontainers.image.source="https://github.com/zerocluster/datasets"

RUN \
    # install deps
    export DATASETS_DOWNLOAD=false \
    && npm i --omit=dev \
    \
    # cleanup
    && curl -fsSL https://raw.githubusercontent.com/softvisio/scripts/main/env-build-node.sh | /bin/bash -s -- cleanup
