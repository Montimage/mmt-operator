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

   /*
    * Append all attribute from lte to msg
    */
   function _appendData( msg, lte, cb ){
      if( lte == null ){
         //console.warn("No eNodeB info for this report: " + JSON.stringify( msg ) );
      }else
         //append data from lte to msg
         for( var i in lte )
            msg[i] = lte[i];

      cb( msg );
   }

   const cache = {
         ue: {},
         enb: {},
   }

   /*
    * Load data from mysql of vEPC to cache
    */
   function _loadCacheFromDB( cb ){
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
               m[ GTP.MME_NAME ] = "develMME"//o.mme_name;

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
                  m[ GTP.MME_NAME ] = "develMME";//o.mme_name;

                  cache.ue[ o.ue_ip ] = m;
               }
            }

            //fire the callback
            cb();
         });
      });
   }

// interval, in miliseconds, to query data from mysql
   const DB_QUERY_INTERVAL = 5000;
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
      70: {delay: 200, pelr: 10e-6},
   }
   
   var qciCache = {};
   function _addQci( msg ){
      const teid = msg[ 5 ];
      const qci  = msg[ 6 ];
      qciCache[ teid ] = qci;
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
      var ip  = msg[ COL.IP_SRC ];
      var o   = cache[type][ ip ]; //type = "ue" or "enb"

      //if timeout
      if( lastMsgTimestamp + DB_QUERY_INTERVAL < ts
            //or data is not available in the cache
            //|| o == null 
            ){
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

               var ip = msg[ COL.IP_SRC ];

               //get new data
               o = cache[type][ip];

               //even after quering DB, we didn't find info of this IP
               if( o == undefined  ){
                  o = {};
                  if( type == "ue" ){
                     o[ GTP.IMSI ]     = "_unknown";
                     o[ GTP.ENB_NAME ] = "_unknown";
                     o[ GTP.MME_NAME ] = "_unknown";
                  } else {
                     //try onther end
                     ip = msg[ COL.IP_DST ]
                     o = cache[type][ip];
                     if( o == undefined ){
                        o = {};
                        o[ GTP.ENB_NAME ] = "_unknown";
                        o[ GTP.MME_NAME ] = "_unknown";
                     }
                     else{
                        //to ensure that IP_SRC is IP of eNodeB
                        dataAdaptor.inverseStatDirection( msg );
                     }
                  }
                  //ignore this UE in a moment (DB_QUERY_INTERVAL)
                  cache[type][ ip ] = o;
               }
               _appendData( msg, o, cb );
            }
         });
      }else
         _appendData( msg, o, cb );

   }

   module.exports = {
         appendSuplementDataGtp:  function( msg, cb ){ 
            _appendExpectedQoS( msg );
            _appendSuplementData( "ue", msg, cb); 
         },
         
         appendSuplementDataSctp: function( msg, cb ){ _appendSuplementData( "enb", msg, cb); },
         addQci: _addQci
   }; 
} else {
   module.exports = {
         appendSuplementDataGtp:  function( msg, cb ){},
         appendSuplementDataSctp: function( msg, cb ){},
         addQci: function( msg ){}
   }; 
}