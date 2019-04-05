const express = require('express');
const router  = express.Router();

const config   = require("../../libs/config");
const constant = require("../../libs/constant.js");

const CHECH_AVG_INTERVAL = 60*1000; //1minute



//global variable for this module
var dbconnector = null;
var publisher   = {};

//type: violation | alert
function _raiseMessage( timestamp, type, app_id, com_id, metric_id, threshold, value, priority ){
   value = Math.round(value * 100)/100;
   const msg = [timestamp, app_id, com_id, metric_id, type, priority, threshold, value ];
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
router.get("/:type/:app_id/:com_id/:metric_id/:threshold/:value/:priority", function( req, res, next ){
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
router.get("/:type/:metric_name", function( req, res, next ){
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

function perform_check(){

   //get a list of applications defined in metrics collections
   dbconnector._queryDB("metrics", "find", [], function( err, apps){
      if( err )
         return console.error( err );
      var checked = {};

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
               if( m.enable === false )
                  continue;
               
               //no alerts nor violation conditions
               if( m.alert == "" && m.violation == "" )
                  continue;

               console.log("checking metric " + metric.name);
               
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
               }
            }
         }
      }

   }, false );
}


function start( pub_sub, _dbconnector ){
   console.log("Start SLA viloation checking engine");
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

      setInterval( perform_check, 
            config.sla.violation_check_period*1000 //each 5 seconds
      );
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