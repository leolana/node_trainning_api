FROM node:10-alpine

RUN rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

RUN mkdir -p /opt/app \
    && apk add --update \
      python \
      g++ \
      make \
    && rm -rf /var/cache/apk/* \
    && npm i npm@latest -g \
    && npm cache clean --force

# we need libaio and libnsl, the latter is only available as package in the edge repository
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    apk add --update libaio libnsl tzdata gcompat && \
    ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1

WORKDIR /opt

COPY package.json package-lock.json* ./

RUN npm install --force

ENV PATH /opt/node_modules/.bin:$PATH

COPY . ./app

# the client version we will download from bumpx repo
ENV CLIENT_FILENAME /opt/app/oracle-driver/instantclient-basic-linux.x64-12.1.0.2.0.zip

RUN LIBS="*/*.so */*.so.12.1 */*.jar" && \
    unzip ${CLIENT_FILENAME} ${LIBS} && \
    for lib in ${LIBS}; do mv ${lib} /usr/lib; done && \
    ln -s /usr/lib/libclntsh.so.12.1 /usr/lib/libclntsh.so && \
    rm ${CLIENT_FILENAME}

ENV PATH /opt/oracle/instantclient_12_1:$PATH

WORKDIR /opt/app

ARG PORT=8080
ENV PORT $PORT

ENV TZ 'America/Sao_Paulo'

EXPOSE $PORT 8081 9229 9230

RUN npm run build

# # check every 30s to ensure this service returns HTTP 200
# #HEALTHCHECK --interval=30s CMD node healthcheck.js

ENTRYPOINT npm start
