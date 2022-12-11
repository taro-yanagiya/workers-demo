FROM node:18
WORKDIR /usr/src/app
COPY . .
RUN npm i
RUN npm run build -w @workers-demo/server-node

CMD ["npm", "run", "start", "-w", "@workers-demo/server-node"]
