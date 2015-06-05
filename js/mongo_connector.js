var moment = require('moment');
var dataAdaptor = require('./dataAdaptor.js');

var MongoClient = require('mongodb').MongoClient, format = require('util').format;

var MongoConnector = function ( opts ) {
  this.mdb = null;

  var self = this;

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if (err) throw err;
    self.mdb = db;
    console.log("Connected to Database");
  });

  self.insertUpdateDB = function (collection, key, val) {
    //update record, insert it if not exists
    self.mdb.collection(collection).update(key, val, {upsert: true}, function(err) {
        if (err) throw err;
        //console.log("Record updated");
    });
  };    

  self.updateHistoricalStats = function ( message ) {
    // For Protocol stats, update minutes and hours stats
    if( message.format === 99 ) { //TODO: replace with definition
      self.insertUpdateDB("traffic_min", {format: message.format, probe: message.probe, source: message.source, path: message.path, time: moment(message.time).startOf('minute').valueOf()},
        {'$set': {flowcount: message.flowcount, active_flowcount: message.active_flowcount, app: message.app}, '$inc': { bytecount: message.bytecount, payloadcount: message.payloadcount, packetcount: message.packetcount}});

      self.insertUpdateDB("traffic_hour", {format: message.format, probe: message.probe, source: message.source, path: message.path, time: moment(message.time).startOf('hour').valueOf()},
        {'$set': {flowcount: message.flowcount, active_flowcount: message.active_flowcount, app: message.app}, '$inc': { bytecount: message.bytecount, payloadcount: message.payloadcount, packetcount: message.packetcount}});
    } else if ( message.format === 0 ){
    	 self.insertUpdateDB("traffic_min", {format: message.format, probe: message.probe, source: message.source, time: moment(message.time).startOf('minute').valueOf()},
    		        {'$inc': { dl_data: message.dl_data, ul_data: message.ul_data, dl_packets: message.dl_packets, ul_packets: message.ul_packets, count: 1 }});
    		      
    	 self.insertUpdateDB("traffic_hour", {format: message.format, probe: message.probe, source: message.source, time: moment(message.time).startOf('hour').valueOf()},
    			 {'$inc': { dl_data: message.dl_data, ul_data: message.ul_data, dl_packets: message.dl_packets, ul_packets: message.ul_packets, count: 1 }});
    }
    else if( message.format === 1 ) { //TODO: replace with definition
      self.insertUpdateDB("traffic_min", {format: message.format, probe: message.probe, source: message.source, time: moment(message.time).startOf('minute').valueOf()},
        {'$inc': { response_time: message.response_time, transactions_count: message.transactions_count, interaction_time: message.interaction_time, count: 1 }});
      
      self.insertUpdateDB("traffic_hour", {format: message.format, probe: message.probe, source: message.source, time: moment(message.time).startOf('hour').valueOf()},
        {'$inc': { response_time: message.response_time, transactions_count: message.transactions_count, interaction_time: message.interaction_time, count: 1 }});
    }else if( message.format === 3 ) { //TODO: replace with definition
      self.insertUpdateDB("traffic_min", {format: message.format, probe: message.probe, source: message.source, time: moment(message.time).startOf('minute').valueOf()},
        {'$inc': { packet_loss: message.packet_loss, packet_loss_burstiness: message.packet_loss_burstiness, jitter: message.jitter, count: 1 }});
      
      self.insertUpdateDB("traffic_hour", {format: message.format, probe: message.probe, source: message.source, time: moment(message.time).startOf('hour').valueOf()},
        {'$inc': { packet_loss: message.packet_loss, packet_loss_burstiness: message.packet_loss_burstiness, jitter: message.jitter, count: 1 }});
    } 
  };

  self.addProtocolStats = function ( message ) {
    self.mdb.collection("traffic").insert(message, function(err, records) {
      if(err) return;
      self.updateHistoricalStats( message );
    });
  };

  self.getProtocolStats = function ( options, callback ){
    self.mdb.collection(options.collection).find({format: options.format, time : {'$gte' : options.time}}).sort( { time: 1 }).toArray( function( err, doc ) {
    	  if (err) {
        	  callback ( 'InternalError' );
        	  return;
          }
    	  console.log(" got " + doc.length + " records");
          if (options.raw){
        	  var data = [];
        	  for(i in doc) {
        		  var record = dataAdaptor.reverseFormatReportItem( doc[i] );
        		  data.push(record);
        	  }
        	  callback ( null, data );
          }else{
        	  callback ( null, doc );
          }
          
    });
  };
};

module.exports = MongoConnector;
