FROM node:20-alpine

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

USER node

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node . .

RUN npm ci

CMD ["npm" , "run", "start-server"]