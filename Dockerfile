FROM node:18
WORKDIR /usr/src/app
COPY . .
RUN npm i

CMD ["npm", "run", "start", "-w", "@workers-demo/server-node"]
