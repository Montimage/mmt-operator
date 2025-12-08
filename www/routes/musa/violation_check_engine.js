const express = require('express');
const router  = express.Router();

const config      = require("../../libs/config");
const constant    = require("../../libs/constant.js");
const dataAdaptor = require('../../libs/dataAdaptor');


const COL  = dataAdaptor.StatsColumnId;

var CHECK_AVG_INTERVAL_MILISECOND = 60*1000; //1minute

//global variable for this module
var dbconnector = null;
var publisher   = {};

const TIMESTAMP = {
	start: 0, 
	end  : 0
}

function _createSecurityAlert( probe_id, source, timestamp, property_id, verdict, type, description, history ){
   const msg = [10, probe_id, source, timestamp, property_id, verdict, type, description, history ];
   var obj = {};
   for( var i in msg )
      obj[i] = msg[i];

   dbconnector._updateDB( "security", "insert", obj, function( err, data ){
      if( err )
         return console.error( err );
      //console.log( data );
   });
}

//type: violation | alert
// keep metric_id as legacy reason
function _raiseMessage( timestamp, type, app_id, com_id, metric_id, threshold, value, priority, other ){
   if(! isNaN(value) )
     value = Math.round(value * 100)/100;
   else
     value = JSON.stringify( value );

   if(other)
     other = JSON.stringify(other)
   else
     other = '{}'

   const msg = [timestamp, app_id, com_id, metric_id, type, priority, threshold, value, other ];
   var obj = {};
   for( var i in msg )
      obj[i] = msg[i];

   if( publisher.publish )
      publisher.publish( "metrics.alerts", JSON.stringify( msg ) );

   dbconnector._updateDB( "metrics_alerts", "insert", obj, function( err, data ){
      if( err )
         return console.error( err );
      //console.log( data );
   });
}

//dummy violation
router.post("/:type/:app_id/:com_id/:metric_id/:threshold/:value/:priority", function( req, res, next ){
   res.writeHead(200, { "Content-Type": "text/event-stream",
      "Cache-control": "no-cache" });
   
   const timestamp = (new Date()).getTime();
   
   if( dbconnector == null ){
      return res.status(504).end( timestamp + ": Database is not ready");
   }
   
   if( req.params.app_id == undefined )
      req.params.app_id = "__app";

   _raiseMessage( timestamp, req.params.type, req.params.app_id, req.params.com_id, req.params.metric_id, req.params.threshold, req.params.value, req.params.priority )

   res.end( timestamp + ": Done" );
});

//insert dummy alert
router.post("/:type/:metric_name", function( req, res, next ){
   const type        = req.params.type;
   const metric_name = req.params.metric_name;
   
   const timestamp = (new Date()).getTime();
   
   res.writeHead(200, { 
      "Content-Type" : "text/event-stream",
      "Cache-control": "no-cache" });
   
   if( type != constant.ALERT_STR && type != constant.VIOLATION_STR )
      return res.status(504).end(timestamp + " ERROR: type must be either " + constant.ALERT_STR +" or "+ constant.VIOLATION_STR );
   
   //check if metric is existing
   var metric = undefined;
   for( var i=0; i<config.sla.init_metrics.length; i++ ){
      if( config.sla.init_metrics[i].name == metric_name ){
         metric = config.sla.init_metrics[i];
         break;
      }
   }
   
   if( metric == undefined )
      return res.status(504).end(timestamp + " ERROR: do not exist metric " + metric_name );
   
   
   if( dbconnector == null )
      return res.status(504).end( timestamp + " ERROR: Database is not ready");
   
   //get a list of applications defined in metrics collections
   dbconnector._queryDB("metrics", "find", [], function( err, apps){
      if( err )
         return console.error( err );
      
      var counter = 0;
      //for each application
      for( var i in apps ){
         var app = apps[i];
         if( app == null )
            continue;
         
         if( app.selectedMetric == undefined )
            continue;
         
         //for each component in the app
         for( var j in app.components ){
            var com = app.components[j];

            counter ++;
            _raiseMessage( timestamp, type, app.app_id, com.id, metric.id, "!= 0", 1, "MEDIUM" );
         }
         res.end( timestamp +": generated totally " + counter + " " + type );
      }

   }, false );
   
});

