/**
 * Remove old documents in database
 */
const 
MongoClient = require('mongodb').MongoClient,
format      = require('util').format;
config      = require("../libs/config.js");
dataAdaptor = require('../libs/dataAdaptor'),
tools       = require("../libs/tools"),
CONST       = require("../libs/constant"),
FORMAT      = require('util').format;

const COL  = dataAdaptor.StatsColumnId;
//connection string to connect to database
const connectString = 'mongodb://' + config.database_server.host 
+ ":" + config.database_server.port 
+ "/" + config.databaseName;


//mongodb option when deleting records
const WRITE_CONCERN = {
	//w: 0, //Requests no acknowledgement of the write operation
	j: false, //requests no acknowledgement from MongoDB that the write operation has been written to the journal.
	single: false, //delete all documents that satisfy the filter
};


function _removeOldRecords( db, collectionName, timestamp, probeID ){
	const query = {};
	query[ COL.PROBE_ID ]  = probeID;
	query[ COL.TIMESTAMP ] = {$lt: timestamp};

	//console.log( query );
	try{
      	db.collection( collectionName ).deleteMany( query, WRITE_CONCERN, function( err, ret){
      	   if( err )
      	      return console.error( err );
      	   
      		//if( ret.deletedCount > 0 )
      		console.log(" <= del " + ret.deletedCount + " in [" + collectionName + "] older than " + (new Date(timestamp)));
      	} );
	}catch( e ){
	   console.error("Error while deleting old records in collection " + collectionName );
	   console.error( e );
	}
}

function _maintainCollection( indexCounter, db, collectionPrefix, timestamp, probeID ){
   //retain the last 61 minutes
   _removeOldRecords( db, collectionPrefix + CONST.period.REAL,   timestamp     - 61*60*1000, probeID );
   
   //perform each hour
   if( indexCounter % 60 == 0)
    //retain the last 24 hours
      _removeOldRecords( db, collectionPrefix + CONST.period.MINUTE, timestamp   - 24*60*60*1000, probeID );
   
   //perform each 6 hours
   if( indexCounter % 360 == 0){
      //retain the last 7 days
      _removeOldRecords( db, collectionPrefix + CONST.period.HOUR,   timestamp - 7*24*60*60*1000, probeID );
      
      //reset indexCounter
      indexCounter = 0;
   }
}

var indexCounter = 0;

function start( db ) {
	setInterval( function( database ){
	   indexCounter ++;
		//get last time of each probe
		database.collection("data_total_real").aggregate([{$group: {_id: "$" + COL.PROBE_ID, time: {$last: "$" + COL.TIMESTAMP} }}], function( err, data ){
			//no data found
			if( err || data == undefined )
				return;
			
			//console.log( data );
			for( var i=0; i<data.length; i++ ){
				var m = data[i];
				_removeOldRecords( database, "reports_" + CONST.period.SPECIAL , m.time - config.retain_detail_report_period*1000, m._id );
				//retain only the last 5 minutes
				_removeOldRecords( database, "data_mac_real"     , m.time - 5*60*1000, m._id );
				
				//other "*real" collection, we retain 61 minutes
				_maintainCollection(indexCounter, database, "data_total_"   , m.time, m._id );
				_maintainCollection(indexCounter, database, "data_protocol_", m.time, m._id );
				_maintainCollection(indexCounter, database, "data_app_"     , m.time, m._id );
				_maintainCollection(indexCounter, database, "data_ip_"      , m.time, m._id );
				_maintainCollection(indexCounter, database, "data_link_"    , m.time, m._id );
			}
		});
		//manually garbage
		//if( global && global.gc )
		//   global.gc();
		
	}, 
	60*1000, //periodically 
	db);
}

MongoClient.connect( connectString, function (err, db) {
	if (err){
		console.warn("Cannot connect to Database " + connectString );
		console.logStdout("Cannot connect to Database");
		process.exit( 1 );
	}

	//connect OK
	start( db );
});


/*
process.stdin.resume();//so the program will not close instantly
//Ctrl+C
process.on('SIGINT',function(){
   console.log("byeeeeeeeeeeeeeee");
   process.exit(0);
});
*/
