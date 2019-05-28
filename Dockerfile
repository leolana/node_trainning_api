FROM node:10-alpine

RUN mkdir -p /opt/app \
    && apk add --update bash git openssh \
    && rm -rf /var/cache/apk/* \
    && npm i npm@latest -g \
    && npm cache clean --force

WORKDIR /opt

COPY package.json package-lock.json* ./

RUN npm install --force

ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /opt/app

COPY . /opt/app

ENV NODE_ENV $NODE_ENV
ENV TZ 'America/Sao_Paulo'

EXPOSE 3000 3008 3009 9000 9229 9230

RUN npm run build

CMD ["npm", "start"]
