#!/bin/bash
set -e

echo "🚀 Setting up CoParent monorepo..."

# Check Node version
required_version="18"
current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_version" -lt "$required_version" ]; then
  echo "❌ Node.js version $required_version or higher is required"
  exit 1
fi

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm@8.12.0
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build shared packages
echo "🔨 Building shared packages..."
pnpm --filter @coparent/shared-types build

# Copy environment files
echo "📝 Setting up environment files..."
cp apps/api/.env.example apps/api/.env || true
cp apps/ui/.env.example apps/ui/.env || true

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update apps/api/.env with your configuration"
echo "  2. Update apps/ui/.env with your configuration"
echo "  3. Run 'pnpm docker:dev' to start all services"
echo "  or"
echo "  3. Run 'pnpm dev:api' and 'pnpm dev:ui' separately"
