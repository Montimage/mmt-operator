const config  = require("../config.json");
const ip2loc  = require("./ip2loc");
const dataIndex = require("./shared/dataIndex");
  const MMTDrop = {
         /**
          * Get Category ID of an application
          * @param {number} appId - application Id
          * @returns {number} - category Id
          */
         getCategoryIdFromAppId : function( appId ){
            const cat = this._cacheCategoryIdFromAppId[ appId ];
            if( cat == undefined )
               return 10; //network
            return cat;
         },
         /**
          * Return the parent of the given protocol path. <br>
          * ("1.2" is the parent of "1.2.3"; "." is the parent of "1")
          * @param path application protocol path
          */
         getParentPath : function(path) {
            var n = path.lastIndexOf(".");
            if (n == -1) {
               return ".";
            } else {
               var p = path.substring(0, n);
               return p;
            }
         },

         /**
          * Return the child of the given protocol path. <br>
          * ("2.3" is the child of "1.2.3"; "." is the child of "1")
          * @param path application protocol path
          */
         getChildPath : function(path) {
            var n = path.indexOf(".");
            if (n == -1) {
               return ".";
            } else {
               var child = path.substring(n + 1, path.toString().length);
               return child;
            }
         },

         /**
          * Returns the root application id given the application path.
          * @param {Object} path application protocol path
          */
         getRootAppId : function(path) {
            var n = path.toString().indexOf(".");
            if (n == -1) {
               return path;
            } else {
               return path.toString().substring(0, n);
            }
         },

         getAppLevelFromPath : function( path ){
            //number of occurences of dot character
            return (path.match(/\./g)||[]).length;
            /*
        var count = 0;
        for( var j=0; j<path.length; j++){
            if( path[ j ] === '.') count ++;
        }
        return count;
             */
         },

         /**
          * Return the path friendly name. <br>
          * @param path application protocol path (given by application IDs)
          */
         getPathFriendlyName : function(path) {
            var root = MMTDrop.getRootAppId(path);
            var friendlyName = MMTDrop.ProtocolsIDName[root];
            var child = MMTDrop.getChildPath(path);
            while(root != path && child != "." && root != "" && root != ".") {
               root = MMTDrop.getRootAppId(child);
               child = MMTDrop.getChildPath(child);
               friendlyName = friendlyName + '.' + MMTDrop.ProtocolsIDName[root];
            }
            return friendlyName;
         },

         /**
          * Returns the application id given the application path.
          * @param {Object} path application protocol path
          */
         getAppIdFromPath : function(path) {
            var n = path.lastIndexOf(".");
            return parseInt( path.substring(n + 1, path.length) );
         },

         /**
          * Returns the application name given the application path.
          * @param {Object} path application protocol path
          */
         getAppName : function(path) {
            var n = path.toString().lastIndexOf(".");
            return MMTDrop.ProtocolsIDName[path.toString().substring(n + 1, path.toString().length)];
         },

         /**
          * Returns the parent application name given the application path. <br>
          * If the application parent does not exist (path equal to root application), -1 is returned.
          * @param {Object} path
          */
         getParentApp : function(path) {
            var parent = this.getParentPath(path);
            if (parent == ".")
               return -1;
            return this.getAppId(parent);
         },

         /**
          * Returns the protocol path from the given statistics report entry
          * @param {Object} entry statistics report entry
          */
         getEntryPath : function(entry) {
            return entry[MMTDrop.StatsColumnId.APP_PATH];
         },

         /**
          * Maps the Protocol ID to a Protocol Name
          * @param {number} id
          * @returns {string} Protocol Name
          */
         getProtocolNameFromID : function(id) {
            var protocolName;
            protocolName = ( id in MMTDrop.ProtocolsIDName) ? MMTDrop.ProtocolsIDName[id] : 'NaP';
            return protocolName;
         },

         /**
          * Maps the Protocol Name to a Protocol ID
          * @param {string} protocolName
          * @returns {number} id
          */
         getProtocolIDFromName : function(protocolName) {
            var protocolID;
            protocolID = ( protocolName in MMTDrop.ProtocolsNameID) ? MMTDrop.ProtocolsNameID[protocolName] : 'NaP';
            return protocolID;
         },


         _swap: function(msg, id_1, id_2 ){
            var tmp   = msg[id_1];
            msg[id_1] = msg[id_2];
            msg[id_2] = tmp;
         },
         

         inverseStatDirection: function( msg ){
            var COL       = this.StatsColumnId;
            this._swap( msg, COL.IP_SRC  ,          COL.IP_DST );
            this._swap( msg, COL.MAC_SRC ,          COL.MAC_DST );
            this._swap( msg, COL.PORT_SRC,          COL.PORT_DST );
            this._swap( msg, COL.UL_DATA_VOLUME ,   COL.DL_DATA_VOLUME );
            this._swap( msg, COL.UL_PACKET_COUNT,   COL.DL_PACKET_COUNT );
            this._swap( msg, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME);
            this._swap( msg, COL.SRC_LOCATION,      COL.DST_LOCATION );
            
            this._swap( msg, COL.RTT_MIN_SERVER,    COL.RTT_MIN_CLIENT );
            this._swap( msg, COL.RTT_MAX_SERVER,    COL.RTT_MAX_CLIENT );
            this._swap( msg, COL.RTT_AVG_SERVER,    COL.RTT_AVG_CLIENT );
            this._swap( msg, COL.UL_RETRANSMISSION, COL.DL_RETRANSMISSION );
            
            
            //switch also IPs in GTP reports
            const isGTP = ( msg[ MMTDrop.StatsColumnId.FORMAT_TYPE ] === MMTDrop.CsvFormat.GTP_APP_FORMAT )
            if( isGTP ){
               const GTP = MMTDrop.GtpStatsColumnId;
               MMTDrop._swap( msg, GTP.IP_SRC, GTP.IP_DST);
               const teids = msg[ GTP.TEIDs ];
               
               if( teids.length === 2 )
                  MMTDrop._swap( teids, 0, 1 ); //[a,b] => [b,a]
            }

            
            return msg;
         },


   };

