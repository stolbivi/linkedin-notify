FROM node:12-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
ADD src /home/node/app/src
COPY .env /home/node/app/
COPY package*.json /home/node/app/
COPY tsconfig.json /home/node/app/
COPY tsoa.json /home/node/app/
WORKDIR /home/node/app
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
RUN npm run build
EXPOSE 8080
CMD [ "node", "." ]