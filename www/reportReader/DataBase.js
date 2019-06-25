/**
 * Insert Messages to Database 
 */

"use strict";

const config    = require("../libs/config"),
dataAdaptor     = require('../libs/dataAdaptor'),
tools           = require("../libs/tools"),
ip2loc          = require("../libs/ip2loc"),
CONST           = require("../libs/constant"),
MMTDrop         = require("../libs/shared/dataIndex"),
DataCache       = require("./Cache"),
DBInserter      = require("./DBInserter"),
FORMAT          = require('util').format,
enodeb          = require("./enodebData.js"),
ipLib           = require("ip")
;

const IP        = new (require("../libs/shared/IP.js"))();

const COL      = dataAdaptor.StatsColumnId;
const HTTP     = dataAdaptor.HttpStatsColumnId;
const NDN      = dataAdaptor.NdnColumnId;
const TLS      = dataAdaptor.TlsStatsColumnId;
const RTP      = dataAdaptor.RtpStatsColumnId;
const FTP      = dataAdaptor.FtpStatsColumnId;
const GTP      = dataAdaptor.GtpStatsColumnId;
const LICENSE  = dataAdaptor.LicenseColumnId;
const OTT      = dataAdaptor.OTTQoSColumnId;
const STAT     = dataAdaptor.StatColumnId;

const FORMAT_ID = COL.FORMAT_ID,
PROBE_ID        = COL.PROBE_ID,
SOURCE_ID       = COL.SOURCE_ID,
TIMESTAMP       = COL.TIMESTAMP,
REPORT_NUMBER   = COL.REPORT_NUMBER,
MICRO_FLOW_STR  = "micro";

//list of protocols (not application)
//this list is used to filter out applications.
//collections "data_protocol_*" store only protocols
const PURE_PROTOCOLS = {};
[
   //0, //unknown
   30,81,82,85,99,
   117,141,153,154,155,163,164,166,169,170,178,179,180,181,182,183,196,198,
   228,231,241,247,272,273,298,299,
   304,314,322,323,324,325,339,340,341,354,357,358,363,376,388,
   461,
   625,626,627,628,
   //sctp chunks
   631,632,645,646,647,648,649,650,651,652,653,654,655,
   //s1ap
   900
   ].forEach( function( el ){
      PURE_PROTOCOLS[ el ] = true;
   });

const DOUBLE_STAT_PERIOD_IN_MS = config.probe_stats_period_in_ms*1000*2;

/**
 * Flat an application path
 * @param str : application path, e.g., ETH.IP.TCP.HTTP
 * @returns an array contains all children paths, e.g., [ETH, ETH.IP, ETH.IP.TCP, ETH.IP.TCP.HTTP] 
 */

//array of keys
const flat_key_array = [ "path", "app", "depth" ]; 
function flatAppPath( str ){
   const pathArr = str.split(".");
   
   const arr = [];
   while(  pathArr.length > 0 ){
      var msg = {path: pathArr.join("."), app: parseInt(pathArr[ pathArr.length - 1 ]), depth: pathArr.length};
      //__mi_keys is used by mongodb to accelate bson functions
      //this must be used together with the hack was done in node_module/bson
      //msg.__mi_keys = flat_key_array;
      
      arr.push( msg );
      pathArr.length --;
   }
   return arr;
}