// array => object
   MMTDrop.formatReportItem = function(entry) {
//    switch( entry[0] ) {
//    case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
//    break;
//    case MMTDrop.CsvFormat.WEB_APP_FORMAT :
//    break;
//    case MMTDrop.CsvFormat.SSL_APP_FORMAT :
//    break;
//    case MMTDrop.CsvFormat.RTP_APP_FORMAT :
//    break;
//    case MMTDrop.CsvFormat.SESSION_STATS_FORMAT :
//    break;
//    case MMTDrop.CsvFormat.SECURITY_FORMAT:
//    break;
//    case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
//    case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
//    case MMTDrop.CsvFormat.LICENSE:
//    case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : //TODO
//    case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : //TODO
//    }

      //*
      var obj = {};
      for( var i=0; i<entry.length; i++ ){
         if( entry[i] != null )
            obj[ i ] = entry[ i ];
      }

      return obj;
      //*/
      //return Object.assign({}, entry );
   };

// object => array
   MMTDrop.reverseFormatReportItem = function(entry) {
      /*
      switch( entry[0] ) {
         case MMTDrop.CsvFormat.DEFAULT_APP_FORMAT :
            break;
         case MMTDrop.CsvFormat.WEB_APP_FORMAT :
            break;
         case MMTDrop.CsvFormat.SSL_APP_FORMAT :
            break;
         case MMTDrop.CsvFormat.RTP_APP_FORMAT :
            break;
         case MMTDrop.CsvFormat.SESSION_STATS_FORMAT :
            break;
         case MMTDrop.CsvFormat.SECURITY_FORMAT:
            //no need since mmt-security v 1.2.8
            //entry[ MMTDrop.SecurityColumnId.HISTORY ] = JSON.parse( entry[ MMTDrop.SecurityColumnId.HISTORY ] );
            break;
         case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
         case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
         case MMTDrop.CsvFormat.LICENSE:
         case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT : //TODO
         case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT : //TODO
      }
      */

      var arr = [];
      //faster
      const MAX = dataIndex.MAX_COL_INDEX;
      for( var i=0; i<MAX; i++ )
         if( entry[ i ] != undefined )
            arr[ i ] = entry[ i ];

      /*
    for( var i in entry )
      arr[ parseInt( i ) ] = entry[ i ];
       */
      return arr;
   };

   MMTDrop.formatSessionReport = function ( msg ){
      var PATH_INDEX = MMTDrop.StatsColumnId.APP_PATH;
      var UP_PATH = msg[ PATH_INDEX ], DOWN_PATH = msg[ PATH_INDEX + 1 ];
      /**
       * in the probe version 98f750c, on May 03 2016
       * report id = 100 has 2 protocol path: one for uplink, one for down link
       * this function will return a report (as before) which takes the app_path as the longest one:
       */
      //remove one path: UP_PATH, retain DOWN_PATH
      msg.splice( PATH_INDEX, 1 );

      //retain the path having more information
      //not really relevance
      if( MMTDrop.getAppLevelFromPath( UP_PATH ) > MMTDrop.getAppLevelFromPath( DOWN_PATH ))
         msg[ PATH_INDEX ] = UP_PATH;

      var isGTP = false;
      var format_type = msg[ MMTDrop.StatsColumnId.FORMAT_TYPE ];
      
      var _start = 0, _end = 0 ;
      switch (format_type) {
         case MMTDrop.CsvFormat.WEB_APP_FORMAT:
            _start = MMTDrop.HttpStatsColumnId.APP_FAMILY;
            _end   = MMTDrop.HttpStatsColumnId.REQUEST_INDICATOR;
            break;
         case MMTDrop.CsvFormat.SSL_APP_FORMAT:
            _start = MMTDrop.TlsStatsColumnId.APP_FAMILY;
            _end   = MMTDrop.TlsStatsColumnId.CDN_FLAG;
            break;
         case MMTDrop.CsvFormat.RTP_APP_FORMAT:
            _start = MMTDrop.RtpStatsColumnId.APP_FAMILY;
            _end   = MMTDrop.RtpStatsColumnId.ORDER_ERROR;
            break;
         case MMTDrop.CsvFormat.FTP_APP_FORMAT:
            _start = MMTDrop.FtpStatsColumnId.APP_FAMILY;
            _end   = MMTDrop.FtpStatsColumnId.RESPONSE_TIME;
            break;
         case MMTDrop.CsvFormat.GTP_APP_FORMAT:
            _start = MMTDrop.GtpStatsColumnId.APP_FAMILY;
            _end   = MMTDrop.GtpStatsColumnId.MME_NAME;
            isGTP = true;
            break;
         default:
            return msg;
      }
      //APP_FAMILY: starting index of  each types HTTP/SSL/TLS/FTP
      var _new = _start - (MMTDrop.StatsColumnId.FORMAT_TYPE + 1),
      new_msg = {};//clone: avoid being overrided

      for( var i=(MMTDrop.StatsColumnId.FORMAT_TYPE + 1); i<_start; i++){
         new_msg[ i ] = msg[ i ];
         delete( msg[ i ] );
      }

      for( var i=_start; i<=_end; i++ ){
         //starting: i=50 (HTTP), i=70 (TLS), i=80 (RTP), i=90 (FTP)
         msg[ i ] = new_msg[ i - _new ];
      }
      
      if( isGTP ){
         
      }
      
      if( ip2loc.isLocal( msg[MMTDrop.StatsColumnId.IP_SRC] ) ){
         msg[ MMTDrop.StatsColumnId.IP_SRC_INIT_CONNECTION ] = true;
         return msg;
      }
      
      msg[ MMTDrop.StatsColumnId.IP_SRC_INIT_CONNECTION ] = false;
      msg = MMTDrop.inverseStatDirection( msg );
           
      return msg;
   };
   
   /**
    * Convert a message in string format to an array
    * @param {[[Type]]} message [[Description]]
    */

