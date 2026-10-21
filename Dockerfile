# syntax=docker/dockerfile:1

# --- deps stage ---
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.15.0 --activate
WORKDIR /app
COPY package.json .npmrc ./
RUN pnpm install --no-frozen-lockfile --shamefully-hoist || pnpm install --no-frozen-lockfile --config.ignore-scripts=true

# --- builder stage ---
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.15.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- runner stage ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
