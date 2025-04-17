FROM node:23-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

