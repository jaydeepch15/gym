# ---- Frontend Dockerfile (multi-stage) ----

# 1) Build the React app
FROM node:20-alpine AS build
WORKDIR /app

# REACT_APP_BACKEND_URL is baked at build time (CRA). Override at build:
#   docker build --build-arg REACT_APP_BACKEND_URL=http://localhost:8001 ...
ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Install deps first for cache-friendliness
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

# 2) Serve with nginx
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
