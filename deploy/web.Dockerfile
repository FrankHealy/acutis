FROM node:20-bookworm-slim AS deps
WORKDIR /src

COPY package.json package-lock.json ./
COPY acutis.centre/ acutis.centre/
COPY acutis.community/ acutis.community/
COPY acutis.practitioner/ acutis.practitioner/
COPY acutis.outreach/ acutis.outreach/
COPY acutis.shared/ acutis.shared/

RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /src

COPY --from=deps /src/ ./

ENV NODE_ENV=production

RUN npm run build:centre-web

FROM node:20-bookworm-slim AS runtime
WORKDIR /app/acutis.centre/acutis.centre.web

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /src/acutis.centre/acutis.centre.web/.next/standalone /app/
COPY --from=build /src/acutis.centre/acutis.centre.web/.next/static ./.next/static
COPY --from=build /src/acutis.centre/acutis.centre.web/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