// const _total = {};
   MMTDrop.formatMessage = function( message ){
      var msg = JSON.parse( message );

//    var t = Math.floor( msg[3] );
//    if( msg[0] == 100 ){
//    if( _total[ t ] == undefined ){
//    console.error( _total );
//    _total[ t ] = 0;
//    }
//    _total[ t ] ++;
//    }

      //timestamp
      //msg[ 3 ] = formatTime( msg[3] );
      const timestamp = msg[3];
      msg[ 3 ] = Math.round( msg[3] / config.probe_stats_period ) * config.probe_stats_period * 1000;

      //format
      switch( msg[0] ) {
         //main report
         case MMTDrop.CsvFormat.SESSION_STATS_FORMAT :
            msg = MMTDrop.formatSessionReport( msg ); 

            msg[ MMTDrop.StatsColumnId.START_TIME ]   = msg[ MMTDrop.StatsColumnId.START_TIME ] * 1000; //to milisecond
            
            //TODO: comment the 2 lines below to increase performance in case of high bandwidth
            msg[ MMTDrop.StatsColumnId.SRC_LOCATION ] = ip2loc.country( msg[ MMTDrop.StatsColumnId.IP_SRC ] );
            msg[ MMTDrop.StatsColumnId.DST_LOCATION ] = ip2loc.country( msg[ MMTDrop.StatsColumnId.IP_DST ] );
            
            //continue in NO_SESSION_STATS_FORMAT
         case MMTDrop.CsvFormat.NO_SESSION_STATS_FORMAT:
            msg[ MMTDrop.StatsColumnId.PROFILE_ID ]   = MMTDrop.getCategoryIdFromAppId( msg[ MMTDrop.StatsColumnId.APP_ID ] );
            break;
         case MMTDrop.CsvFormat.SECURITY_FORMAT:
            //no need since mmt-security v 1.2.8
            //msg[ MMTDrop.SecurityColumnId.HISTORY ] = JSON.stringify( msg[ MMTDrop.SecurityColumnId.HISTORY ] );
            break;
         case MMTDrop.CsvFormat.BA_BANDWIDTH_FORMAT:
            if( msg[ MMTDrop.BehaviourBandwidthColumnId.VERDICT ] === "NO_CHANGE_BANDWIDTH" 
               || msg[ MMTDrop.BehaviourBandwidthColumnId.BW_BEFORE ] === msg[ MMTDrop.BehaviourBandwidthColumnId.BW_AFTER ] 
               || msg[ MMTDrop.BehaviourBandwidthColumnId.IP ] === "undefined" ){
               return null;
            }
            break;
         case MMTDrop.CsvFormat.BA_PROFILE_FORMAT:
            //ip
            if( msg[ MMTDrop.BehaviourProfileColumnId.VERDICT ] === "NO_CHANGE_CATEGORY"
               //|| msg[ MMTDrop.BehaviourProfileColumnId.VERDICT ] === "NO_ACTIVITY_BEFORE"
               || msg[ MMTDrop.BehaviourProfileColumnId.IP ]      === "undefined" ){
               return null;
               //console.log( MMTDrop.formatReportItem( msg ) );
            }
            break;
         case MMTDrop.CsvFormat.LICENSE:
            msg[ MMTDrop.LicenseColumnId.EXPIRY_DATE ] = msg[ MMTDrop.LicenseColumnId.EXPIRY_DATE ] * 1000;//to milisecond
            break;

         case MMTDrop.CsvFormat.SYS_STAT_FORMAT:
            msg[ MMTDrop.StatColumnId.COUNT ] = 1;
            break;
//          case MMTDrop.CsvFormat.NDN_FORMAT :
//          break;
            //MUSA project, availability message
//          case 50:
//          //console.log( msg );
//          break;
//          case MMTDrop.CsvFormat.MICROFLOWS_STATS_FORMAT :
//          case MMTDrop.CsvFormat.RADIUS_REPORT_FORMAT :
//          default :
         case MMTDrop.CsvFormat.LTE_TOPOLOGY_REPORT:
            msg[ 3 ] = timestamp*1000; //=> change to miliseconds
      }
      return msg;
   }

