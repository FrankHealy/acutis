FROM node:20-bookworm-slim
ARG WORKSPACE
ARG APP_DIR
WORKDIR /src
COPY package.json package-lock.json ./
COPY packages/ packages/
COPY apps/ apps/
RUN npm ci && npm --workspace "$WORKSPACE" run build
WORKDIR /src/${APP_DIR}
ENV NODE_ENV=production
CMD ["npm","run","start"]
