FROM node:12-alpine

COPY . .

RUN yarn && yarn build

CMD ["node", "./dist/index.js"]
