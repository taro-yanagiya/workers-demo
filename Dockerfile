FROM node:18
WORKDIR /usr/src/app
COPY . .
RUN npx lerna bootstrap

CMD ["npx", "lerna", "run", "start", "--scope", "server-node"]

EXPOSE 3000
