#!/usr/bin/env bash
# Start the backend with local secrets loaded from .env.local.
# Usage: ./dev.sh
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local. Copy .env.example and fill in the values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

exec mvn spring-boot:run
