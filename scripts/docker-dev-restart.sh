#!/bin/bash
set -euo pipefail

echo "🔄 Restarting CoParent Docker dev environment..."

docker compose -f docker/docker-compose.yml restart

echo "✅ Docker dev environment restarted."
