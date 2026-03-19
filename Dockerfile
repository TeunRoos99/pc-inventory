# ── Stage 1: Bouw de React frontend ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm install

COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build

# ── Stage 2: Productie image ─────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Backend afhankelijkheden installeren (incl. native build van better-sqlite3)
COPY backend/package*.json ./
RUN npm install --production

# Backend broncode
COPY backend/server.js ./

# Gebouwde frontend
COPY --from=frontend-builder /build/build ./frontend/build

# Data map aanmaken (wordt overschreven door volume-mount)
RUN mkdir -p /app/data

EXPOSE 3001

ENV NODE_ENV=production
ENV DB_PATH=/app/data/inventory.db

CMD ["node", "server.js"]
