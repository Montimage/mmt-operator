const dataIndex   = require("../libs/shared/dataIndex");
const dataAdaptor = require("../libs/dataAdaptor");
const config      = require("../libs/config.js");
const tools       = require("../libs/tools");
const mysql       = require('mysql');
const interProcCache  = require('../libs/InterProcessCache.js');

const isEnableEnodeB = Array.isArray( config.modules ) && (config.modules.indexOf("enodeb") != -1); 

if( isEnableEnodeB ){
   const mysqlConfig = tools.getValue( config, ["modules_config", "enodeb", "mysql_server"]);
   if( mysqlConfig == null ){
      console.error("Cannot find configuration of mysql server for eNodeB modules");
      process.exit();
   }

   const mysqlConnection = mysql.createConnection( mysqlConfig );

   const COL = dataIndex.StatsColumnId;
   const GTP = dataIndex.GtpStatsColumnId;

   const ueSqlString = 
      "SELECT " +
      "service_data.imsi     as imsi     , " +
      "service_data.ue_ip    as ue_ip    , " +
      "service_data.enb_name as enb_name , " +
      "amf_settings.name     as mme_name " +
      "FROM service_data " +
      "INNER JOIN amf_settings " +
      "WHERE " +
      "      service_data.mmegi = amf_settings.mmegi " +
      "  AND service_data.mmec  = amf_settings.mmec "
      ;

// the field in amf_enb_data: enb_name, amf_name, enb_ip
   const enbSqlString = 
      "SELECT enb_name as enb_name, " +
      "       amf_name as mme_name, " +
      "       enb_ip   as enb_ip " +
      "FROM amf_enb_data";

   const UNKNOWN = "_unknown";
   /*
    * Append all attribute from lte to msg
    */
   function _appendData( type, msg, cb ){
      let ip = msg[ COL.IP_SRC ];
      let o  = cache[type][ ip ]; //type = "ue" or "enb"
      
      if( o == null ){
         //console.warn("No eNodeB info for this report: " + JSON.stringify( msg ) );
       //even after quering DB, we didn't find info of this IP
         o = {};
         if( type === "ue" ){
            o[ GTP.IMSI ]     = UNKNOWN;
            o[ GTP.ENB_NAME ] = UNKNOWN;
            o[ GTP.MME_NAME ] = UNKNOWN;
         } else { //ENB <-> MME
            //try onther end
            ip = msg[ COL.IP_DST ]
            o = cache[type][ip];
            
            if( o != undefined )
               //as we found it, we need to invert the direction to ensure that IP_SRC is IP of eNodeB
               dataAdaptor.inverseStatDirection( msg );
            else
            {
               o = {};
               o[ GTP.ENB_NAME ] = UNKNOWN;
               o[ GTP.MME_NAME ] = UNKNOWN;
            }
         }
         //ignore the real data of this UE in a moment (in DB_QUERY_INTERVAL) by adding UNKNOWN to cache
         cache[type][ ip ] = o;
      }
      
         
      //append data from o to msg
      for( var i in o )
         msg[i] = o[i];
      
      cb( msg );
   }

   const cache = {
         ue : {}, //set of ue
         enb: {}, //set of enb
         reloaded: false //whether the cache has been loaded from DB
   };

   /*
    * Load data from mysql of vEPC to cache
    */
   function _loadCacheFromDB( cb ){
      //clear cache
      cache.reloaded = true;
      
      //1. load enb data
      mysqlConnection.query( enbSqlString, function( err, data, fields ){
         if( err ){
            console.error("Cannot connect to mysql: " + err.message);
            return cb();
         }
         else{
            //clear cache
            cache.enb = {};
            for( var i in data ){
               var o = data[i];
               var m = {};
               m[ GTP.ENB_NAME ] = o.enb_name;
               m[ GTP.MME_NAME ] = o.mme_name;

               //add to local cache
               cache.enb[ o.enb_ip ] = m;
            }
         }
         //2. load UE data
         mysqlConnection.query( ueSqlString, function( err, data, fields ){
            if( err )
               console.error( err );
            else{
               console.info( "load " + data.length + " UEs from mysql DB" );
               //clear cache
               cache.ue = {};
               for( var i in data ){
                  var o = data[i];
                  var m = {};
                  m[ GTP.IMSI ]     = o.imsi;
                  m[ GTP.ENB_NAME ] = o.enb_name;
                  m[ GTP.MME_NAME ] = o.mme_name;
                  
                  //save ue to cache
                  cache.ue[ o.ue_ip ] = m;
               }
            }

            //fire the callback
            cb();
         });
      });
   }

// interval, in miliseconds, to query data from mysql
   const DB_QUERY_INTERVAL = 5000*6; //do query each 3 second
   var   lastMsgTimestamp = 0;


// this cache contains messages that comme (by calling _appendSuplementData) when we are loading data from DB
   var msgCache = [];
   var isQueringDB = false;
   
   
   //https://en.wikipedia.org/wiki/QoS_Class_Identifier
   const QCI = {
      1: {delay: 100, pelr: 10e-2}, //delay 100ms, packet error lost rate: 10-2 = 1%
      2: {delay: 150, pelr: 10e-3},
      3: {delay:  50, pelr: 10e-3},
      4: {delay: 300, pelr: 10e-6},

      5: {delay: 100, pelr: 10e-6},
      6: {delay: 300, pelr: 10e-6},
      7: {delay: 100, pelr: 10e-3},
      8: {delay: 300, pelr: 10e-6},
      9: {delay: 300, pelr: 10e-6},
      
      64: {delay:  75, pelr: 10e-2},
      66: {delay: 100, pelr: 10e-2},
      69: {delay:  60, pelr: 10e-6},
      70: {delay: 200, pelr: 10e-6}
   };
   
   const QOS_CACHE_KEY = 'lteQciCache';
   var qciCache = {};
   
   interProcCache.get( QOS_CACHE_KEY, function(val){
      if( val != undefined )
         qciCache = val;
   });
   
   
   function _addQci( msg ){
      interProcCache.get( QOS_CACHE_KEY, function(val){
         if( val != undefined )
            qciCache = val;
         
         console.log("Qci cache:", qciCache );
         
         const teid = msg[ 5 ];
         const qci  = msg[ 6 ];
         qciCache[ teid ] = qci;
         
         //update
         interProcCache.set( QOS_CACHE_KEY, qciCache );
      });
   }

   function _appendExpectedQoS( msg ){
      msg[ GTP.EXPECTED_DELAY ] = 0;
      msg[ GTP.EXPECTED_PELR ]  = 0;
      
      let teids = msg[ GTP.TEIDs ];
      //if( teids == undefined )
      //   return;
      
      if( ! Array.isArray( teids ))
         teids = [ teids ];
      
      
      
      const teid_ul = teids[0]
      let qci = qciCache[ teid_ul ];
      if( qci == undefined )
            qci = 9; //use default qci
         
      const data_ul = QCI[ qci ];
      if( data_ul !== undefined ){
         //console.log( data_ul );
         msg[ GTP.EXPECTED_DELAY_UL ] = data_ul.delay;
         msg[ GTP.EXPECTED_PELR_UL ]  = data_ul.pelr;
      }else{
         console.error('Does not support qCI=' + qci + ' of teid=' + teid_ul);
      }
      
      const teid_dl = teids[1];
      qci = qciCache[ teid_dl ];
      if( qci == undefined )
            qci = 9; //use default qci
      const data_dl = QCI[ qci ];
      if( data_dl !== undefined ){
         //console.log( data_dl );
         msg[ GTP.EXPECTED_DELAY_DL ] = data_dl.delay;
         msg[ GTP.EXPECTED_PELR_DL ]  = data_dl.pelr;
      }else
         console.error('Does not support qCI=' + qci + ' of teid=' + teid_dl);
   }
   
   
   
   /*
    * Append LTE information, such as, imsi, ue_ip, to session report (100)
    * This function will check in its cache to find info of UE.
    * If it does not find, it does a query to mysql DB of Cumucore EPC.
    * Then it call appendData to append info of UE to the gtp reports before inserting them to DB 
    */
   function _appendSuplementData( type, msg, cb ){
      
      //when this function is called again while we are quering DB
      //=> stock its parameters (type, msg, cb) into cache
      //=> they will be processed once the quering DB terminates
      if( isQueringDB ){
         msgCache.push( {type: type, msg: msg, cb: cb} );
         return;
      }

      var ts  = msg[ COL.TIMESTAMP ];

      //if timeout => do:
      //  (1): reload cache from Database
      //  (2): update msg with the elements getting from the cache
      //else
      //  do only (2)
      
      if( lastMsgTimestamp + DB_QUERY_INTERVAL < ts
            //or data is not available in the cache
            || cache.reloaded === false ){
         
         //mark 
         isQueringDB = true;

         //remember this moment
         lastMsgTimestamp = ts;

         //push the current params to cache
         msgCache.push( {type: type, msg: msg, cb: cb} );


         //try to load new data from DB
         _loadCacheFromDB( function(){
            //quering is finish
            isQueringDB = false;

            for( var i in msgCache ){
               var c = msgCache[i];
               var msg  = c.msg;
               var type = c.type;
               var cb   = c.cb;

               _appendData( type, msg, cb );
            }
            
            //reset cache
            msgCache = [];
         });
      } else
         _appendData( type, msg, cb );

   }

   module.exports = {
         appendSuplementDataGtp:  function( msg, cb ){ 
            try{
               _appendExpectedQoS( msg );
               _appendSuplementData( "ue", msg, cb);
            }catch( e ){
               console.error( e );
               cb( msg );
            }
         },
         
         appendSuplementDataSctp: function( msg, cb ){
            try{
               _appendSuplementData( "enb", msg, cb);
            }catch( e ){
               console.error( e );
               cb( msg );
            }
         },
         addQci: _addQci,
         isEnable : true
   }; 
} else {
   module.exports = {
         appendSuplementDataGtp:  function( msg, cb ){ cb(msg) },
         appendSuplementDataSctp: function( msg, cb ){ cb(msg) },
         addQci: function( msg ){},
         isEnable : false
   }; 
}