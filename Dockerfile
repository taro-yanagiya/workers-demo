FROM node:18
WORKDIR /usr/src/app
COPY . .
RUN npx lerna bootstrap

EXPOSE 3000
