# MMT 

## Introduction

MMT Operator is a Web application writting in Nodejs. It receives the protocol stats generated by MMT-Probe, saves them in a MONGO database and allows the user to visualize them in graphical charts. 

## Pre-Requisites

This chain of tools depends on the following packages:

### 1. Nodejs 

Follow the instruction on nodejs.org: https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

### 2. Mongo DB v4.4

Follow the procedure described on the following link to install the latest version of Mongodb: https://www.mongodb.com/docs/v4.4/tutorial/install-mongodb-on-ubuntu/

## Usage

```bash
 cd www
 
 #update configuration in config.json if need
     
 #start
 sudo npm start
 # use another configuration file
 node bin/www --config=test.json
```

An option in the configuration file can be overriden by giving a new parameter when running operator, for example:

```bash
 cd www
 node bin/www --config=test.json -Xdatabase_server.host=10.0.0.2 -Xlocal_network.0.ip=192.168.1.0
```

`X` parameter is in format: `attribute=value` where:
 
- `attribute`
- `value` is a primitive value: number, string. It must not be an Object or Array.

Once MMT-Operator is up and running, open your favorite Web browser and goto

    localhost:8080

### MMT-Attack-Generator

To start GUI of MMT-Attack
```bash
npm run attack
```

## Build debian deb file of MMT-Operator 

```bash
    # one will get a deb file such as www/dist/mmt-operator_1.6.2_05c27df_2017-05-05.deb
    npm run build-deb
```
