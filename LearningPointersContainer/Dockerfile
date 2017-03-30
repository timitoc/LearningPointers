FROM ubuntu

RUN apt-get update && apt-get -y install build-essential gdb && apt-get install -y curl
RUN apt-get update && apt-get -y install nodejs npm
RUN npm cache clean -f &&  npm install -g n && n stable
RUN mkdir -p /usr/src/app

COPY package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install
COPY . /usr/src/app
CMD ["node","/usr/src/app/index.js"]

EXPOSE 3001
