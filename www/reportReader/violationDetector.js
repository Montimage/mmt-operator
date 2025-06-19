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

// data from Metrics database for checking violations
let metrics = {};

//restart
function _startOver( database ){
  setTimeout( _detectViolation, 20*1000, database );
}

function _addAlertViolation (metric, measuredValue, type, timestamp, database) {
  const componentID = metrics["components"].find(item => item.title === "INFLUENCE5G").id;
  const dataEntry = {
    0: timestamp,
    1: "__app",
    2: componentID,
    3: metric.id,
    4: type,
    5: "", // priority
    6: "", // threshold
    7: measuredValue,
  }
  database.collection("metrics_alerts").replaceOne(dataEntry, dataEntry, { upsert: true }, function(err){
    if (err) console.error(err);
  });
}

function _checkViolation (metric, measuredValue, timestamp, isMax, database) {
  if (metric.enable === false) return;

  function _convertToBits(value, unit) {
    switch (unit) {
      case "Kbps":
        return value * 1000;
      case "Mbps":
        return value * 1000000;
      case "Gbps":
        return value * 1000000000;
    }
  }

  const alertValue = _convertToBits(metric.alert, metric.unit);
  const violationValue = _convertToBits(metric.violation, metric.unit);

  if (isMax) {
    if (measuredValue > violationValue) {
      _addAlertViolation(metric, measuredValue, "violation", timestamp, database);
    } else if (measuredValue > alertValue) {
      _addAlertViolation(metric, measuredValue, "alert", timestamp, database);
    }
  }
  else {
    if (measuredValue < violationValue) {
      _addAlertViolation(metric, measuredValue, "violation", timestamp, database);
    } else if (measuredValue < alertValue) {
      _addAlertViolation(metric, measuredValue, "alert", timestamp, database);
    }
  }

}


// Getting the most recent selectedMetric value from the database
function _getMetrics () {
  const component = metrics["components"].find(item => item.title === "INFLUENCE5G");
  const selectedMetric = metrics["selectedMetric"][component.id];

  // common metrics
  const commonMetrics = component.metrics.slice(0);

  for (let i = 0; i < commonMetrics.length; i++) {
    if (selectedMetric[commonMetrics[i].id] === undefined) {
      continue;
    }
    commonMetrics[i].alert = selectedMetric[commonMetrics[i].id].alert;
    commonMetrics[i].violation = selectedMetric[commonMetrics[i].id].violation;
    commonMetrics[i].enable = selectedMetric[commonMetrics[i].id].enable;
    commonMetrics[i].unit = selectedMetric[commonMetrics[i].id].unit;
  }


  // Returning the required metrics for checking
  const minDL    = commonMetrics.find(item => item.name === "dlTput.minDlTputRequirement");
  const maxDL    = commonMetrics.find(item => item.name === "dlTput.maxDlTputPerSlice");
  const maxUL    = commonMetrics.find(item => item.name === "ulTput.maxUlTputPerSlice");
  const maxDLVar = commonMetrics.find(item => item.name === "dlTput.maxTputVariation");
  const maxULVar = commonMetrics.find(item => item.name === "ulTput.maxTputVariation");

  return [minDL, maxDL, maxUL, maxDLVar, maxULVar];
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

    // // Check for minimum downlink throughput
    // const minDLTPResult = data.reduce((min, curr) => curr[COL.DL_DATA_VOLUME] < min[COL.DL_DATA_VOLUME] ? curr : min);
    // console.log("Minimum downlink throughput: " + (minDLTPResult[COL.DL_DATA_VOLUME] * CONVERTOR) + " at " + new Date(minDLTPResult[COL.TIMESTAMP]).toLocaleString() + " [" + minDLTPResult[COL.TIMESTAMP] + "]");

    // // Check for maximum downlink throughput
    // const maxDLTPResult = data.reduce((max, curr) => curr[COL.DL_DATA_VOLUME] > max[COL.DL_DATA_VOLUME] ? curr : max);
    // console.log("Maximum downlink throughput: " + (maxDLTPResult[COL.DL_DATA_VOLUME] * CONVERTOR) + " at " + new Date(maxDLTPResult[COL.TIMESTAMP]).toLocaleString() + " [" + maxDLTPResult[COL.TIMESTAMP] + "]");

    // // Check for maximum uplink throughput
    // const maxULTPResult = data.reduce((max, curr) => curr[COL.UL_DATA_VOLUME] > max[COL.UL_DATA_VOLUME] ? curr : max);
    // console.log("Maximum uplink throughput: " + (maxULTPResult[COL.UL_DATA_VOLUME] * CONVERTOR) + " at " + new Date(maxULTPResult[COL.TIMESTAMP]).toLocaleString() + " [" + maxULTPResult[COL.TIMESTAMP] + "]");

    // // Check for maximum downlink throughput variation
    // console.log("Maximum downlink throughput variation: " + (maxDLTPResult[COL.DL_DATA_VOLUME] - minDLTPResult[COL.DL_DATA_VOLUME]) * CONVERTOR);

    // // Check for maximum uplink throughput variation
    // const minULTPResult = data.reduce((min, curr) => curr[COL.UL_DATA_VOLUME] < min[COL.UL_DATA_VOLUME] ? curr : min);
    // console.log("Maximum uplink throughput variation: " + (maxULTPResult[COL.UL_DATA_VOLUME] - minULTPResult[COL.UL_DATA_VOLUME]) * CONVERTOR);

    if (!metrics["components"])
      return _startOver( database );

    // Getting metrics from database
    const [minDL, maxDL, maxUL, maxDLVar, maxULVar] = _getMetrics();

    for (let i = 0; i < data.length; i++) {
      const data_row = data[i];
      _checkViolation(minDL, data_row[COL.DL_DATA_VOLUME] * CONVERTOR, data_row[ COL.TIMESTAMP ], false, database);
      _checkViolation(maxDL, data_row[COL.DL_DATA_VOLUME] * CONVERTOR, data_row[ COL.TIMESTAMP ], true, database);
      _checkViolation(maxUL, data_row[COL.UL_DATA_VOLUME] * CONVERTOR, data_row[ COL.TIMESTAMP ], true, database);
    }
    // TODO: Ask about variation percentage values
    // _checkViolation(maxDLVar, (maxDLTPResult[COL.DL_DATA_VOLUME] - minDLTPResult[COL.DL_DATA_VOLUME]) * CONVERTOR, true, database);
    // _checkViolation(maxULVar, (maxULTPResult[COL.UL_DATA_VOLUME] - minULTPResult[COL.UL_DATA_VOLUME]) * CONVERTOR, true, database);
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
let firstTime = true;
function _detectViolation( database ){

  // Check that the SLA has been uploaded by querying the 'metrics' database first
  database.collection("metrics").find().toArray(function(err, data) {
    if (err || data == undefined || data.length == 0 || data[0] == undefined) {
      if (err)
        console.error("SLA has not been uploaded yet " + err);
      return _startOver(database);
    }
    if (firstTime) {
      metrics = data[0];
    } else if (metrics !== data[0]) {
      firstTime = true;
      metrics = data[0];

      // clear the old database
      database.collection("metrics_alerts").deleteMany({}, function(err) {
        if (err) console.error(err);
      });
    }
  });

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
      if( firstTime === false && lastDeleteTimestamp === timestamp ) {
        return setTimeout( _detectViolation, PERIOD, database );
      }
      lastDeleteTimestamp = timestamp;

      // checkTimestamps(database);

      firstTime = false;
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

