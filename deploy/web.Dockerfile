FROM node:20-bookworm-slim AS deps
WORKDIR /src/acutis.web

COPY acutis.web/package.json acutis.web/package-lock.json ./

RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /src/acutis.web

COPY --from=deps /src/acutis.web/node_modules ./node_modules
COPY acutis.web/ ./

ENV NODE_ENV=production

RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app/acutis.web

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY acutis.web/package.json acutis.web/package-lock.json ./
COPY --from=deps /src/acutis.web/node_modules ./node_modules

RUN npm prune --omit=dev

COPY --from=build /src/acutis.web/.next ./.next
COPY --from=build /src/acutis.web/public ./public
COPY --from=build /src/acutis.web/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]
