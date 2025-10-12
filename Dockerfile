# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all workspace package.json files for proper dependency resolution
COPY apps/dashboard/package.json ./apps/dashboard/package.json

# Copy Prisma schema
COPY apps/dashboard/prisma ./apps/dashboard/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd apps/dashboard && pnpm prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY . .

# Install pnpm in builder stage
RUN npm install -g pnpm

# Build the application (Turbo will handle building the dashboard)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install pnpm for running Prisma commands
RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder from dashboard app
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

# Set the correct permission for prerender cache
RUN mkdir -p apps/dashboard/.next
RUN chown nextjs:nodejs apps/dashboard/.next

# Copy Prisma schema for migrations
COPY --from=builder /app/apps/dashboard/prisma ./apps/dashboard/prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Standalone includes a minimal node_modules with only required dependencies
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static

# Copy Prisma from builder stage (needed for migrations and client)
# Standalone mode doesn't trace Prisma correctly due to binary dependencies
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Change working directory to dashboard app
WORKDIR /app/apps/dashboard

CMD ["sh", "-c", "pnpm prisma migrate deploy && cd /app && node apps/dashboard/server.js"]

# FYI: start:docker uses "prisma migrate deploy" which applies migration files safely (production-ready)
# For dev/preview environments, you can override with: docker run ... pnpm start:docker:dev
# This uses "db push --accept-data-loss" for quick schema syncing without migrations