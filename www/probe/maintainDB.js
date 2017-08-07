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

function _removeOldRecords( db, collectionName, timestamp, probeID ){
	const query = {};
	query[ COL.PROBE_ID ]  = probeID;
	query[ COL.TIMESTAMP ] = {$lt: timestamp};

	//console.log( query );

	const ret = db.collection( collectionName ).deleteMany( query, function( err, result){
		if( result.deletedCount > 0 )
			console.info(" <= del " + result.deletedCount + " in [" + collectionName + "] older than " + (new Date(timestamp)));
	});
}

function start( db ) {
	setInterval( function( database ){

		//get last time of each probe
		database.collection("data_total_real").aggregate([{$group: {_id: "$" + COL.PROBE_ID, time: {$last: "$" + COL.TIMESTAMP} }}], function( err, data ){
			//console.log( data );
			for( var i=0; i<data.length; i++ ){
				var m = data[i];
				//retain only the last 5 minutes
				_removeOldRecords( database, "data_mac_real", m.time - 5*60*1000, m._id );
				//other "*real" collection, we retain 61 minutes
				_removeOldRecords( database, "data_total_real"   , m.time - 61*60*1000, m._id );
				_removeOldRecords( database, "data_protocol_real", m.time - 61*60*1000, m._id );
				_removeOldRecords( database, "data_app_real"     , m.time - 61*60*1000, m._id );
				_removeOldRecords( database, "data_ip_real"      , m.time - 61*60*1000, m._id );
				_removeOldRecords( database, "data_link_real"    , m.time - 61*60*1000, m._id );
			}
		});
	}, 
	30*1000, //periodically 
	db);
}

MongoClient.connect( connectString, function (err, db) {
	if (err){
		console.error("Cannot connect to Database " + connectString );
		console.logStdout("Cannot connect to Database");
		process.exit( 1 );
	}

	//connect OK
	start( db );
});
