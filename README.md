# LearningPointers

##  [![node version](https://img.shields.io/badge/node-8.0-brightgreen.svg)]() 
LearningPointers is an educational platform for mastering C++ pointers.
Facilities:
  - High quality educational resources
  - Online C++ editing and debugging  [![vimsupported](https://img.shields.io/badge/vim-supported-green.svg)]()
  - Magic

# Installation

Dillinger requires [Node.js](https://nodejs.org/) v8  and [Docker](https://docker.com) on a GNU/Linux system to run. Not tested yet on other systems.

## Step 1: Install Node.js
### Ubuntu
```sh
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```
### Arch Linux
```sh
$ sudo pacman -S nodejs npm
```
## Step 2: Install Docker
### Ubuntu
```sh
$ sudo apt-get -y install \
  apt-transport-https \
  ca-certificates \
  curl
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
$ sudo add-apt-repository \
       "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
       $(lsb_release -cs) \
       stable"
$ sudo apt-get update
$ sudo apt-get -y install docker-ce
```
### Arch Linux
```sh
$ sudo pacman -S docker
$ sudo systemctl start docker
$ sudo systemctl enable docker
```

## Step 3: Clone LearningPointers repository
```sh
$ git clone https://github.com/timitoc/LearningPointers
```

## Step 4: Install npm modules
```sh
$ cd LearningPointers
$ npm install
```
## Step 5: Build Docker image
```sh
$ sudo ./build.sh
```
## Step 6: Start app
```sh
$ npm start
```
[Open browser at http://localhost:3000](http://localhost:3000)

