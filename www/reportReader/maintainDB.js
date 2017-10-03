/**
 *  Created on: 03 oct. 2017
 *  Created by: Huu Nghia NGUYEN <huunghia.nguyen@montimage.com>
 *  
 * Remove old documents in database.
 * Depending on type of collection, periods to retain documents are different:
 * - reports_all: decided by config.retain_detail_report_period
 * - security   : retains alls
 * - *_real     : retains the lattest 61 minutes
 * - *_minute   : retains the lattest 24 hours
 * - *_hour     : retains the lattest 7 days
 * - *_day      : retains the lattest 365 days
 * 
 * These periods can be reduced if storage size of database is bigger than config.limit_database_size 
 *   which must be greater than or equal to 100 MB (MIN_SIZE)
 * This reduction is decided by additionalTime variable.
 */

const 
MongoClient = require('mongodb').MongoClient,
format      = require('util').format;
config      = require("../libs/config.js");
dataAdaptor = require('../libs/dataAdaptor'),
tools       = require("../libs/tools"),
CONST       = require("../libs/constant"),
FORMAT      = require('util').format;

//limit DB storage size by number of Bytes
const MIN_SIZE         = 100*1024*1024; //100MB
const DB_LIMIT_SIZE    = config.limit_database_size > MIN_SIZE? config.limit_database_size : MIN_SIZE ; //5*1024*1024; 
const DB_STEP_INCREASE = 10;

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
	if( probeID != undefined )
	   query[ COL.PROBE_ID ]  = probeID;
	
	query[ COL.TIMESTAMP ] = {$lt: timestamp};

	//console.log( query );
	try{
      	db.collection( collectionName ).deleteMany( query, WRITE_CONCERN, function( err, ret){
      	   if( err )
      	      return console.error( err );
      	   
      		if(ret && ret.deletedCount > 0 )
      		   console.log(" <= del " + ret.deletedCount + " in [" + collectionName + "] older than " + (new Date(timestamp)));
      	} );
	}catch( e ){
	   console.error("Error while deleting old records in collection " + collectionName );
	   console.error( e );
	}
}

//additional interval 
var additionalTime = 0;
var indexCounter   = 0;

function _maintainCollection( indexCounter, db, collectionPrefix, timestamp, probeID ){
   //retain the last 61 minutes
   // reduce each DB_STEP_INCREASE minutes if need (when storage size of DB is bigger than a limit)
   _removeOldRecords( db, collectionPrefix + CONST.period.REAL,   timestamp    - 61*60*1000      + additionalTime*60*1000, probeID );
   
   //perform when we need to reduce storageSize or each 30 
   if( additionalTime != 0 || indexCounter % 30 == 0)
    //retain the last 24 hours
    // reduce each a half of DB_STEP_INCREASE hours if need
      _removeOldRecords( db, collectionPrefix + CONST.period.MINUTE, timestamp - 24*60*60*1000   + additionalTime*30*60*1000, probeID );
   
   //perform when we need to reduce storageSize or each 60
   if( additionalTime != 0 || indexCounter % 60 == 0)
      //retain the last 7 days
      // reduce each a 1/4 of DB_STEP_INCREASE days if need
      _removeOldRecords( db, collectionPrefix + CONST.period.HOUR,   timestamp - 7*24*60*60*1000  + additionalTime*6*60*60*1000, probeID );
      
   //perform when we need to reduce storageSize or each 60
   if( additionalTime != 0 || indexCounter % 60 == 0){
      //retain the last 365 days
      // reduce each DB_STEP_INCREASE days if need
      _removeOldRecords( db, collectionPrefix + CONST.period.DAY,    timestamp - 365*24*60*60*1000  + additionalTime*24*60*60*1000, probeID );      
      //reset indexCounter
      indexCounter = 0;
   }
}

//restart 
function _startOver( database ){
   //reset to default => do not delete additional documents to reduce storage size of DB
   additionalTime = 0;
   setTimeout( _maintainDatabase, 10*1000, database );
}

/**
 * Maintain database by limit its storage size
 * @param database
 * @returns
 */
function _maintainDatabaseSize( database ){
   database.stats( function( err, stat ){
      if( err || stat == undefined ){
         console.error( err );
         return _startOver( database );
      }
      
      //console.info( stat );
      
      //everything is ok => wait for 10 seconds to check again
      if( stat.storageSize <= DB_LIMIT_SIZE || stat.dataSize <= DB_LIMIT_SIZE )
         return _startOver( database );
      
      //additional documents to remove to remain storage size of DB
      additionalTime += DB_STEP_INCREASE;
      
      console.info( "%d increase additional interval %d (%d > %d)", indexCounter, additionalTime, stat.storageSize, DB_LIMIT_SIZE );
      
      //this avoids delete DB so frequently
      //it helps when trying delete documents from DB but the storage size does not reduce to DB_LIMIT_SIZE
      // (as DB_LIMIT_SIZE is too small)
      setTimeout( _maintainDatabase, 1000, database );
   });
}

function _maintainDatabase( database ){
   
   indexCounter ++;
   //get last time of each probe
   database.collection("data_total_real").aggregate([{$group: {_id: "$" + COL.PROBE_ID, time: {$last: "$" + COL.TIMESTAMP} }}], function( err, data ){
      //no data found
      if( err || data == undefined )
         return _startOver( database );
      
      //if there is no more data in data_total_real
      //=> use the current time of system
      if( data.length == 0 )
         data = [{time: (new Date()).getTime()}];
      
      //console.log( data );
      for( var i=0; i<data.length; i++ ){
         var m = data[i];
         if( m.time == undefined ){
            console.error( "Does not find timestamp in data_total_real collection" );
            return _startOver( database );
         }
         
         //detail reports
         // reduce each DB_STEP_INCREASE minutes if need
         _removeOldRecords( database, "reports_" + CONST.period.SPECIAL , m.time - config.retain_detail_report_period*1000 + additionalTime*60*1000, m._id );
         
         //security reports
         // reduce each DB_STEP_INCREASE minutes if need
         _removeOldRecords( database, "security", m.time - config.retain_detail_report_period*1000 + additionalTime*60*1000, m._id );
         
         //retain only the last 5 minutes
         // reduce each half of DB_STEP_INCREASE minutes if need
         _removeOldRecords( database, "data_mac_real"     , m.time - 5*60*1000 + additionalTime*30*1000, m._id );
         
         //other "*real" collection, we retain 61 minutes
         _maintainCollection(indexCounter, database, "data_app_"         , m.time, m._id );
         _maintainCollection(indexCounter, database, "data_ip_"          , m.time, m._id );
         _maintainCollection(indexCounter, database, "data_link_"        , m.time, m._id );
         _maintainCollection(indexCounter, database, "data_location_"    , m.time, m._id );
         _maintainCollection(indexCounter, database, "data_protocol_"    , m.time, m._id );
         _maintainCollection(indexCounter, database, "data_session_"     , m.time, m._id );
         _maintainCollection(indexCounter, database, "data_total_"       , m.time, m._id );
      }
      
      //maintain by db size
      _maintainDatabaseSize( database );
   });
   //manually garbage
   //if( global && global.gc )
   //   global.gc();
   
}

function start( db ) {
   _maintainDatabase( db );
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
