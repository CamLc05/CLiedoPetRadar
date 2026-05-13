# ============================================
# STAGE 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci              # ← sin --only=production, necesita devDependencies para compilar

COPY . .
RUN npm run build

# ============================================
# STAGE 2: Production
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]