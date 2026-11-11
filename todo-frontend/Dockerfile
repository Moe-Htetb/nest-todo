# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:24-alpine AS build

# NEXT_PUBLIC_API_URL is baked into the client bundle at build time,
# so it must be available when `next build` runs. Override with
# --build-arg NEXT_PUBLIC_API_URL=https://your-api.example.com/api
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:24-alpine AS production

ENV NODE_ENV=production
# The API already uses port 3000, so serve the frontend on 3001
ENV PORT=3001

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

RUN chown -R node:node /app
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start"]
