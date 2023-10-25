# FROM continuumio/miniconda:latest
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 80

CMD ["npm", "start"]