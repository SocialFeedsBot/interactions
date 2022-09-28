FROM node:17-alpine

COPY . /usr/src/
WORKDIR /usr/src/

RUN npm i

EXPOSE 4017:4017

CMD ["node", "./index.js"]