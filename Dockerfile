# Multi-stage build for Next.js application with pnpm monorepo
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm with corepack (recommended approach)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all workspace package.json files for proper dependency resolution
COPY apps/dashboard/package.json ./apps/dashboard/package.json

# Copy Prisma schema (needed for postinstall scripts)
COPY apps/dashboard/prisma ./apps/dashboard/prisma/

# Install dependencies with frozen lockfile for reproducible builds
RUN pnpm install --frozen-lockfile

# Generate Prisma Client immediately after install
RUN cd apps/dashboard && pnpm prisma generate

# Debug: Show what was generated
RUN echo "Checking Prisma generation..." && \
    ls -la apps/dashboard/node_modules/@prisma/client/ && \
    echo "Prisma Client generated successfully"

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy node_modules from deps stage (includes generated Prisma Client)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/dashboard/node_modules ./apps/dashboard/node_modules

# Copy all source code
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true

# Accept build-time environment variables for Next.js
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies (openssl for Prisma, pnpm for migration commands)
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

# Create .next directory with correct permissions
RUN mkdir -p apps/dashboard/.next
RUN chown nextjs:nodejs apps/dashboard/.next

# Copy Prisma schema and migrations for runtime
COPY --from=builder /app/apps/dashboard/prisma ./apps/dashboard/prisma

# Copy Next.js standalone build output
# Standalone mode includes a minimal server and required dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static

# Copy entire Prisma packages (includes generated client and binaries)
# Standalone mode doesn't properly trace Prisma's native dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/node_modules/@prisma ./apps/dashboard/node_modules/@prisma

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set working directory to dashboard app
WORKDIR /app/apps/dashboard

# Health check to ensure container is ready
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run database migrations then start the server
# Use npx to run prisma from local node_modules
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]