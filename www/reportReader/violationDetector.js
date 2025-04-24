process.title = "mmt-operator-detect-violation";

const
MongoClient = require('../libs/mongodb').MongoClient,
config      = require("../libs/config.js");
dataAdaptor = require('../libs/dataAdaptor'),
CONST       = require("../libs/constant");

// TODO: get these from the uploaded SLA
const PERIOD = 5*1000;              // 5 seconds
const START_TIME = 0;              // start timestamp of detector
const END_TIME   = 9999999999999; // end timestamp of detector

const COL  = dataAdaptor.StatsColumnId;

// TODO: get this from fPeriod.getDistanceBetweenToSamples() in MMTDrop
const PERIOD_BETWEEN_SAMPLES = config.probe_stats_period;

// converting from bytes to bits
// also taking time period into account
const CONVERTOR = 8 * 1.0 / PERIOD_BETWEEN_SAMPLES;

//number of queries being executing
let queryCount = 0;

//additional interval
var additionalTime = 0;


//restart
function _startOver( database ){
   //reset to default => do not delete additional documents to reduce storage size of DB
   additionalTime = 0;
   setTimeout( _detectViolation, 20*1000, database );
}


function _analyseDatabase (database) {
  const match = {};
  // match[ COL.TIMESTAMP ] = { $gte: START_TIME, $lt: END_TIME };

  const group = { _id : {} };
  group["_id"][ COL.TIMESTAMP ] = "$" + COL.TIMESTAMP;
  [ COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
     COL.ACTIVE_FLOWS,
     COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
     COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
     //the total is used for No-IP
     COL.DATA_VOLUME,  COL.PACKET_COUNT, COL.PAYLOAD_VOLUME]
  .forEach( function( el, index){
    group[ el ] = {"$sum" : "$" + el};
  });
  group[ COL.TIMESTAMP ] = {"$last" : "$"+ COL.TIMESTAMP};

  database.collection("data_total_real").aggregate([{ $match : match } , { $group : group }], function( err, data ){
    if ( err || data == undefined || data.length == 0 ){
      if( err )
         console.error( err );
      return _startOver( database );
    }

    // console.log( data );

    // Check for minimum downlink throughput
    const minDLTPResult = data.reduce((min, curr) => curr[COL.DL_DATA_VOLUME] < min[COL.DL_DATA_VOLUME] ? curr : min);
    console.log("Minimum downlink throughput: " + (minDLTPResult[COL.DL_DATA_VOLUME] * CONVERTOR) + " at " + new Date(minDLTPResult[COL.TIMESTAMP]).toLocaleString() + " [" + minDLTPResult[COL.TIMESTAMP] + "]");

    // Check for maximum downlink throughput
    const maxDLTPResult = data.reduce((max, curr) => curr[COL.DL_DATA_VOLUME] > max[COL.DL_DATA_VOLUME] ? curr : max);
    console.log("Maximum downlink throughput: " + (maxDLTPResult[COL.DL_DATA_VOLUME] * CONVERTOR) + " at " + new Date(maxDLTPResult[COL.TIMESTAMP]).toLocaleString() + " [" + maxDLTPResult[COL.TIMESTAMP] + "]");

    // Check for maximum uplink throughput
    const maxULTPResult = data.reduce((max, curr) => curr[COL.UL_DATA_VOLUME] > max[COL.UL_DATA_VOLUME] ? curr : max);
    console.log("Maximum uplink throughput: " + (maxULTPResult[COL.UL_DATA_VOLUME] * CONVERTOR) + " at " + new Date(maxULTPResult[COL.TIMESTAMP]).toLocaleString() + " [" + maxULTPResult[COL.TIMESTAMP] + "]");

    // Check for maximum downlink throughput variation

    // Check for maximum uplink throughput variation
  });
}

function checkTimestamps ( database ) {
  database.collection("data_total_real").aggregate([
    { $group: { _id: "$3"} },
    { $sort: { _id: 1 } }
  ], function ( err, data ) {
    if ( err || data == undefined || data.length == 0 ) {
      if( err )
         console.error( err );
      return _startOver( database );
    }
    console.log(data.map(item => item._id));
  });
}

let lastDeleteTimestamp = 0;
function _detectViolation( database ){
   //waiting for the queries well terminated
   if( queryCount > 0 ){
      console.info("Waiting for " + queryCount + " queries");
      return setTimeout( _detectViolation, 2000, database );
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

      const timestamp = data[0].time;

      // nothing change in DB and it is not needed to reduce the size
      if( lastDeleteTimestamp === timestamp && additionalTime === 0 ) {
        return setTimeout( _detectViolation, PERIOD, database );
      }
      lastDeleteTimestamp = timestamp;

      // checkTimestamps(database);

      // check for violations
      _analyseDatabase(database);

      // ensure the repeating of the process
      return setTimeout( _detectViolation, PERIOD, database );
   });
}

function start( db ) {
   _detectViolation( db );
}

MongoClient.connect( config.databaseName, function (err, db) {
	if (err){
		console.warn("Cannot connect to Database " + config.databaseName );
		console.logStdout("Cannot connect to Database");
		process.exit();
	}
	console.info("Start violation detector");
	//connect OK
	start( db );
});


/*
process.stdin.resume();//so the program will not close instantly
//Ctrl+C
*/
process.on('SIGINT',function(){
   console.log("Exit violation detector " + process.pid);
   process.exit();
});

