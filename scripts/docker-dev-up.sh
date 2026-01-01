#!/bin/bash
set -euo pipefail

echo "🐳 Starting CoParent Docker dev environment..."

docker compose -f docker/docker-compose.yml up -d

echo "✅ Docker dev environment is up."
