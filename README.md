<<<<<<< HEAD
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
    eventually (if not in above): sudo apt-get install npm; sudo apt-get install node

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

### libxml

If you do not install ***libxml*** yet, you probably have the following error while compiling the mmt-sdk:


```
#!python

mmt-sdk/src/mmt_security/tips.c:74:38: fatal error: libxml2/libxml/xmlreader.h: No such file or directory
 #include <libxml2/libxml/xmlreader.h>

```

To fix this problem, install **libxml** library and do "make -j 4" again.


```
#!python

sudo apt-get install libxml2 libxml2-dev
make -j 4

```

### libjson

libjson is a c/c++ json library
install from sources (available at: sourceforge.net/projects/libjson)

    //At the time of writing this file, stable version is 7.6.1. Please report if you find that a new version was released.
    unzip libjson_7.6.1.zip
    cd libjson

    // in makefile, change line 269 from:
    cp -rv $(srcdir)/Dependencies/ $(include_path)/$(libname_hdr)/$(srcdir)
    // to:
    cp -rv _internal/Dependencies/ $(include_path)/_internal
    

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

    // In case libstdc++6 error is encountered while compiling (related to libjson), use the following:
    gcc -I/opt/mmt/include -o mmt-probe mmt-probe.c -L/opt/mmt/lib -lmmt_core -ldl -lpcap -ljson -lhiredis -lstdc++

Copy TCPIP plugin to "plugins" folder

    // Add TCPIP plugin to the "plugins" folder, make either a copy or a symbollic link!
    mkdir plugins

    cp /opt/mmt/lib/libmmt_tcpip.so.0.99 plugins/libmmt_tcpip.so
    or even better:
    ln -s /opt/mmt/lib/libmmt_tcpip.so.0.99 plugins/libmmt_tcpip.so

Run the probe with

    // Check instruction using 
    ./mmt-probe -h

    // Live interface
    sudo ./mmt-probe -i eth0 -p 15
    or: su; export LD_LIBRARY_PATH=/opt/mmt/lib:/usr/local/lib:$LD_LIBRARY_PATH; ./mmt-probe -i eth0 -p 15

    // Trace file (you need to provide a pre-recorded trace file) 
    ./mmt-probe -t FILE.pcap -p 5

### MMT Operator

    cd operator
    sudo npm install
    // To use Mongodb as persistence 
    node app.js -d mongo
    // To use sqlite as persistence
    node app.js -d sqlite

Once MMT Operator is up and running, open your favorite browser and goto

    localhost:8088

## Author

Bachar Wehbi, bachar.wehbi@montimage.com
=======
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

## Nodejs 

    sudo apt-get update
    sudo apt-get install -y python-software-properties python g++ make
    sudo add-apt-repository -y ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
    eventually (if not in above): sudo apt-get install npm; sudo apt-get install node

### Sqlite

Either Sqlite or MongoDB is used as database. 

    npm install https://github.com/mapbox/node-sqlite3/tarball/master
 

### MONGO db

Follow the procedure described on the following link to install the latest version of Mongodb

    http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

### hiredis

    git clone https://github.com/redis/hiredis.git
    cd hiredis
    make
    sudo make install

### MMT Operator

    npm install
    // To use Mongodb as persistence 
    node app.js -d mongo
    // To use sqlite as persistence
    node app.js -d sqlite

Once MMT-Operator is up and running, open your favorite browser and goto

    localhost:8088

## Author

Bachar Wehbi, bachar.wehbi@montimage.com
>>>>>>> API
