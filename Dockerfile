FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Production default: same-origin /api/v1 (nginx proxies to API_UPSTREAM at runtime)
ARG VITE_API_BASE_URL
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_JUMIO_DATA_CENTER
ARG VITE_APP_ENV

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_JUMIO_DATA_CENTER=$VITE_JUMIO_DATA_CENTER
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
