const dataIndex = require("../libs/shared/dataIndex");
const config    = require("../libs/config.js");
const tools     = require("../libs/tools");
const mysql     = require('mysql');



const mysqlConfig = tools.getValue( config, ["modules_config", "enodeb", "mysql_server"]);
if( mysqlConfig == null ){
   console.error("Cannot find configuration of mysql server for eNodeB modules");
   process.exit();
}

const mysqlConnection = mysql.createConnection( mysqlConfig );

const COL = dataIndex.StatsColumnId;
const GTP = dataIndex.GtpStatsColumnId;

const sqlString = 
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
 
const self = {
      cache: {},
      lastMsgTimestamp : 0,
      /*
       * Append LTE information, such as, imsi, ue_ip, to session report (100)
       * This function will check in its cache to find info of UE.
       * If it does not find, it does a query to mysql DB of Cumucore EPC.
       * Then it call appendData to append info of UE to the gtp reports before inserting them to DB 
       */
      appendSuplementData : function( msg, cb ){
         var ts  = msg[ COL.TIMESTAMP ];
         var ip  = msg[ COL.IP_SRC ];
         var lte = this.cache[ ip ];
         
         if( this.lastMsgTimestamp != ts || lte == undefined ){
            return mysqlConnection.query( sqlString, function( err, data, fields ){
//               console.log( data );
               if( err )
                  console.error( err );
               else{
                  //stock data in cache
                  console.info( "Update " + data.length + " records from mysql DB of eNodeB");
                  for( var i in data ){
                     var o = data[i];
                     var m = {};
                     m[ GTP.IMSI ]     = o.imsi;
                     m[ GTP.ENB_NAME ] = o.enb_name;
                     m[ GTP.MME_NAME ] = o.enb_name;
                     
                     self.cache[ o.ue_ip ] = m;
                     
                     if( o.ue_ip == ip )
                        lte = m;
                  }
               }
               
               if( lte == null ){
                  lte = {}; 
                  lte[ GTP.IMSI ]     = "_unknown";
                  lte[ GTP.ENB_NAME ] = "_unknown";
                  lte[ GTP.MME_NAME ] = "_unknown";
               }
               
               self.appendData( msg, lte, cb );
               
            });
         }else
            self.appendData( msg, lte, cb );
      },
      
      appendData: function( msg, lte, cb ){
         if( lte == null )
            console.warn("No eNodeB info for this report: " + JSON.stringify( msg ) );
         //append data from lte to msg
         for( var i in lte )
            msg[i] = lte[i];
         if( cb )
            cb( msg );
      }
}

module.exports = self; 