function _checkAvailability( metric, m, app, com ){
   //metric = { "id": "1", "title": "M3-TLS Cryptographic Strength", "name": "100015", "priority": "MEDIUM", "violation": "!= 6", "data_type": "integer", "enable": false, "support": false }
   //m      = { "alert": "<= 0.98", "violation": "<=0.95", "priority": null, "enable": true },
   if( m.alert === "" && m.violation === "" )
      return;

   const now = (new Date()).getTime();
   
   dbconnector._queryDB( "availability_real", "aggregate", [
      {"$match"  : {"1": com.id,"3":{"$gte": (now - CHECH_AVG_INTERVAL),"$lt":now }}},
      {"$group"  : {"_id": "$1", "avail_count": {"$sum": "$5"}, "check_count": {"$sum" : "$6"}}}
      ], function( err, result){
      
      if( err )
         return console.error( err );
      if( result.length  == 0 ) 
         return;
      
      //result = [ { _id: 30, avail_count: 4, check_count: 7 } ]
      result = result[0];

      const val = result.avail_count / result.check_count;
      //violation
      if ( eval( val + m.violation ) )
         return _raiseMessage( now, constant.VIOLATION_STR, app.app_id, com.id, metric.id, m.violation, val, m.priority );
      else if ( eval( val + m.alert ) )
         return _raiseMessage( now, constant.ALERT_STR, app.app_id, com.id, metric.id, m.violation, val, m.priority );
      console.log( result );
   }, false);
   //console.log( "check availability" );
}


function _checkIncident( metric, m, app, com ){
   //metric = {"id": "10005","title": "Resiliance to attacks", "name": "incident","priority": "MEDIUM","violation": "!= \"yes\"","data_type": "string","enable": true,"support": true},
   //m      = {"alert": "","violation": "!= \"yes\"","priority": "MEDIUM","enable": true },
   if( m.alert === "" && m.violation === "" )
      return;

   const now = (new Date()).getTime();
   dbconnector._queryDB( "availability_real", "aggregate", [
      {"$match"  : {"1": com.id,"3":{"$gte": (now - CHECH_AVG_INTERVAL),"$lt":now }}},
      {"$group"  : {"_id": "$1", "avail_count": {"$sum": "$5"}, "check_count": {"$sum" : "$6"}}}
      ], function( err, result){
      if( err )
         return console.error( err );
      if( result.length  == 0 ) 
         return;
      //result = [ { _id: 30, avail_count: 4, check_count: 7 } ]
      result = result[0];

      const val = result.avail_count / result.check_count;
      //violation
      if ( eval( val + m.violation ) )
         return _raiseMessage( now, constant.VIOLATION_STR, app.app_id, com.id, metric.id, m.violation, val, m.priority );
      else if ( eval( val + m.alert ) )
         return _raiseMessage( now, constant.ALERT_STR, app.app_id, com.id, metric.id, m.violation, val, m.priority );
      //console.log( result );
   }, false);
   //console.log( "check availability" );
}

function _checkIsolationAccesss( metric, m, app, com ){
   //nothing to do, the work is done in reportReader/DataBase, in data_link_ collection
}

function _checkGtpLimitation( metric, m, app, com ){
   //nothing to do   
}


// convert IPv4 string to a number
const ip4ToInt = ip => ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;

// convert a number of 4 byte to an IP string
const intToIp4 = int =>
	[(int >>> 24) & 0xff, (int >>> 16) & 0xff, (int >>> 8) & 0xff, int & 0xff].join('.');
	
// Calculate the range of IPs in a CIDR notation
const calculateCidrRange = (cidr, get_readable) => {
	const [range, bits = 32] = cidr.split('/');
	const mask = ~(2 ** (32 - bits) - 1);
	const answer = [intToIp4(ip4ToInt(range) & mask), intToIp4(ip4ToInt(range) | ~mask)];
	
	return [ip4ToInt(answer[0]), ip4ToInt(answer[1])]
};

function getBandwidth( bytes ){
	const nb_seconds = CHECK_AVG_INTERVAL_MILISECOND / 1000;
	return Math.round(bytes * 8 / nb_seconds); 
}

