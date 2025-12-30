# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.12.0

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared types first
RUN pnpm --filter @coparent/shared-types build

# Build API
RUN pnpm --filter @coparent/api build

# Production stage
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@8.12.0

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose port
EXPOSE 3000

# Set working directory to API
WORKDIR /app/apps/api

# Start the application
CMD ["pnpm", "start"]
