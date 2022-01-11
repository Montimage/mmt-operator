# Welcome

This page presents the general architecture of MMT-Operator framework. 


# MMT-Operator 


MMT-Operator is a javascript-based framework to represent graphically output of [MMT-Probe](http://bitbucket.org/montimage/mmt-probe/wiki).


The framework consists of two parts:

* **Client part** is written in HTML & JavaScript. It runs on a Web browser to visualize charts.
* **Server part** is written in Nodejs. It runs on a Nodejs server. 
    * It receives data from one or several MMT-Probe then store them into a database and forward them to client if the client requires.
    * It gets data from database and forward them to the client part.



```
 ____________________                    __________________
|                    |                  |                  |<========> Database
|      Client        | <=====REST=====> |     Server       |
| (HTML, Javascript) |                  |    (NodeJS)      |<======== MMT-Probe
 --------------------                    ------------------ 

```

# Interface Client-Server

The communications between client-server are done via REST.
The interface of communication between client - server is as the following.

## Get data from database

Client gets data that are stocked in database from server side.

### URI

```
#!javascript
GET /traffic/data
```

### Parameters

| name | type  | description  | note |
|--|--|--|--|
| format  | enum{99, 0, 1, 2, 3} | identifier of data, *e.g.*, format = 99 to get general statistic data | default: 99 |
| probe   | Array<number> | identifier of the probe to get data from | default: [] |
| source  | Array<string> | identifier of the probe's data source to get data from. *e.g. eth0* | default: [] |
| period  | enum{"minute", "hour", "day", "week", "month"} | get data having timestamp in this period, *e.g.*, the last minute,  | default: minute |



### Response

An array of messages. Each message is also an array. For example:

```
#!JSON
[
 [99, 123, "eth0", 1429713111449, 35, "99.178.354.153.35", 321, 3, 60, 6, 1],
 [99, 124, "eth0", 1429713111449, 85, "99.178.376.85", 133946, 3, 0, 0, 0],
 [99, 124, "eth0", 1429713111449, 354, "99.178.354", 57159, 183, 2850, 1150, 50],
]
```



## Listen data in real-time

Client gets data each time they are given by MMT-Probe.

Using a socket.io to create a socket and listen at an expected event.

For example:

```
#!javascript
var socket = new io.connect(MMTDrop.config.probeURL);			
socket.on("stats_raw", function( msg ){
	console.log(" a new message: " + msg);
});
```
