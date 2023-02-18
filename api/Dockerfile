FROM node:18-alpine3.17
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
ADD static /home/node/app/static
ADD src /home/node/app/src
ADD scripts /home/node/app/scripts
COPY prod.env /home/node/app/.env
COPY package*.json /home/node/app/
COPY tsoa.json /home/node/app/
COPY tsconfig.json /home/node/app/
WORKDIR /home/node/app
RUN npm install -g npm@latest
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
RUN npm run update-geo
RUN npm run build
EXPOSE 3000
CMD [ "node", "." ]