function convertToBits(value, unit) {
	value = parseFloat( value );
	switch (unit) {
		case "kbps":
			return value * 1000;
		case "mbps":
			return value * 1000000;
		case "gbps":
			return value * 1000000000;
		case "Kbps":
			return value * 1024;
		case "Mbps":
			return value * 1024 * 1024;
		case "Gbps":
			return value * 1024 * 1024 * 1024;
	}
	console.error("unkown unit " + unit);
	return value;
}

function getUnit( com, metric_name ){
	const metric = com.metrics.find( (me) => me.name == metric_name );
	if( metric )
		return metric.unit;
	return "";
}

function _checkMaxThroughputPerSlice( metric, m, app, com, isDL ){
   //nothing to do
	const ipRange = com.ip;
	if( !ipRange )
		return console.log("not found IP range");

	//const [cidrStart, cidrEnd] = calculateCidrRange( ipRange );
	const now = (new Date()).getTime();

	//const COL_IP     = isDL? COL.IP_DST : COL.IP_SRC;
	const COL_RETRAN      = isDL? COL.DL_RETRANSMISSION : COL.UL_RETRANSMISSION;
	const COL_DATA_VOLUME = isDL? COL.DL_DATA_VOLUME    : COL.UL_DATA_VOLUME;
	
	//2 thresholds for raising alert or violation
	const unit = m.unit; //getUnit( com, metric.name);
	if(! unit )
		return console.log("cannot find value unit of metric " + metric.name );

	const ALERT_BW = convertToBits(m.alert,     unit);
	const VIOLA_BW = convertToBits(m.violation, unit);
	
	const MAX_BW = Math.max(ALERT_BW, VIOLA_BW);
	console.log(" mininum required bandwidth: ", MAX_BW );
	const nb_seconds = CHECK_AVG_INTERVAL_MILISECOND / 1000;
	//minimum number of bytes should be transmitted during CHECK_AVG_INTERVAL_MILISECOND
	const MAX_DATA_VOLUME = MAX_BW * nb_seconds / 8;

	const match = {};
	//in checking period
	match[COL.TIMESTAMP] = {"$gte": TIMESTAMP.start,"$lt": TIMESTAMP.end};
	
	const groupBy = {"_id": {}};

	// sum by
	[COL_RETRAN, COL_DATA_VOLUME].forEach( (e) => groupBy[e] = {"$sum" : "$"+e} );
	
	// match 2
	const match2 = {}
	//1. has retransmitted data
	match2[COL_RETRAN] = {"$gt" : 0};
	//2. bandwidth is less than expected
	match2[ COL_DATA_VOLUME ] = {"$lt" : MAX_DATA_VOLUME };

	const query = [
		{"$match"  : match},
		{"$group"  : groupBy},
		{"$match"  : match2},
	];
	
	console.log("max throughput per slice query: ", JSON.stringify(query ));
	
	dbconnector._queryDB( "data_session_real", "aggregate", query, 
		function( err, result){
			if( err )
				return console.error( err );
			if( result.length  == 0 ) 
				return;
			//console.log(  result )
			//result = [ { '14': 63266316, '36': 1, _id: {} } ]
			result = result[0];
			
			const currentBw = getBandwidth( result[ COL_DATA_VOLUME ] )
			
			const other = {retransmission: result[COL_RETRAN]};
			const val = [
				["bandwidth_bps", currentBw],
				["nb_retrans", result[COL_RETRAN]]
			]
			if( currentBw <= VIOLA_BW){
				console.log(" => raise violation as current BW (" + currentBw + ') < ' + VIOLA_BW );
				_createSecurityAlert(app.app_id, "operator", now, metric.id, "not_respected", "security", metric.title, 
						{"event_1": {"timestamp": now, "description": "detected by SLA violation checking engine", "attributes": val}});

				return _raiseMessage( now, constant.VIOLATION_STR, app.app_id, com.id, metric.name, VIOLA_BW, val, m.priority, other);
			} else {
				console.log(" => raise alert as current BW (" + currentBw + ') < ' + ALERT_BW );
				return _raiseMessage( now, constant.ALERT_STR, app.app_id, com.id, metric.name, ALERT_BW, val, m.priority, other);
			}
			
		}, false);

}

