# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .

# Copy all packages
COPY packages/ ./packages/
COPY lib/ ./lib/
COPY artifacts/pawmate/ ./artifacts/pawmate/
COPY scripts/ ./scripts/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm --filter @workspace/pawmate build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm and simple HTTP server
RUN npm install -g pnpm http-server

# Copy built files from builder
COPY --from=builder /app/artifacts/pawmate/dist ./dist

# Expose port
EXPOSE 8080

# Start server
CMD ["http-server", "dist", "-p", "8080", "--gzip", "-c-1"]
