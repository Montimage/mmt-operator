/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var moment = require('moment');
var app = express();
var io = require('socket.io');
var moment = require('moment');

var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var mdb = null;
//connect away
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) throw err;
    mdb = db;
    console.log("Connected to Database");
});

var redis = require("redis");
var stats_sub = redis.createClient();
stats_sub.psubscribe("*.stats");

function insertUpdateDB(collection, key, val) {
    //update record, insert it if not exists
    mdb.collection(collection).update(key, val, {upsert: true}, function(err) {
        if (err) throw err;
        //console.log("Record updated");
    });
}    

stats_sub.on('pmessage', function(pattern, channel, message) {
    message = JSON.parse(message);
    //console.log(message.event);
    mdb.collection("traffic").insert(message.event, function(err, records) {
        //if(err) return next(bbt_err.InternalError);
        insertUpdateDB("traffic_min", {format: message.event.format, proto: message.event.proto, path: message.event.path, ts: moment(message.event.ts).startOf('minute').valueOf()},
          {'$set': {scount: message.event.scount, ascount: message.event.ascount}, '$inc': { data: message.event.data, payload: message.event.payload, packets: message.event.packets}});    
        insertUpdateDB("traffic_hour", {format: message.event.format, proto: message.event.proto, path: message.event.path, ts: moment(message.event.ts).startOf('hour').valueOf()},
          {'$set': {scount: message.event.scount, ascount: message.event.ascount}, '$inc': { data: message.event.data, payload: message.event.payload, packets: message.event.packets}});
    });
});



// Access to the DataBase

/**
 * Constants: MMT Response codes
 */
var mmtCode = {
    OK : 1000,
    ResourceNotFound : 1101,
    ParameterError   : 1102,
    InternalError    : 1103,
};

var mmtErrMsg = {
    ResourceNotFoundMsg : "Resource not found",
    ParameterErrorMsg   : "Parameter error",
    InternalErrorMsg   : "Internal error",
};

// all environments
app.set('port', process.env.PORT || 8088);
app.use(express.favicon());
//To use our own favicon instead of Express's default one
//app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

app.use(function(err, req, res, next) {
  console.log(err);
  if(!err || !err.http_code) err = mmtError(400, mmtCode.ParameterError, err.message);
  res.send(err.http_code, {error: {message: err.message, code: err.err_code}});
})

////// C U S T O M   E R R O R  /////
function mmtError(http_code, err_code, err_message) {
    err = new Error(err_message);
    err.http_code = http_code;
    err.err_code = err_code;
    return err;
}

var server = http.createServer(app);
io = io.listen(server);
io.set('log level', 1); //warning + errors
server.listen(app.get('port'));

function getOptionsByPeriod(period) {
  var retval = {collection: 'traffic', ts: moment().valueOf() - 600*1000};
  if(period === '1h') {
    retval = {collection: 'traffic_min', ts: moment().valueOf() - 3600*1000};
  }else if(period === '24h') {
    retval = {collection: 'traffic_hour', ts: moment().valueOf() - 24*3600*1000};
  }else if(period === 'week') {
    retval = {collection: 'traffic_hour', ts: moment().valueOf() - 7*24*3600*1000};
  }else if(period === 'month') {
    retval = {collection: 'traffic_hour', ts: moment().valueOf() - 30*24*3600*1000};
  }
  return retval;
}

app.get('/', function(req, res, next) { res.redirect('/dash.html'); });

app.get('/traffic/data', getStats);
function getStats(request, response, next){
  var period = request.query.period;
  options = getOptionsByPeriod(period);

  mdb.collection(options.collection).find({format: 99, ts : {'$gte' : options.ts}}).sort( { ts: 1 }).toArray( function( err, doc ) {
    if (err) return next('InternalError');
    retval = [];
    for(i in doc) {
      record = [doc[i].format, doc[i].ts, doc[i].proto, doc[i].path, doc[i].scount, doc[i].ascount, doc[i].data, doc[i].payload, doc[i].packets];
      retval.push(record);
    } 
    data = {metadata: {numberOfEntries: retval.length}, data: retval};

    if(request.query.callback) {
      response.send(request.query.callback + '(' + JSON.stringify(data) + ')');
    }else {
      response.send(data);
    }
  });
}

io.sockets.on('connection', function (client) {
  var sub = redis.createClient();

  sub.psubscribe("*.stats");
  sub.subscribe("endperiod");

  sub.on("pmessage", function (pattern, channel, message) {
    message = JSON.parse(message);
    client.emit('stats', message.event);
  });

  sub.on("message", function (channel, message) {
    if(channel === "endperiod") {
      message = JSON.parse(message);
      client.emit('period', message);
    }
  });

  client.on("message", function (msg) {
    
  });

  client.on('disconnect', function () {
    sub.end();
  });

});

       
