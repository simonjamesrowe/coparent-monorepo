#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  docker compose -f docker/docker-compose.e2e.yml down --remove-orphans
}

trap cleanup EXIT

docker compose -f docker/docker-compose.e2e.yml up -d --wait
npx playwright test --config e2e/playwright.config.ts "$@"
