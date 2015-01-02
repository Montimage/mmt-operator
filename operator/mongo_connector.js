var moment = require('moment');

var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var mdb = null;
//connect away

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) throw err;
    mdb = db;
    console.log("Connected to Database");
});

function insertUpdateDB(collection, key, val) {
    //update record, insert it if not exists
    mdb.collection(collection).update(key, val, {upsert: true}, function(err) {
        if (err) throw err;
        //console.log("Record updated");
    });
};    

function addProtocolStats( message ) {
    mdb.collection("traffic").insert(message.event, function(err, records) {
        //if(err) return next(bbt_err.InternalError);
        insertUpdateDB("traffic_min", {format: message.event.format, proto: message.event.proto, path: message.event.path, ts: moment(message.event.ts).startOf('minute').valueOf()},
          {'$set': {scount: message.event.scount, ascount: message.event.ascount}, '$inc': { data: message.event.data, payload: message.event.payload, packets: message.event.packets}});    
        insertUpdateDB("traffic_hour", {format: message.event.format, proto: message.event.proto, path: message.event.path, ts: moment(message.event.ts).startOf('hour').valueOf()},
          {'$set': {scount: message.event.scount, ascount: message.event.ascount}, '$inc': { data: message.event.data, payload: message.event.payload, packets: message.event.packets}});
    });
};

function getProtocolStats( options, callback ){
  mdb.collection(options.collection).find({format: 99, ts : {'$gte' : options.ts}}).sort( { ts: 1 }).toArray( function( err, doc ) {
    if (err) callback ( 'InternalError' );
    var data = [];
    for(i in doc) {
      var record = [doc[i].format, doc[i].ts, doc[i].proto, doc[i].path, doc[i].scount, doc[i].ascount, doc[i].data, doc[i].payload, doc[i].packets];
      data.push(record);
    } 
    callback (null, { metadata: {numberOfEntries: data.length}, data: data } );
  });
}

module.exports = { addProtocolStats: addProtocolStats, getProtocolStats: getProtocolStats };
