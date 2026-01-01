#!/bin/bash
set -euo pipefail

if [ "$#" -gt 0 ]; then
  docker compose -f docker/docker-compose.yml logs -f --tail=200 "$@"
else
  docker compose -f docker/docker-compose.yml logs -f --tail=200
fi
