FROM base/archlinux

RUN pacman -Syu --noconfirm
RUN pacman -S gcc gdb --noconfirm
RUN pacman -S nodejs npm --noconfirm

RUN mkdir -p /usr/src/app

COPY package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install
COPY . /usr/src/app
CMD ["node","/usr/src/app/index.js"]

EXPOSE 3001
