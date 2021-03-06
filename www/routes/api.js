const express = require('express');

const auth    = require('./auth');
var router  = express.Router();
const config    = require("../libs/config.js");
const CacheFile = require("../libs/CacheFile.js");

const lteTopology = require("../libs/lteTopology");

if( config.modules.indexOf( "enodeb" ) != -1 )
   var enodeb  = require("./api/enodeb");

function proc_request(req, res, next) {

   //check session loggedin
   if (!auth.isLogin( req )) {
      res.status(403).send("Permision Denided");
      return;
   }

   const sendResponse = function( error, data ){
      res.setHeader("Content-Type", "application/json");
      
      if( error ){
         res.status( 500 ).send( error ); //interntl error
         console.error( error );
         return;
      }
      
      
      res.send({
         data : data,
         now  : (new Date()).getTime()
      });
   };
   
   const collection  = req.params.collection;
   const action      = req.params.action;
   const dbconnector = router.dbconnector;
   //query database
   var query = undefined;
   if ( req.query.query ){
      try{
         query = JSON.parse( req.query.query );
      }catch( ex ){
         return sendResponse( "Query is incorrect: " + ex.message );
      }
   }else if ( req.body )
      query = req.body;


   //special collections
   switch(collection ){
      //get status
      case "status":
         dbconnector.getLastTime(function(err, time) {
            if (err)
               return next(err);

            const interval = parseInt(action);
            
            //do not take into account the last sample period that is being updated to DB
            //apply only for online analysis
            if( ! config.is_probe_analysis_mode_offline )
                  time -= config.probe_stats_period * 1000;

            var time = {
                  begin : time - interval,
                  end   : time,
                  now   : (new Date()).getTime()
            };

            //probe status: stat_time, stop_time
            dbconnector.probeStatus.get( time, function(err, obj) {
               var obj = {
                     time : time,
                     //attach list of applications detected by oprator (name of website)
                     protocols   : dbconnector.appList.get(),
                     data        : [],
                     probeStatus : obj
               };

               res.setHeader("Content-Type", "application/json");
               res.send(obj);
            });
         });
         return;
      case "mysql":
         if( typeof( enodeb[ action ] ) != "function" )
            return sendResponse("Does not support action " + action );
         
         if( Array.isArray( query ) )
            query = query[0];
         
         enodeb[ action ]( query, function( error, results, fields ){
            sendResponse( error, results );
         })
         return;
         
      //get topology of enodeb
      case "lte_topology":
         dbconnector.queryDB(collection, action, query, function( err, data){
            if( err )
               return sendResponse( err );
            lteTopology( data, sendResponse );
         }, false);
         return;
   }

   var checkNotNull = function( obj, msg ){
      if( obj == undefined ){
         var err = new Error( msg );
         err.status = 400; //bad request
         throw err;
         return true;
      }
      return false;
   }



   if( ["find", "aggregate"].indexOf(action) != -1 ){
      //for each query, we check firstly if there exist a cache that contains the result of the query
      //if this is a case, we return the content of the file
      const obj = {col: collection, act: action, query: query, raw: req.query.raw};
      const cacheFile = new CacheFile( obj );
      
      if( cacheFile.hasData()  ){
         console.info( "Load data from cache " + cacheFile.getFileName() );
         cacheFile.getDataFromCache( sendResponse );
      }else{
         
         dbconnector.queryDB(collection, action, query, function( err, data){
            sendResponse( err, data );
            
            if( !err )
               cacheFile.saveDataToCache( data );
            
         }, req.query.raw);
      }
   }else{
      checkNotNull( query.$data, "Need $data" );

      console.log( JSON.stringify(query ) );
      if( action === "update" ){
         checkNotNull( query.$match, "Need $match" );

         var ret = dbconnector.mdb.collection( collection ).update( query.$match, query.$data, query.$options, sendResponse);

      }else if( action === "insert" ){
         dbconnector.mdb.collection( collection ).insert( query.$data, query.$options, sendResponse );
      }else {
         sendResponse( "Tobe implemented" );
      }
   }
}

const PERIOD = {
      MINUTE      : "minute",
      HOUR        : "hour",
      HALF_DAY    : "12hours",
      QUARTER_DAY : "6hours",
      DAY         : "day",
      WEEK        : "week",
      MONTH       : "month"
};