// max available bandwidth
function getMinAvailableBandwidthBps( com ){
	const defaultBw = 10*1000*1000; //10 Mbps
	const dlMetric = com.metrics.find( (me) => me.name == "dlTput.maxDlTputPerSlice");
	const ulMetric = com.metrics.find( (me) => me.name == "ulTput.maxUlTputPerSlice");

	const max = Math.min(defaultBw, convertToBits(dlMetric.violation, dlMetric.unit),
		convertToBits(ulMetric.violation, ulMetric.unit));
		
	console.log("max avail bandwidth: " + max );
	return max;
}

function _checkDDoS( metric, m, app, com ){
   //nothing to do
	const ipRange = com.ip;
	if( !ipRange )
		return console.log("not found IP range");
	
	const [cidrStart, cidrEnd] = calculateCidrRange( ipRange );
	const now = (new Date()).getTime();

	//the thresholds can be provided via SLA file
	const ddosConf = metric?.config?.threshold || {};

	const match = {};
	//in checking period
	match[COL.TIMESTAMP] = {"$gte": TIMESTAMP.start,"$lt": TIMESTAMP.end};
	// IP in the list
	match["ip_src"] = { "$gte": cidrStart, "$lte": cidrEnd }
	const groupBy = {"_id": {}};
	// group by ip_src
	[COL.IP_SRC].forEach( (e) => groupBy["_id"][e] = "$"+e);
	// sum by
	[COL.ACTIVE_FLOWS, COL.DATA_VOLUME].forEach( (e) => groupBy[e] = {"$sum" : "$"+e} );
	
	// count
	[COL.IP_DST].forEach( (e) => groupBy[e] = {"$addToSet" : '$'+e} );

	const availBw    = getMinAvailableBandwidthBps( com );	
	
	const query = [
		{"$match"  : match},
		{"$group"  : groupBy}
	];
	
	console.log("check DDoS query: ", JSON.stringify(query ));
	
	dbconnector._queryDB( "data_link_real", "aggregate", query, 
		function( err, result){
			if( err )
				return console.error( err );
			if( result.length  == 0 ) 
				return;
			console.log("DDoS query result: ", result);
			//result = [ { '7': 1321, '8': 295534, _id: { '18': '10.0.2.2' } } ]
			result.forEach( function(row){
				const ip         = row["_id"][COL.IP_SRC];
				const consumedBw = getBandwidth(row[COL.DATA_VOLUME] );

				const targets    = row[COL.IP_DST];
				// 1. does it consume all bandwidth ?
				const bw_threshold = ddosConf.consumed_bps || availBw * 0.9;
				 
				if( consumedBw <  bw_threshold)
					return;

				const nb_flows = ddosConf.nb_flows || 100;
				// 2. has it a lot of flows ?
				if( row[COL.ACTIVE_FLOWS] < nb_flows )
					return;
				
				const nb_targets = ddosConf.nb_targets || 10;
				// 3. has it a lot of IP destination
				if( targets.length < nb_targets )
					return;

				// until here we can conclude DDoS
				
				// create a security alert to show it in "security" dashboard
				const val = [["ip.src", ip], 
						["consumed_bw", consumedBw], 
						["percent_bw",  Math.round(consumedBw*100.0/availBw)], 
						["nb_flows", row[COL.ACTIVE_FLOWS] ], 
						["nb_targets", targets.length ],
						["targets", targets]
				];
				console.log("=> DDoS detected ", val);
				_createSecurityAlert(app.app_id, "operator", now, metric.id, "detected", "attack", metric.title, 
						{"event_1": {"timestamp": now, "description": "detected by SLA violation checking engine", "attributes": val}});

				const other = {"ip": ip};
				return _raiseMessage( now, constant.VIOLATION_STR, app.app_id, com.id, metric.name, m.violation, val, m.priority, other);
			})
		}, false);
}

function convertToSecond(value, unit) {
	value = parseFloat( value );
	switch (unit) {
		case "s":
			return value;
		case "ms":
			return value / 1000;
		case "us":
			return value / 1000000;
	}
	console.error("unkown unit " + unit);
	return value;
}

