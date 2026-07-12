FROM node:20-bookworm-slim
ARG WORKSPACE
WORKDIR /src
COPY package.json package-lock.json ./
COPY acutis.centre/ acutis.centre/
COPY acutis.community/ acutis.community/
COPY acutis.practitioner/ acutis.practitioner/
COPY acutis.outreach/ acutis.outreach/
COPY acutis.shared/ acutis.shared/
RUN npm ci && npm --workspace "$WORKSPACE" run build
ENV PRODUCT_WORKSPACE=${WORKSPACE}
ENV NODE_ENV=production
CMD ["sh","-c","npm --workspace \"$PRODUCT_WORKSPACE\" run start"]
