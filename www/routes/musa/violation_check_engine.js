const constant = require("../../libs/constant.js");
const CHECH_AVG_INTERVAL = 60*1000; //1minute

//global variable for this module
var dbconnector = {};
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

            if( metrics == undefined || metrics.length == 0 )
               metrics = app.metrics; //common metrics being used by any app
            else
               metrics = metrics.concat( app.metrics );

            //no metrics
            if( metrics == undefined || metrics.length == 0 )
               continue;


            //for each selected metric of a component
            for( var k in metrics ){
               //original definition of metric
               var metric = metrics[ k ];

               //prameter of the metric is set by user
               var m = selectedMetrics[ metric.id ];

               //metric is disable
               if( m.enable == false )
                  continue;

               switch( metric.name ){
                  case "availability":
                     _checkAvailability( metric, m, app, com );
                     break;
                  case "incident":
                     _checkIncident( metric, m, app, com );
                     break;
               }
            }
         }
      }

   }, false );
}


function start( pub_sub, _dbconnector ){
   //donot check if redis/kafka is not using
   if( pub_sub == undefined ){
      console.error("This work only for kafka/redis bus");
      process.exit( 1 );
      return;
   }

   //when db is ready
   _dbconnector.onReady( function(){
      dbconnector = _dbconnector;
      publisher   = pub_sub.createClient("producer", "musa-violation-checker");

      setInterval( perform_check, 
            _mmt.config.sla.violation_check_period*1000 //each 5 seconds
      );
   });
}

function reset(){

}

var obj = {
      start: start,
      reset: reset
};

module.exports = obj;