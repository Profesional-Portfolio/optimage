#!/bin/sh
# Usage: ./scripts/typeorm.sh .env.prod migration:run
ENV_FILE=${1:-.env}
shift

set -a
. "./$ENV_FILE"
set +a

exec ./node_modules/.bin/typeorm-ts-node-commonjs -d src/datasource.ts "$@"
