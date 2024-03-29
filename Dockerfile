FROM node:16.13.2

RUN yarn global add pm2

WORKDIR /build
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

WORKDIR ../app
RUN mv ../build/dist/ssr/* ./
RUN rm -rf ../build
RUN yarn install
CMD pm2 start index.js -i max && pm2 logs
