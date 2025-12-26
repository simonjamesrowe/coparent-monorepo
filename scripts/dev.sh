#!/bin/bash

echo "🚀 Starting CoParent development environment..."
echo ""
echo "Services:"
echo "  - PostgreSQL: localhost:5432"
echo "  - API: http://localhost:5000"
echo "  - UI: http://localhost:3000"
echo ""

docker-compose -f docker/docker-compose.yml up
