const dataAdaptor = libRequire("dataAdaptor");
/**
 * Supported paramerts:
 * - param.probe = 1
 * - param.ip = 'x.x.x.x'
 * - param.app = 'SSL'
 * - param.data = [] //array of ids to be sum up
 */
module.exports = function( startTime, endTime, periodName, param, dbconnector, cb ){
   //select only TCP-based app
   const APP_PATH_REGEX = {"$regex" : ".354.", "$options" : ""};
   const COL = dataAdaptor.StatsColumnId;
   const GTP = dataAdaptor.GtpStatsColumnId
   //mongoDB aggregate
   const group = { _id : {} };

   [ COL.TIMESTAMP ]
   .forEach( (el) =>  group._id[ el ] = "$" + el );
   
   //sum
   [ 
      COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
      COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
      COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
      
      COL.ACTIVE_FLOWS,
      
      COL.DL_RETRANSMISSION, COL.UL_RETRANSMISSION,
      //COL.HANDSHAKE_TIME, COL.APP_RESPONSE_TIME,
      
      COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
      GTP.EXPECTED_PELR_UL, GTP.EXPECTED_DELAY_UL,
      GTP.EXPECTED_PELR_DL, GTP.EXPECTED_DELAY_DL
   ]
      .forEach( ( el ) =>  group[ el ] = {"$sum" : "$" + el} );
   
   
   [ 
      COL.TIMESTAMP 
   ]
      .forEach( ( el ) => group[ el ] = {"$last" : "$"+ el} );
   

   const $match = {};
   //timestamp
   $match[ COL.TIMESTAMP ] = {$gte: startTime, $lte: endTime };
   
   //no need the 3 following conditions as they must be satisfied by data in data_gtp_* collections
   //only IP (session report)
   //$match[ COL.FORMAT_ID ] = dataAdaptor.CsvFormat.SESSION_STATS_FORMAT;
   //$match.isGen  = false;
   //only on TCP: ETH.VLAN?.IP?.*.TCP
   //$match[ COL.APP_PATH ] = APP_PATH_REGEX;

   //load data corresponding to the selected app
   if( param.probe != undefined )
      $match[ COL.PROBE_ID ] = parseInt( param.probe );
   if( param.app )
      $match[ COL.APP_ID] = dataAdaptor.getProtocolIDFromName( param.app );
   if( param.ip )
      $match[ COL.IP_SRC] = param.ip;

   const project = {"_id": 0};

   const query = [{"$match": $match},{"$group" : group}, {"$project": project}];
   
   dbconnector.queryDB( "data_gtp_" + periodName, "aggregate", query, function( err, data ){
      if( err || data == null )
         return cb( err );
      
      function _divide( x, y, round = 100 ){
         if( y === 0 )
            return 0;
         //get _divide
         x = (x/y);
         //round to 2 numbers after ., e.g., 10.xx
         return Math.round( x * round )/round;
      }
      
      const MICRO_TO_MILLI = 1000;
      
      //

      var defaultQCI = {delay: 300, pelr: 10e-6}; //qCI = 9
      
      
      //data processing
      data.map( (el) => {
         const flows = el[COL.ACTIVE_FLOWS] || 1;
         
         //RTT_CLIENT is the interval from data pkt to a client and its ack sent by the client
         // => divided by 2 to get time from data pkt to client
         el[ COL.RTT_AVG_CLIENT ] /= 2
         
         
         el[ COL.RTT_AVG_CLIENT ] = _divide( el[ COL.RTT_AVG_CLIENT ],  MICRO_TO_MILLI*flows); //microsecond to millisecond
         //as we cannot distinguish rtt of upload vs download => they are considered as the same
         el[ COL.RTT_AVG_SERVER ] = el[ COL.RTT_AVG_CLIENT ]; //_divide( el[ COL.RTT_AVG_CLIENT ] / 2,  MICRO_TO_MILLI * flows);
         
         
         //get expected values, if they are zero => use default ones
         el[ GTP.EXPECTED_DELAY_UL ] = _divide( el[ GTP.EXPECTED_DELAY_UL ], flows ) || defaultQCI.delay ; //these values are in millisecond
         el[ GTP.EXPECTED_DELAY_DL ] = _divide( el[ GTP.EXPECTED_DELAY_DL ], flows ) || defaultQCI.delay ;
        
         el[ GTP.EXPECTED_PELR_UL ]  = _divide( el[ GTP.EXPECTED_PELR_UL ], flows, 10000) || defaultQCI.pelr;
         el[ GTP.EXPECTED_PELR_DL ]  = _divide( el[ GTP.EXPECTED_PELR_DL ], flows, 10000) || defaultQCI.pelr;
         
         
         //packet error lost rate: number packet erros / total packet
         el[ COL.DL_RETRANSMISSION ] = _divide( el[ COL.DL_RETRANSMISSION ], el[ COL.DL_PACKET_COUNT ], 10000 );
         el[ COL.UL_RETRANSMISSION ] = _divide( el[ COL.UL_RETRANSMISSION ], el[ COL.UL_PACKET_COUNT ], 10000 );
      });
      
      cb( err, data );
   }, false);
};