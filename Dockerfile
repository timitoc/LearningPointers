FROM node:boron

RUN mkdir -p /usr/src/app

COPY package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install
COPY . /usr/src/app
CMD ["node","/usr/src/app/main.js"]

RUN useradd -ms /bin/bash pointer
USER pointer
WORKDIR /home/pointer

EXPOSE 3001