// merge dataIndex to MMTDrop to maintain the utilisaion of MMTDrop for the parts moved to dataIndex
   for( var key in dataIndex )
      if( MMTDrop[key] != undefined )
         console.error("Need to solve the conflict of key["+ key +"] of MMTDrop");
      else
         MMTDrop[key] = dataIndex[key];


// cache of category
   MMTDrop._cacheCategoryIdFromAppId = {};
   for (var catID in MMTDrop.CategoriesAppIdsMap){
      var arr = MMTDrop.CategoriesAppIdsMap[ catID ];
      for( var i=0; i<arr.length; i++ ){
         var appID = arr[i];
         if( MMTDrop._cacheCategoryIdFromAppId[ appID ] != undefined )
            console.warn("Double category for appID = " + appID );
         else
            MMTDrop._cacheCategoryIdFromAppId[ appID ] = parseInt( catID );
      }
   }
// end cache of category
   
//reserved name => id
   MMTDrop.ProtocolsNameID = {};
   for( var protoID in MMTDrop.ProtocolsIDName ){
      var protoName = MMTDrop.ProtocolsIDName[ protoID ];
      MMTDrop.ProtocolsNameID[ protoName ] = parseInt( protoID );
   }
   
   //set of protocolID => protocolName
   MMTDrop.PureProtocolsIDName = {};
   MMTDrop.PureProtocols.forEach( (e) => MMTDrop.PureProtocolsIDName[e] = MMTDrop.ProtocolsIDName[ protoID ] )
   
   
module.exports = MMTDrop;
