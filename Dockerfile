# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN npm install -g bun && bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copy built application
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

# Install production dependencies only
RUN npm install -g bun && bun install --production --frozen-lockfile

USER sveltekit

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build/index.js"]