module.exports = function(){
   const self     = this;
   const inserter = new DBInserter( config.databaseName );
   self.onReady   = inserter.onReady;
   //count number of reports containing only one packet
   var no_1_packet_reports = 0;
   self.dataCache = {
         total: new DataCache( inserter, "data_total",
               {
            key: [COL.FORMAT_ID, COL.PROBE_ID],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
               }
         ),
         mac: new DataCache( inserter, "data_mac",
               {
            key: [COL.MAC_SRC, COL.PROBE_ID],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
            set: ["isGen"],
            init: [COL.START_TIME]
               },
               CONST.period.REAL
         ),
         protocol: new DataCache( inserter, "data_protocol",
               {
            key: [ COL.APP_PATH, COL.FORMAT_ID, COL.PROBE_ID ],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
            set: [COL.APP_ID, "proto_depth"]
               }
         ),
         app: new DataCache( inserter, "data_app",
               {
            key: [ COL.APP_PATH, COL.FORMAT_ID, COL.PROBE_ID],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
            set: ["isGen", "app_paths", COL.APP_ID, COL.PROFILE_ID]
               }
         ),
         ip: new DataCache( inserter, "data_ip", 
               {
            key: [ "ip", COL.PROBE_ID ],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
            set: ["isGen", COL.MAC_SRC, COL.IP_SRC ]
               }
         ),
         location: new DataCache( inserter, "data_location", 
               {
            key: [COL.DST_LOCATION, COL.PROBE_ID],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
               }
         ),
         //a link between 2 IPs
         link: new DataCache( inserter, "data_link", 
               {
            key: ["link", COL.PROBE_ID ],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
               COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
               COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
               COL.ACTIVE_FLOWS
               ],
            set: [COL.SRC_LOCATION, COL.DST_LOCATION, COL.IP_SRC, COL.IP_DST, "ip_src", "ip_dst"]
                     //SENDATE: add some attribute for SLA verification
                     .concat( config.isSLA ? ["slices", GTP.TEIDs] : [] )
               }
         ),
         
         reports: new DataCache( inserter, "reports",
               {}, 
               CONST.period.SPECIAL //keep original reports
         ),
         session: new DataCache(inserter, "data_session",
               {
            key : ["link", COL.APP_PATH, COL.FORMAT_ID, COL.PROBE_ID],
            inc : [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT,
               COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
               
               COL.HANDSHAKE_TIME, COL.APP_RESPONSE_TIME, COL.DATA_TRANSFER_TIME,
               
               COL.RTT_MIN_CLIENT, COL.RTT_MIN_SERVER,
               COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
               COL.RTT_MAX_CLIENT, COL.RTT_MAX_SERVER,
               COL.DL_RETRANSMISSION, COL.UL_RETRANSMISSION,
               
               //HTTP.RESPONSE_TIME, HTTP.TRANSACTIONS_COUNT,
               ],
            set : [COL.APP_ID, COL.START_TIME, "isGen", "app_paths", COL.IP_SRC, COL.IP_DST ]
               }
         ),
         
         unknownFlows : new DataCache( inserter, "data_unknown_flows",{
            key : [COL.IP_SRC, COL.IP_DST, COL.THREAD_NUMBER],
            inc : [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT,
               COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
               ],
            set  : [
               COL.PROBE_ID, COL.MAC_SRC, COL.MAC_DST
               ],
            init: [COL.START_TIME]
            },
            CONST.period.REAL
         ),

         //system statistics
         sysStat: new DataCache( inserter, "data_stat",
               {
            key: [STAT.FORMAT_ID, STAT.PROBE_ID],
            inc: [STAT.CPU_USER, STAT.CPU_SYS, STAT.CPU_IDLE, STAT.MEM_AVAIL, STAT.MEM_TOTAL, STAT.COUNT],
               }
         ),
         //for DOCTOR project
         //TODO to remove
         ndn: new DataCache( inserter, "data_ndn",
               {
            key: [COL.FORMAT_ID, COL.PROBE_ID, NDN.PACKET_ID],
            inc: [NDN.CAP_LEN, NDN.NDN_DATA, NDN.INTEREST_NONCE, NDN.INTEREST_LIFETIME, NDN.DATA_FRESHNESS_PERIOD],
            set: [NDN.MAC_SRC, NDN.NAME, NDN.MAC_DST, NDN.PARENT_PROTO, NDN.IP_SRC, NDN.IP_DST,
               NDN.QUERY, NDN.PACKET_TYPE, NDN.IFA]
               }
         ),

         //MUSA project
         //TODO to remove
         avail: new DataCache( inserter, "availability",
               {
            key: [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID],
            inc: [4, 5, 6 ]
               }
         ),
         
         //for eNodeB
         gtp: new DataCache( inserter, "data_gtp",
               {
            key: [COL.PROBE_ID, COL.SOURCE_ID, COL.IP_SRC, COL.IP_DST, GTP.IP_SRC, GTP.IP_DST, GTP.TEIDs, GTP.IMSI],
            inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT,
               COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
               COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
               ],
            set:[COL.MAC_SRC, COL.MAC_DST,  COL.IP_SRC_INIT_CONNECTION, COL.DST_LOCATION, GTP.ENB_NAME, GTP.MME_NAME ]
               }
         ),
         sctp: new DataCache( inserter, "data_sctp",
            {
         key: [COL.PROBE_ID, COL.SOURCE_ID, COL.IP_SRC, COL.IP_DST, COL.APP_PATH],
         inc: [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT,
            COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
            COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
            ],
         set:[COL.MAC_SRC, COL.MAC_DST, COL.IP_SRC_INIT_CONNECTION, COL.APP_ID,  GTP.ENB_NAME, GTP.MME_NAME ]
            }
      ),
   };
   
   function hasModule( module_name ){
      return config.modules.indexOf( module_name ) != -1;
   }
   
   //eliminate some caches if we do not need them
   if( !hasModule("unknown_traffic")   )
      delete self.dataCache.unknownFlows ;
   if( !hasModule("link"))
      delete self.dataCache.protocol;
   if( !hasModule("link"))
      delete self.dataCache.mac;
   if( !hasModule("network") && !hasModule("dpi") && !hasModule("application"))
      delete self.dataCache.app;
   if(  !hasModule("application") && !hasModule('enodeb'))
      delete self.dataCache.session;
   if( !hasModule("network") && !hasModule("application"))
      delete self.dataCache.ip;
   if( !hasModule("network") && !hasModule("application"))
      delete self.dataCache.reports;
   
   if( !hasModule("network") )
      delete self.dataCache.location;
   if( !hasModule("network") && ! config.isSLA ) //sla needs link collection to check isolation access => SENDATE demo
      delete self.dataCache.link;
   
   //flush
   setInterval( function(){
      self.flush( function(){} );
   }, config.probe_stats_period_in_ms*2 );
   
   //message contain only zero
   const zero_msg = [];
   
   function update_zero_msg( format, probe_id, input_src, ts ){
      zero_msg[ 0 ] = format;
      zero_msg[ 1 ] = probe_id;
      zero_msg[ 2 ] = input_src;
      zero_msg[ 3 ] = ts;
      return zero_msg;
   }
   
   /**
    * Add a new message to DB
    */
   self.add = function( message ){
      var msg = dataAdaptor.formatReportItem( message );

      const ts       = msg[ TIMESTAMP ];
      const format   = msg[ FORMAT_ID ];
      const input_src= msg[ SOURCE_ID ];
      const probe_id = msg[ PROBE_ID ];
      //const is_main_probe = (msg[ COL.THREAD_NUMBER ] == 0);
      var msg2;
      var is_micro_flow = false;

      switch( format ){

         //System statistic: CPU, memory
         case dataAdaptor.CsvFormat.SYS_STAT_FORMAT:
            self.dataCache.sysStat.addMessage( msg );
            
            return;

         case dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT:
         case dataAdaptor.CsvFormat.BA_PROFILE_FORMAT:
            //insert directly to DB
            inserter.add("behaviour", [msg] );
            //self.dataCache.total.addMessage( [dataAdaptor.CsvFormat.DUMMY_FORMAT, probe_id, input_src, ts] );
            return;

         case dataAdaptor.CsvFormat.SECURITY_FORMAT:
            inserter.add("security", [msg] );
            
            //self.dataCache.total.addMessage( [dataAdaptor.CsvFormat.DUMMY_FORMAT, probe_id, input_src, ts] );
            return;

         case dataAdaptor.CsvFormat.OTT_QOS:
            inserter.add("ott_qos", [msg] );
            return;

            //NDN protocol
         case 625:
            self.dataCache.ndn.addMessage( msg );
            //IFA: store all alerts

            const new_msg = {};
            //copy some attrs of msg to new_msg;
            [ COL.PROBE_ID, COL.TIMESTAMP, NDN.MAC_SRC, NDN.IFA ].forEach( function(el){
               new_msg[ el ] = msg[ el ];
            } );

            inserter.add( "ndn_alerts", [new_msg] );

            return;
            //MUSA project
         case 50:
            self.dataCache.avail.addMessage( msg );
            self.dataCache.total.addMessage( [dataAdaptor.CsvFormat.DUMMY_FORMAT, probe_id, input_src, ts] );
            return;
            //statistic reports

            //receive this msg when probe is starting
         case dataAdaptor.CsvFormat.STARTUP_REPORT:
            //when probe is starting up
            //=> clean lte_topology
            inserter.clean( "lte_topology" );
            return;
            
         case dataAdaptor.CsvFormat.LTE_TOPOLOGY_REPORT:
            inserter.add("lte_topology", [msg] );
            return;
         case dataAdaptor.CsvFormat.LICENSE:
            //new running period
            //this report is sent at each end of x seconds (after seding all other reports)
         case dataAdaptor.CsvFormat.DUMMY_FORMAT:
            //mark avaibility of this probe
            self.dataCache.total.addMessage( [dataAdaptor.CsvFormat.DUMMY_FORMAT, probe_id, input_src, ts] );
            return;

         case 99:
         case 100:
            
            //one msg is a report of a session
            //==> total of them are number of active flows at the sample interval
            msg[ COL.ACTIVE_FLOWS ] = 1;
            
            //mark avaibility of this probe
            self.dataCache.total.addMessage( msg );
            
            //a dummy report when session expired
            if( msg[ COL.PACKET_COUNT ] === 0 ){
               return;
            }
            
            //original message => clone a new one
            if( self.dataCache.reports )
               self.dataCache.reports.addMessage( dataAdaptor.formatReportItem( message ) );


            //unknown flows
            if( self.dataCache.unknownFlows && msg[ COL.APP_ID ] == 0)
               self.dataCache.unknownFlows.addMessage( msg );
            
            //this is original message comming from mmt-probe
            msg.isGen = false;

            is_micro_flow = (format === 100 && ( msg[ COL.PACKET_COUNT ] < config.micro_flow.packet || msg[ COL.DATA_VOLUME ] < config.micro_flow.byte ));
            if( is_micro_flow ){
               //this allows to distinguish 2 micro flow of 2 differents periods
               //there is at most 1 micro flow during one sample period
                 msg[ COL.SESSION_ID ] = ts ;
                 //msg[ COL.APP_PATH   ] = "99";  //ethernet
                 //msg[ COL.APP_ID     ] = 99;  //ethernet
                 msg[ COL.IP_SRC    ] = MICRO_FLOW_STR ;
                 msg[ COL.IP_DST    ] = MICRO_FLOW_STR ;
                 msg[ COL.MAC_SRC   ] = MICRO_FLOW_STR ;
                 msg[ COL.MAC_DST   ] = MICRO_FLOW_STR ;
            }else
               //as 2 threads may produce a same session_ID for 2 different sessions
               //this ensures that session_id is uniqueelse
               msg[ COL.SESSION_ID ] = msg[ COL.SESSION_ID ] + "-" + msg[ COL.THREAD_NUMBER ];
            
            
            
            //session
            if( format === 100 ){
               //console.log( msg[ COL.UL_RETRANSMISSION ] )

               //this should not happen
               //if( msg[ COL.UL_RETRANSMISSION ] > DOUBLE_STAT_PERIOD_IN_MS )
               //	msg[ COL.UL_RETRANSMISSION ] = 0;

               //HTTP
               switch( msg[ COL.FORMAT_TYPE ] ){
                  case MMTDrop.CsvFormat.GTP_APP_FORMAT:
                     //clone a new message to add to gtp
                     var gtp_msg = dataAdaptor.formatReportItem( message );
                     
                     //get information of UE from its IP
                     enodeb.appendSuplementDataGtp( gtp_msg, function( m ){
                        self.dataCache.gtp.addMessage( m );
                     });

                     break;
                     
                  case MMTDrop.CsvFormat.WEB_APP_FORMAT: 
                     //each HTTP report is a unique session (1 request - 1 resp if it has)

                     msg[ COL.SESSION_ID ] = msg[ COL.SESSION_ID ] + "-" + msg[ HTTP.TRANSACTIONS_COUNT ];
                     //mmt-probe: HTTP.TRANSACTIONS_COUNT: number of request/response per one TCP session

                     //same as ACTIVE_FLOWS
                     //mmt-operator: sum = number of req/res per 5 seconds
                     msg[ HTTP.TRANSACTIONS_COUNT ] = 1;//one msg is a report of a transaction

                     //HTTP data is not yet completely transfered
                     //if( msg[ HTTP.REQUEST_INDICATOR ] === 0 ){
                     //this msg reports a part of HTTP transaction
                     //==> we reset its RESPONSE_TIME to zero as it was reported
                     //msg[ HTTP.RESPONSE_TIME ] = 0;
                     break;
               }

               //add data to a link between 2 IPs
               //to easy distinguish 2 links, we identify a link by lower_IP_number + "-" + higher_IP_number
               if( ! is_micro_flow && (self.dataCache.link || self.dataCache.ip )){
                  //traffic of local IP
                  //do not add report 99 to data_ip collection as it has no IP
                  msg.ip_src  = IP.string2NumberV4( msg[COL.IP_SRC]  );
                  msg.ip_dst  = IP.string2NumberV4( msg[COL.IP_DST]  );
                  
                  msg.ip = msg.ip_src;
                  
                  if( self.dataCache.ip )
                     self.dataCache.ip.addMessage( msg );

                  //SENDATE: this is used only when SLA is active
                  if( config.isSLA ){
                     msg.slices = [];
                     const components = config.sla.init_components;
                     components.forEach( function( com ){
                        const ipRanges = com["ip-ranges"];
                        //if exists an ip range that contains either IP_SRC or IP_DST 
                        // =>  add the component ID as concerning Slice
                        if( ipRanges.some( function( val ){
                           const subnet = ipLib.subnet( val.ip, val.mask );
                           return subnet.contains( msg[COL.IP_SRC] ) || subnet.contains( msg[COL.IP_DST] );
                        }))
                           msg.slices.push( com.id );
                     });
                  }
                  
                  /////////////////////////////////////////////////////////////
                  //symetric link between 2 IPs
                  if(  msg.ip_src <  msg.ip_dst ){
                     msg.link = msg.ip_src + "," + msg.ip_dst;
                     if( self.dataCache.link )
                        self.dataCache.link.addMessage( msg );
                  }else{
                     msg.link = msg.ip_dst + "," + msg.ip_src;
                     msg = dataAdaptor.inverseStatDirection( msg );
                     if( self.dataCache.link )
                        self.dataCache.link.addMessage( msg );
                     
                     //revert to normal
                     msg = dataAdaptor.inverseStatDirection( msg );
                  }
                  /////////////////////////////////////////////////////////////
               }
               
               //destination location
               if( self.dataCache.location )
                  self.dataCache.location.addMessage( msg );
            }

            if( self.dataCache.mac )
               self.dataCache.mac.addMessage( msg );

            ///////////////////////////////////////////////////////////////
            //expand application path: 
            const app_arr = flatAppPath( msg[ COL.APP_PATH ] );

            
            if( self.dataCache.sctp ){
               //Collection contains only info about SCTP proto for eNodeB
               for( var i=0; i<app_arr.length; i++ )
                  if( app_arr[i].app == 304 ){ //SCTP
                   //clone a new message to add to gtp
                     var sctp_msg = dataAdaptor.formatReportItem( message );
                     
                     //get information of UE from its IP
                     enodeb.appendSuplementDataSctp( sctp_msg, self.dataCache.sctp.addMessage );
                     break;
                  }
            }
            
            //add to protocols collections
            if( self.dataCache.protocol ){
               const original_app_id = msg[ COL.APP_ID ],
               original_path   = msg[ COL.APP_PATH ];
               
               for( var i=0; i<app_arr.length; i++ ){
                  var o = app_arr[i];
                  
                  if( o.depth > 4 )
                     continue; //store only maximally 4 level: ETH.IP.TCP.HTTP
                  
                  if( !
                        (o.depth   === 4  //store only maximally 4 level: ETH.IP.TCP.HTTP
                        || o.depth === 1 //Ethernet
                        || o.depth === app_arr.length //in case, hierarchy length < 4
                        ) )
                        continue;
                  
                  //this is a protocol
                  if( PURE_PROTOCOLS[ o.app ] )
                  {
                     //save msg with the new app_id and its path
                     msg[ COL.APP_ID ]   = o.app;
                     msg[ COL.APP_PATH ] = o.path;
                     msg.proto_depth     = o.depth;
                     self.dataCache.protocol.addMessage( msg );
                  }
               }

               //no need
               //delete( msg.proto_depth );
               //restore original app_id and its path
               msg[ COL.APP_ID ]   = original_app_id;
               msg[ COL.APP_PATH]  = original_path;
            }
            /////

            msg.app_paths = app_arr;
            
            if( self.dataCache.app )
               self.dataCache.app.addMessage( msg );
            ///////////////////////////////////////////////////////////////

            
            //self.dataCache.detail.addMessage(  msg );
            if( !is_micro_flow ){
               

               //each session
               if( self.dataCache.session )
                  self.dataCache.session.addMessage( msg );
               
               
               //add traffic for the other side (src <--> dest )
               msg.isGen = true;
               msg = dataAdaptor.inverseStatDirection( msg );

               //change session_id of this clone message
               msg[ COL.SESSION_ID ] = "-" + msg[ COL.SESSION_ID ];

               if( self.dataCache.mac )
                  self.dataCache.mac.addMessage( msg );

               //only if its partner is local
               //if( ip2loc.isLocal( msg[ COL.IP_SRC ] )){
               if(  self.dataCache.ip && format === 100 && msg[ COL.SRC_LOCATION ]  === "_local" ){
                  //do not add report 99 to data_ip collection as it has no IP
                  msg.ip  = msg.ip_dst;
                  self.dataCache.ip.addMessage( msg );
               }
            }
            return;
      }
   };
   
   
   self.flush = function( cb ){
      var cacheCount = 0;
      for( var c in self.dataCache )
         cacheCount ++;

      //console.info("Flush " + cacheCount + " caches to DB ....");

      //this function ensures that the "cb" is called only when all caches are flushed
      const callback = function(){
         cacheCount --;
         if( cacheCount <= 0 )
            return cb();
      };

      //flush all caches in dataCache
      for( var c in self.dataCache ){
         self.dataCache[ c ].flush( callback );
      }
   };

};