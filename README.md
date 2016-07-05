# MMT 

## Introduction
This package contains

 * MMT Operator: Web application that listens to the protocol stats reported to REDIS, record them in a MONGO database and allows the user to visualize them in graphical charts. 

## Pre-Requisites

This chain of tools depends on the following packages:

### Redis server

    sudo apt-get install -y python-software-properties
    sudo add-apt-repository -y ppa:rwky/redis
    sudo apt-get update
    sudo apt-get install -y redis-server

### Nodejs 


    sudo apt-get update
    sudo apt-get install -y python-software-properties python g++ make
    sudo add-apt-repository -y ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
    eventually (if not in above): sudo apt-get install npm; sudo apt-get install node
    #upgrade the last version of nodejs (>= v4.4.x)
    sudo npm cache clean -f
    sudo npm install -g n
    sudo n stable
    sudo ln -sf /usr/local/n/versions/node/5.4.1/bin/node /usr/bin/node

### MONGO db

Follow the procedure described on the following link to install the latest version of Mongodb

    #require >= mongo 3.2
    http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

## Usage

    #Install the libraries
    cd www
    npm install
    #If there are errors when npm install of mongodb, use sudo apt-get install libkrb5-dev
    
    #start
    sudo npm start
    

Once MMT-Operator is up and running, open your favorite browser and goto

    localhost:8080

## Build MMT-Operator as a service (daemon)

    #Install MMT-Operator in /opt/mmt/operator
    npm run build
    sudo npm run install

    #Start
    sudo service operator_d start

## Contributors

    Huu Nghia Nguyen