function _checkE2eLatency( metric, m, app, com ){
   //nothing to do
	const ipRange = com.ip;
	if( !ipRange )
		return console.log("not found IP range");
	
	const [cidrStart, cidrEnd] = calculateCidrRange( ipRange );
	const now = (new Date()).getTime();

	//the thresholds can be provided via SLA file
	const min_latency_value = Math.min( m.alert, m.violation );
	const unit = m.unit;
	const min_latency_second = convertToSecond( min_latency_value, unit );
	const min_latency_microsec = min_latency_second * 1000 * 1000;
	console.log("min latency us: ", min_latency_microsec );
	const violation_latency_ms = convertToSecond(m.violation, unit) * 1000;
	
	const match = {isGen: false, 0: 100}; //only session-based protocols
	//in checking period
	match[COL.TIMESTAMP] = {"$gte": TIMESTAMP.start,"$lt": TIMESTAMP.end};
	//1. IP in the list
	match["ip_src"] = { "$gte": cidrStart, "$lte": cidrEnd };
	//2. latency > given latency
	//[COL.HANDSHAKE_TIME].forEach( (e) => match[e] = {"$gt" : min_latency_microsec} );
	
	const groupBy = {"_id": {}};
	// group by ip_src and ip_dst
	[COL.IP_SRC, COL.IP_DST].forEach( (e) => groupBy["_id"][e] = "$"+e);
	// sum by
	[COL.HANDSHAKE_TIME, COL.RTT_MAX_CLIENT, COL.RTT_MAX_SERVER].forEach( 
		(e) => groupBy[e] = {"$max" : "$"+e} );

	[COL.DATA_TRANSFER_TIME, COL.ACTIVE_FLOWS].forEach( 
		(e) => groupBy[e] = {"$sum" : "$"+e} );
	
	const query = [
		{"$match"  : match},
		{"$group"  : groupBy}
	]
	
	console.log( "latency query: ", JSON.stringify(query ) );
	
	dbconnector._queryDB( "data_session_real", "aggregate", query, 
		function( err, result){
			if( err )
				return console.error( err );
			if( result.length  == 0 ) 
				return;
			console.log("latency query result: ", result);
			//result = [ { '7': 1321, '8': 295534, _id: { '18': '10.0.2.2' } } ]
			result.forEach( function(row){
				const ip         = row["_id"][COL.IP_SRC];
				const target     = row["_id"][COL.IP_DST];
				// latency in micro seconds
				const latency_us = Math.max( 
					row[COL.HANDSHAKE_TIME],
					row[COL.RTT_MAX_CLIENT],
					row[COL.RTT_MAX_SERVER]
				) / 2;  //E2E latency = RTT /2 
				
				// ignore the latency < the min
				if( latency_us < min_latency_microsec )
					return;

				const latency_ms = latency_us / 1000;
				
				const latency_avg_ms = Math.round(row[COL.DATA_TRANSFER_TIME] / row[COL.ACTIVE_FLOWS]) / 1000;
				
				// create a security alert to show it in "security" dashboard
				const val = [
						["ip.src", ip], 
						["ip.dst", target], 
						["max_latency_ms",  latency_ms],
						["avg_latency_ms", latency_avg_ms],
						["nb_flows", row[COL.ACTIVE_FLOWS]] 
				];
				console.log("=> E2eLatency detected: ", latency_ms, ", violation_latency_ms:", violation_latency_ms);
				const other = {"ip": ip};
					
				//create a security alert only when the metric is violated
				if( latency_ms >= violation_latency_ms ){
					_createSecurityAlert(app.app_id, "operator", now, metric.id, "not_respected", "security", metric.title, 
						{"event_1": {"timestamp": now, "description": "detected by SLA violation checking engine", "attributes": val}});
				
					return _raiseMessage( now, constant.VIOLATION_STR, app.app_id, com.id, metric.name, m.violation, val, m.priority, other);
				} else
					return _raiseMessage( now, constant.ALERT_STR, app.app_id, com.id, metric.name, m.alert, val, m.priority, other);
			}); //end forEach
		}, false);
}

