# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl openssl1.1-compat

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Prune devDependencies to keep production image light
RUN npm prune --production

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl openssl1.1-compat

WORKDIR /app

ENV NODE_ENV=production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S express -u 1001

# Copy built dependencies and source code
COPY --chown=express:nodejs package*.json ./
COPY --chown=express:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=express:nodejs --from=builder /app/prisma ./prisma
COPY --chown=express:nodejs --from=builder /app/src ./src

# Switch to non-root user
USER express

EXPOSE 4000

# Health check instruction inside Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "src/index.js"]
