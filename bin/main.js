#!/usr/bin/env node

import maxmind from "@softvisio/core/maxmind";

setInterval( () => maxmind.update(), 1000 * 60 * 60 * 4 );

maxmind.update();