function perform_check(){

   console.log(" checking SLA violation ...");
   //get a list of applications defined in metrics collections
   dbconnector._queryDB("metrics", "find", [], function( err, apps){
      if( err )
         return console.error( err );
      var checked = {};
      console.log(`got ${apps.length} app to check SLA`);
      //for each application
      for( var i in apps ){
         var app = apps[i];
         if( app == null )
            continue;

         if( app.selectedMetric == undefined )
            continue;
         
         //for each component in the app
         for( var j in app.components ){
            var com = app.components[j];

            //this url has been checked
            if( checked[ com.id ] )
               continue;

            //mark its as checked
            checked[ com.id ] = true;
            
            var selectedMetrics = app.selectedMetric[ com.id ];

            //no metric
            if( selectedMetrics == undefined )
               continue;

            var metrics = com.metrics

            if( metrics == undefined || metrics.length === 0 )
               metrics = app.metrics; //common metrics being used by any app
            else
               metrics = metrics.concat( app.metrics );

            //no metrics
            if( metrics == undefined || metrics.length === 0 )
               continue;


            //for each selected metric of a component
            for( var k in metrics ){
               //original definition of metric
               var metric = metrics[ k ];

               //prameter of the metric is set by user
               var m = selectedMetrics[ metric.id ];
               if( m == undefined )
                  continue;
               
               //metric is disable
               if( ! m.enable )
                  continue;
               
               //no alerts nor violation conditions
               if( m.alert == "" && m.violation == "" )
                  continue;

               //metric: original metric
               //m: metric's values that have been updated by user via GUI
               console.log("Checking metric " + metric.name +': ' + JSON.stringify(m));
               
               switch( metric.name ){
                  //musa project
                  case "availability":
                     _checkAvailability( metric, m, app, com );
                     break;
                  case "incident":
                     _checkIncident( metric, m, app, com );
                     break;
                  //sendate demo
                  case "isolation_access":
                     _checkIsolationAccesss( metric, m, app, com );
                     break;
                  case "limit_gtp":
                     _checkGtpLimitation( metric, m, app, com );
                     break;

                  //influence
                  case "attack.DDoS":
                     _checkDDoS( metric, m, app, com );
                     break;

                  case "dlTput.minDlTputRequirement":
                     break;

                  case "dlTput.maxDlTputPerSlice":
                     _checkMaxThroughputPerSlice( metric, m, app, com, true );
                     break;
                  case "ulTput.maxUlTputPerSlice":
                     _checkMaxThroughputPerSlice( metric, m, app, com, false );
                     break;

                  case "dlTput.maxTputVariation":
                  case "ulTput.maxTputVariation":
                     break;

                  case "latency.maxE2ELatency":
                     _checkE2eLatency( metric, m, app, com );
                     break;

                  case "latency.lowJitter":
                     break;


                  case "dim.maxPDUsessions":
                     break;

                  case "dim.numberOfTerminals":
                     break;

               }
            }
         }
      }

      TIMESTAMP.start = TIMESTAMP.end;
      TIMESTAMP.end   = (new Date()).getTime();

   }, false );
}


function start( pub_sub, _dbconnector ){
	if( ! config.sla )
		return console.log("Not found SLA in config");

	if (config.sla.violation_check_period < 10){
		console.log("Set violation_check_period = 10 seconds");
		config.sla.violation_check_period = 10
	}

   console.log("Start SLA violation checking engine");
   //donot check if redis/kafka is not using
   //if( pub_sub == undefined ){
   //   console.error("This work only for kafka/redis bus");
   //   process.exit( 1 );
   //   return;
   //}

   //when db is ready
   _dbconnector.onReady( function(){
      dbconnector = _dbconnector;
      if( pub_sub )
         publisher = pub_sub.createClient("producer", "musa-violation-checker");

      CHECK_AVG_INTERVAL_MILISECOND = config.sla.violation_check_period*1000; //each X seconds
      console.log("start SLA violation checking each " + config.sla.violation_check_period + " seconds");

      //at the begining, we check in the period [now-X, now]
      const now = (new Date()).getTime(); //millisecond
      TIMESTAMP.start = now - CHECK_AVG_INTERVAL_MILISECOND;
      TIMESTAMP.end   = now;
      setInterval( perform_check, CHECK_AVG_INTERVAL_MILISECOND );
   });
}

function reset(){

}

var obj = {
      start: start,
      reset: reset,
      router: router,
};

module.exports = obj;