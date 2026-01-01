#!/bin/bash
set -euo pipefail

echo "🛑 Stopping CoParent Docker dev environment (keeping volumes/network)..."

docker compose -f docker/docker-compose.yml stop

echo "✅ Docker dev environment stopped."
