FROM --platform=linux/amd64 node:18-alpine3.17
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
ADD static /home/node/app/static
ADD src /home/node/app/src
ADD scripts /home/node/app/scripts
ADD env /home/node/app/env
COPY babel.config.js /home/node/app/
COPY package*.json /home/node/app/
COPY tsconfig.json /home/node/app/
COPY webpack.core.js /home/node/app/
COPY webpack.config.js /home/node/app/
WORKDIR /home/node/app
RUN npm install -g npm@latest
RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install
RUN npm run release
EXPOSE 8080
CMD [ "node", "." ]
