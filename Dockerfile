FROM node:22 AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
ARG NUXT_UI_PRO_LICENSE
ARG NUXT_API_URL
ARG NUXT_STORAGE_URL
ARG NUXT_EXTERNAL_URL
ARG NUXT_METRICS
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", "/app/.output/server/index.mjs"]