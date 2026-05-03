FROM node:20-bookworm-slim AS deps
WORKDIR /src/acutis.web

COPY acutis.web/package.json acutis.web/package-lock.json ./

RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /src/acutis.web

COPY --from=deps /src/acutis.web/node_modules ./node_modules
COPY acutis.web/ ./

RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /src/acutis.web/.next/standalone ./
COPY --from=build /src/acutis.web/.next/static ./.next/static
COPY --from=build /src/acutis.web/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
