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
 *   which must be greater than or equal to 10 MB (MIN_SIZE)
 * This reduction is decided by additionalTime variable.
 */

process.title = "mmt-operator-maintain-db";

const 
MongoClient = require('../libs/mongodb').MongoClient,
format      = require('util').format;
config      = require("../libs/config.js");
dataAdaptor = require('../libs/dataAdaptor'),
tools       = require("../libs/tools"),
CONST       = require("../libs/constant"),
FORMAT      = require('util').format;

//limit DB storage size by number of Bytes
const MIN_SIZE         = 10*1000*1000; //10MB
const DB_LIMIT_SIZE    = config.limit_database_size > MIN_SIZE? config.limit_database_size : MIN_SIZE ; 
const DB_STEP_INCREASE = 10;

const COL  = dataAdaptor.StatsColumnId;

//mongodb option when deleting records
const WRITE_CONCERN = {
	//w: 0, //Requests no acknowledgement of the write operation
	j: false, //requests no acknowledgement from MongoDB that the write operation has been written to the journal.
	single: false, //delete all documents that satisfy the filter
};



let queryCount = 0; //number of queries being executing
/**
 * Delete from a collection all records being older than the given timestamp 
 * @param db
 * @param collectionName
 * @param timestamp
 * @param probeID
 * @returns
 */
function _removeOldRecords( db, collectionName, timestamp ){
	const query = {};
	query[ COL.TIMESTAMP ] = {$lt: timestamp};

	//console.log( query );
	try{
	   queryCount ++;
	   db.collection( collectionName ).deleteMany( query, WRITE_CONCERN, function( err, ret){
	      queryCount --;
	      if( err )
	         return console.error( err );

	      if( ret )
	         console.info(" <= del " + ret.deletedCount + " in [" + collectionName + "] older than " + (new Date(timestamp)).toLocaleString());
	   } );
	}catch( e ){
	   queryCount --;
	   console.error("Error while deleting old records in collection " + collectionName );
	   console.error( e );
	}
}

//additional interval 
var additionalTime = 0;

/**
 * 
 * @param db
 * @param collectionPrefix
 * @param timestamp: the timestamp of the last report of a probe having the given probeID
 * @param probeID
 * @returns
 */
function _maintainCollection( db, collectionPrefix, timestamp, probeID ){
   /*
    * By default, each kind of collection must retain data in some period. 
    * For example, 
    * - xxx_real   must retain at least 61 minutes
    * - xxx_minute must retain at least 24 hours
    * - xxx_hour   must retain at least  7 days
    * - xxx_day    must retain at least  1 year 
    * However, these periods can be reduce if the total size of DB is greater than a given threshold.
    */
   
   //retain the last 61 minutes
   // reduce each DB_STEP_INCREASE minutes if need (when storage size of DB is bigger than a limit)
   _removeOldRecords( db, collectionPrefix + CONST.period.REAL,   timestamp - 61*60*1000 + additionalTime*60*1000, probeID );
   
   //retain the last 24 hours
   // reduce each a half of DB_STEP_INCREASE hours if need
   _removeOldRecords( db, collectionPrefix + CONST.period.MINUTE, timestamp - 24*60*60*1000 + additionalTime*30*60*1000, probeID );

   //retain the last 7 days
   // reduce each a 1/4 of DB_STEP_INCREASE days if need
   _removeOldRecords( db, collectionPrefix + CONST.period.HOUR,   timestamp - 7*24*60*60*1000 + additionalTime*6*60*60*1000, probeID );

   //DAY collection is maintained only if DB size > limit
   if( additionalTime > 0 )
      //retain the last 365 days
      // reduce each 10xDB_STEP_INCREASE days if need
      _removeOldRecords( db, collectionPrefix + CONST.period.DAY,    timestamp - 365*24*60*60*1000 + 10*additionalTime*24*60*60*1000, probeID );      
}

//restart 
function _startOver( database ){
   //reset to default => do not delete additional documents to reduce storage size of DB
   additionalTime = 0;
   setTimeout( _maintainDatabase, 20*1000, database );
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
      
      console.info("DB's storage size " + stat.storageSize + "B, data size " + stat.dataSize + "B, limit " + DB_LIMIT_SIZE + "B" );
      //everything is ok => wait for 10 seconds to check again
      //==> need use stat.dataSize in case the deleted documents have not been yet updated on disk
      if( stat.storageSize <= DB_LIMIT_SIZE || stat.dataSize <= DB_LIMIT_SIZE )
         return _startOver( database );
      
      //additional documents to remove to remain storage size of DB
      additionalTime += DB_STEP_INCREASE;
   
      console.info( "===> increase additional interval %d (%d > %d)", additionalTime, stat.storageSize, DB_LIMIT_SIZE );
      
      setTimeout( _maintainDatabase, 1000, database );
   });
}

