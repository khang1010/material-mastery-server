# Stage 1: Build
FROM --platform=linux/amd64 node:20.14.0-alpine AS build

ARG PORT
ARG NODE_ENV
ARG DEV_APP_PORT
ARG DEV_DB_HOST
ARG DEV_DB_NAME
ARG DEV_DB_PASSWORD
ARG DEV_DB_PORT
ARG PRO_APP_PORT
ARG PRO_DB_HOST
ARG PRO_DB_NAME
ARG PRO_DB_PORT
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_PASSWORD
ARG DISCORD_TOKEN
ARG DISCORD_CHANNEL
ARG DISTANCE_MATRIX_API_KEY
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET

ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}
ENV DEV_APP_PORT=${DEV_APP_PORT}
ENV DEV_DB_HOST=${DEV_DB_HOST}
ENV DEV_DB_NAME=${DEV_DB_NAME}
ENV DEV_DB_PASSWORD=${DEV_DB_PASSWORD}
ENV DEV_DB_PORT=${DEV_DB_PORT}
ENV PRO_APP_PORT=${PRO_APP_PORT}
ENV PRO_DB_HOST=${PRO_DB_HOST}
ENV PRO_DB_NAME=${PRO_DB_NAME}
ENV PRO_DB_PORT=${PRO_DB_PORT}
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_PORT=${REDIS_PORT}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV DISCORD_CHANNEL=${DISCORD_CHANNEL}
ENV DISTANCE_MATRIX_API_KEY=${DISTANCE_MATRIX_API_KEY}
ENV CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
ENV CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}

# Set the working directory and copy files
WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files and set ownership for node user
COPY . .
RUN chown -R node:node /app

# Stage 2: Runtime
FROM --platform=linux/amd64 node:20.14.0-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set environment for runtime and use non-root user
ENV NODE_ENV production
USER node
WORKDIR /home/node/app

# Copy only necessary files from the build stage
COPY --from=build /app ./

EXPOSE 8083

HEALTHCHECK --interval=30s \
    --timeout=5s \
    CMD curl -f --no-progress-meter http://localhost:8083/v1/health || exit 1

CMD ["npm" , "run", "start"]