# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:24-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/todos').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
# Wait for the database to accept connections (up to ~60s), run migrations,
# then start the server. This makes the image work with plain `docker run`
# and on platforms like Coolify, where the database may not be ready yet.
CMD ["sh", "-c", "n=0; until node ./node_modules/typeorm/cli.js migration:run -d ./dist/data-source.js; do n=$((n+1)); if [ $n -ge 30 ]; then echo 'Timed out waiting for the database'; exit 1; fi; echo 'Database not ready yet, retrying in 2 seconds...'; sleep 2; done; exec node dist/main"]
