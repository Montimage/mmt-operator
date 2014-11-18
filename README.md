# MMT 

## Introduction
This package is conposed of two tools:

 * MMT Probe (probe folder): Analyses network traffic from a live interface or a trace file and reports protocol statistics to a central REDIS server.
 * MMT Operator (operator folder): Web application that listens to the protocol stats reported to REDIS, record them in a MONGO database and allows the user to visualize them in graphical charts. 

## Pre-Requisites

This chain of tools depends on the following packages:

### Redis server

    sudo apt-get install -y python-software-properties
    sudo add-apt-repository -y ppa:rwky/redis
    sudo apt-get update
    sudo apt-get install -y redis-server

## Nodejs 

    sudo apt-get update
    sudo apt-get install -y python-software-properties python g++ make
    sudo add-apt-repository -y ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

### MONGO db

Follow the procedure described on the following link to install the latest version of Mongodb

    http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

### hiredis

    git clone https://github.com/redis/hiredis.git
    cd hiredis
    make
    sudo make install

### mmt sdk

    //replace XXXXXX with your Bitbucket username
    git clone https://XXXXXX@bitbucket.org/montimage/mmt-sdk.git
    cd mmt-sdk/sdk
    make -j 4
    sudo make install

MMT SDK will install libraries and header files under: /opt/mmt

### libjson

libjson is a c/c++ json library
install from sources (available at: sourceforge.net/projects/libjson)

    // in makefile, change line 269 from:
    cp -rv $(srcdir)/Dependencies/ $(include_path)/$(libname_hdr)/$(srcdir)
    // to:
    cp -rv _internal/Dependencies/ $(include_path)/_internal

    //At the time of writing this file, stable version is 7.6.1. Please report if you find that a new version was released.
    unzip libjson_7.6.1.zip
    cd libjson
    vi makefile
    make
    sudo make install

### libpcap
  
    sudo apt-get install libpcap-dev

## Usage

### MMT Probe

Compile the probe

    // Add these two destinations to your library path if it is not the case
    export LD_LIBRARY_PATH=/opt/mmt/lib:/usr/local/lib:$LD_LIBRARY_PATH

    // Compile the probe with:
    cd probe
    gcc -I/opt/mmt/include -o mmt-probe mmt-probe.c -L/opt/mmt/lib -lmmt_core -ldl -lpcap -ljson -lhiredis 

Copy TCPIP plugin to "plugins" folder

    // Add TCPIP plugin to the "plugins" folder, make either a copy or a symbollic link!
    mkdir plugins
    cp /opt/mmt/lib/libmmt_tcpip.so.0.99 plugins/libmmt_tcpip.so

Run the probe with

    // Check instruction using 
    ./mmt-probe -h

    // Live interface
    sudo ./mmt-probe -i eth0 -p 15

    // Trace file (you need to provide a pre-recorded trace file) 
    ./mmt-probe -t FILE.pcap -p 5

### MMT Operator

    cd operator
    sudo npm install
    node app.js

Once MMT Operator is up and running, open your favorite browser and goto

    localhost:8088

## Author

Bachar Wehbi, bachar.wehbi@montimage.com