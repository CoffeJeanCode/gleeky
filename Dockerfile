FROM node:22

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install