function getOptionsByPeriod(period) {
   var retval = {
         period_groupby : 'real',
         time : 5 * 60 * 1000
   };
   switch( period ){
   case PERIOD.HOUR:
      retval = {
            period_groupby : "real",//'minute',
            time : 60 * 60 * 1000
      };
      break;
      
   case PERIOD.HALF_DAY:
      retval = {
            period_groupby : 'minute',
            time : 12 * 60 * 60 * 1000
      };
      break;
   case PERIOD.QUARTER_DAY:
      retval = {
            period_groupby : 'minute',
            time : 6 * 60 * 60 * 1000
      };
      break;
   case PERIOD.DAY:
      retval = {
            period_groupby : 'minute',
            time : 24 * 60 * 60 * 1000
      };
      break;
   case PERIOD.WEEK:
      retval = {
            period_groupby : 'hour',
            time : 7 * 24 * 3600 * 1000
      };
      break;
   case PERIOD.MONTH:
      retval = {
            period_groupby : 'day',
            time : 30 * 24 * 3600 * 1000
            //TODO a month does not always have 30 days
      };
      break;
   }
   return retval;
}

function getOptionsByPeriod2 (period) {
   var retval = {
         time : {
            begin : period.begin,
            end : period.end
         },
         period_groupby : 'day',
   };

   var now = (new Date()).getTime();
   if (retval.time.end > now)
      retval.time.end = now;

   return retval;
}

router.get('/:collection/:action', proc_request);
router.post('/:collection/:action', proc_request);

//older way to get data
router.get('/*', function(req, res, next) {

   var dbconnector = router.dbconnector;

   var period = req.query.period || PERIOD.MINUTE;
   //QoSVideo
   if (req.query.format == '70')
      period = PERIOD.MINUTE;

   if (typeof period === "string" && period.indexOf("begin") > -1
         && period.indexOf("end") > -1)
      period = JSON.parse(period);

   var options;
   if (period.begin != undefined && period.end != undefined) {
      if (req.query.period_groupby) {
         //override by user; default = day (when user select an interval between two date)
         options = getOptionsByPeriod(req.query.period_groupby);
         options.time = {
               begin : parseInt(period.begin),
               end : parseInt(period.end)
         };
         period = req.query.period_groupby;
         console.log( JSON.stringify( req.query ));
      } else
         options = getOptionsByPeriod2(period);
   } else
      options = getOptionsByPeriod(period);

   //default values
   options.format = [];
   options.raw = true;
   options.probe = [];
   options.source = [];
   options.proto = [];
   options.period = period;
   options.isReload = false;

   if (req.query.id)
      options.id = req.query.id;

   if (req.query.format instanceof Array)
      req.query.format.forEach(function(e) {
         options.format.push(parseInt(e));
      });
   else if (req.query.format)
      options.format.push(parseInt(req.query.format));

   if (req.query.raw)
      options.raw = (req.query.raw === 'true');

   if (req.query.probe instanceof Array) {
      req.query.probe.forEach(function(e) {
         options.probe.push(parseInt(e));
      });
   }else if( req.query.probe )
      options.probe.push(parseInt(req.query.probe));

   if (req.query.source instanceof Array) {
      req.query.source.forEach(function(e) {
         options.source.push("'" + e + "'"); //TODO avoid sql injection here ???
      });
   }

   if (req.query.proto instanceof Array)
      req.query.proto.forEach(function(e) {
         options.proto.push(e);
      });
   else if( req.query.proto )
      options.proto.push( req.query.proto );
   
   if (req.query.isReload)
      options.isReload = (req.query.isReload === 'true');

   if (req.query.userData)
      options.userData = req.query.userData;

   console.log( JSON.stringify( options ));

   var queryData = function(op) {
      
       //for each query, we check firstly if there exist a cache that contains the result of the query
      //if this is a case, we return the content of the file
      const cacheFile = new CacheFile( op );
      
      if( cacheFile.hasData()  ){
         console.info( "Load data from cache " + cacheFile.getFileName() );
         cacheFile.getDataFromCache( function( err, data ){
            if( err )
               return next( err );
            res.send( data );
         });
      } else {
         dbconnector.getProtocolStats(op, function(err, data) {
            if (err) {
               return next(err);
            }
            //this allow a req coming from a different domain
            //res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", "application/json");
            var obj = {
                  data : data,
                  time : op.time,
            };

            if (op.userData != undefined && op.userData.getProbeStatus) {
               dbconnector.probeStatus.get(op.time, function(err, arr) {
                  obj.probeStatus = {};
                  for ( var i in arr){
                     var msg = arr[i];
                     if( obj.probeStatus[ msg.id ] == undefined )
                        obj.probeStatus[msg.id] = [];

                     obj.probeStatus[msg.id].push({
                        start       : msg.start,
                        last_update : msg.last_update
                     });
                  }
                  res.send(obj);
                  cacheFile.saveDataToCache( obj );
               });
            } else {
               res.send(obj);
               cacheFile.saveDataToCache( obj );
            }
         });
      }
   };

   if (options.time.begin === undefined)//interval
      dbconnector.getLastTime(function(err, time) {
         if (err)
            return next(err);

         console.log("lastime: " + time + " "
            + (new Date(time)).toTimeString());

         var inteval = options.time;
         options.time = {
               begin : time - inteval,
               end : time
         };

         queryData(options);
      });
   else
      queryData(options);
});

module.exports = router;
