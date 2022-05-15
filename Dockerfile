FROM node:16.13.2

RUN yarn global add pm2

WORKDIR /build
COPY package*.json ./
COPY yarn.lock ./
COPY patches ./patches/
RUN yarn install
COPY . .
RUN yarn build

WORKDIR ../app
RUN mv ../build/dist/ssr/* ./
RUN rm -rf ./build
RUN yarn install
CMD [ "yarn", "start" ]