function _maintainSecurityCollection(  database, cb ){
   //collection security is cutoff only if Database size >= the limit
   if( additionalTime === 0 )
      return cb();
   
   database.collection("security").aggregate([{$group: {_id: null, time: {$min: "$" + COL.TIMESTAMP} }}], function( err, data ){   
      //no data found
      if( err || data == undefined || data.length == 0 ){
         console.error( err );
         return cb();
      }
      
      const m = data[0];
      _removeOldRecords( database, "security", m.time + additionalTime*60*1000 );
      
      cb();
   });
}

let lastDeleteTimestamp = 0;
function _maintainDatabase( database ){
   //waiting for the queries well terminated
   if( queryCount > 0 ){
      console.info("Waiting for " + queryCount + " queries");
      return setTimeout( _maintainDatabase, 2000, database );
   }
   
   queryCount = 0;
   
   //get last time of any probe
   database.collection("data_total_real").aggregate([{$group: {_id: null, time: {$max: "$" + COL.TIMESTAMP} }}], function( err, data ){   
      //no data found
      if( err || data == undefined || data.length == 0 ){
         if( err )
            console.error( err );
         return _startOver( database );
      }
      
      //if there is no more data in data_total_real
      //=> use the current time of system
      //if( data.length === 0 )
      //   data = [{time: (new Date()).getTime()}];
      
//      console.( data[0] );
      
      const timestamp = data[0].time;
      
      //nothing change in DB and it is not needed to reduce the size
      if( lastDeleteTimestamp === timestamp && additionalTime === 0 )
         return setTimeout( _maintainDatabaseSize, 10000, database );
      
      lastDeleteTimestamp = timestamp;
      
      //uk flow reports: retain only last 61minutes
      // reduce each DB_STEP_INCREASE minutes if need
      _removeOldRecords( database, "data_unknown_flows_" + CONST.period.REAL , timestamp - 61*60*1000 + additionalTime*60*1000 );
      
      //detail reports
      // reduce each DB_STEP_INCREASE minutes if need
      _removeOldRecords( database, "reports_" + CONST.period.SPECIAL , timestamp - config.retain_detail_report_period*1000 + additionalTime*60*1000 );
      
      //security reports
      // reduce each DB_STEP_INCREASE minutes if need
      //_removeOldRecords( database, "security", timestamp - config.retain_detail_report_period*1000 + additionalTime*60*1000 );
      
      //retain only the last 5 minutes
      // reduce each half of DB_STEP_INCREASE minutes if need
      _removeOldRecords( database, "data_mac_real" , timestamp - 5*60*1000 + additionalTime*30*1000 );
      
      //other "*real" collection, we retain 61 minutes
      _maintainCollection( database, "data_app_"         , timestamp );
      _maintainCollection( database, "data_ip_"          , timestamp );
      _maintainCollection( database, "data_link_"        , timestamp );
      _maintainCollection( database, "data_location_"    , timestamp );
      _maintainCollection( database, "data_protocol_"    , timestamp );
      _maintainCollection( database, "data_session_"     , timestamp );
      _maintainCollection( database, "data_total_"       , timestamp );
      //other collections that are used in specific projects
      _maintainCollection( database, "data_gtp_"         , timestamp );
      _maintainCollection( database, "data_sctp_"        , timestamp );
      _maintainCollection( database, "data_ndn_"         , timestamp );
      _maintainCollection( database, "availability_"     , timestamp );
      

      //collection security is cutoff only if Database size >= the limit
      _maintainSecurityCollection( database, function(){
         
         //this avoids delete DB so frequently
         //it helps when trying delete documents from DB but the storage size does not reduce to DB_LIMIT_SIZE
         // (as DB_LIMIT_SIZE is too small)
         //maintain by db size
         setTimeout( _maintainDatabaseSize, 10000, database );
      });
   });
   
   //manually garbage
   //if( global && global.gc )
   //   global.gc();
}

function start( db ) {
   _maintainDatabase( db );
}

MongoClient.connect( config.databaseName, function (err, db) {
	if (err){
		console.warn("Cannot connect to Database " + config.databaseName );
		console.logStdout("Cannot connect to Database");
		process.exit();
	}
	console.info("Start maintainer");
	//connect OK
	start( db );
});


/*
process.stdin.resume();//so the program will not close instantly
//Ctrl+C
*/
process.on('SIGINT',function(){
   console.log("Exit maintainer " + process.pid);
   process.exit();
});

