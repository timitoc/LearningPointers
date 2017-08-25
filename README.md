# LearningPointers

LearningPointers is an educational platform for mastering C++ pointers.
Facilities:
  - High quality educational resources
  - Online C++ editing and debugging  [![vimsupported](https://img.shields.io/badge/vim-supported-green.svg)]()
  - Magic


## Preview

![Screenshot 2](https://github.com/timitoc/LearningPointers/blob/master/Screenshots/ss1.png)
![Screenshot 2](https://github.com/timitoc/LearningPointers/blob/master/Screenshots/ss2.png)

# Installation

LearningPointers requires [Node.js](https://nodejs.org/)  and [Docker](https://docker.com) on a GNU/Linux system to run. Not tested yet on other systems.

## Step 1: Install Node.js
### Ubuntu
```sh
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
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
## Step 4: (optional) Install MySQL server
```sh
$ sudo apt-get update
$ sudo apt-get install mysql-server
$ sudo mysql_secure_installation
```

## Step 4: Clone LearningPointers repository
```sh
$ git clone https://github.com/timitoc/LearningPointers
```

## Step 5: Install npm modules
```sh
$ cd LearningPointers
$ npm install
```
## Step 6: Build Docker image
```sh
$ sudo ./build.sh
```
## Step 7: Configure environment
Create a .env file with the following format
```env
DB_HOST=[your database host]
DB_NAME=[your database name]
DB_PASS=[your database password]
DB_DIALECT=mysql

SESSION_SECRET=[your session secret key]
```

## Step 8: Configure MySQL database
```sh
$ mysql -u [user] -p[password] < GTG2.1_mysql_create.sql
```
Notice that there is a space between -u and user and no space between -p and password. You can also log in to mysql and run the script using
```mysql
mysql> source [.../.../GTG2.1_mysql_create.sql]
```
## Step 9: Start app
```sh
$ npm start
```
[Open browser at http://localhost:3000](http://localhost:3000)


