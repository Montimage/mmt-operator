var moment = require('moment');
var dataAdaptor = require('./dataAdaptor.js');

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
    mdb.collection("traffic").insert(message, function(err, records) {
        //if(err) return next(bbt_err.InternalError);
      if( message.format === 99 ) { //TODO: replace with definition
        insertUpdateDB("traffic_min", {format: message.format, proto: message.probe, source: message.source, path: message.path, time: moment(message.time).startOf('minute').valueOf()},
          {'$set': {flowcount: message.flowcount, active_flowcount: message.active_flowcount, app: message.app}, '$inc': { bytecount: message.bytecount, payloadcount: message.payloadcount, packetcount: message.packetcount}});    

        insertUpdateDB("traffic_hour", {format: message.format, proto: message.probe, source: message.source, path: message.path, time: moment(message.time).startOf('hour').valueOf()},
          {'$set': {flowcount: message.flowcount, active_flowcount: message.active_flowcount, app: message.app}, '$inc': { bytecount: message.bytecount, payloadcount: message.payloadcount, packetcount: message.packetcount}});    
      }
    });
};

function getProtocolStats( options, callback ){
  mdb.collection(options.collection).find({format: 99, time : {'$gte' : options.time}}).sort( { time: 1 }).toArray( function( err, doc ) {
    if (err) callback ( 'InternalError' );
    var data = [];
    for(i in doc) {
      var record = dataAdaptor.reverseFormatReportItem( doc[i] );
      data.push(record);
    } 
    callback (null, { metadata: {numberOfEntries: data.length}, data: data } );
  });
}

function getFlowStats( options, callback ){
  mdb.collection(options.collection).find({format: {'$lte': 3}, time : {'$gte' : options.time}}).sort( { time: 1 }).toArray( function( err, doc ) {
    if (err) callback ( 'InternalError' );
    var data = [];
    for(i in doc) {
      var record = dataAdaptor.reverseFormatReportItem( doc[i] );
      data.push(record);
    }
    callback ( null, data );
  });
}


module.exports = { addProtocolStats: addProtocolStats, getProtocolStats: getProtocolStats, getFlowStats: getFlowStats };
