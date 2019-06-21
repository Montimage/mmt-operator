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
   //mongoDB aggregate
   const group = { _id : {} };

   [ COL.TIMESTAMP ].forEach( function( el, index){
      group["_id"][ el ] = "$" + el;
   });
   
   //sum
   [ COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
      COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT,
      COL.ACTIVE_FLOWS,
      COL.DL_RETRANSMISSION, COL.UL_RETRANSMISSION,
      //COL.HANDSHAKE_TIME, COL.APP_RESPONSE_TIME, 
      COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
      ].forEach( function( el, index){
         group[ el ] = {"$sum" : "$" + el};
      });
   
   [ COL.TIMESTAMP ].forEach( function( el, index){
      group[ el ] = {"$last" : "$"+ el};
   } );

   const $match = {};
   //timestamp
   $match[ COL.TIMESTAMP ] = {$gte: startTime, $lte: endTime };
   //only IP (session report)
   $match[ COL.FORMAT_ID ] = dataAdaptor.CsvFormat.STATS_FORMAT;
   $match.isGen  = false;
   //only on TCP: ETH.VLAN?.IP?.*.TCP
   $match[ COL.APP_PATH ] = APP_PATH_REGEX;

   //load data corresponding to the selected app
   if( param.probe != undefined )
      $match[ COL.PROBE_ID ] = parseInt( param.probe );
   if( param.app )
      $match[ COL.APP_ID] = dataAdaptor.getProtocolIDFromName( param.app );
   if( param.ip )
      $match[ COL.IP_SRC] = param.ip;

   const project = {"_id": 0};

   const query = [{"$match": $match},{"$group" : group}, {"$project": project}];
   
   dbconnector.queryDB( "data_session_" + periodName, "aggregate", query, function( err, data ){
      if( err || data == null )
         return cb( err );
      
      function percentage( x, y ){
         if( y == 0 )
            return 0;
         //get percentage
         x = (x*100/y);
         //round to 2 numbers after ., e.g., 10.xx
         return Math.round( x * 100 )/100;
      }
      
      //data processing
      data.map( (el) => {
         el[ COL.RTT_AVG_CLIENT ] = percentage( el[ COL.RTT_AVG_CLIENT ]/100, el[ COL.ACTIVE_FLOWS ]);
         el[ COL.RTT_AVG_SERVER ] = percentage( el[ COL.RTT_AVG_SERVER ]/100, el[ COL.ACTIVE_FLOWS ]);
         //packet error lost rate: number packet erros / total packet
         el[ COL.DL_RETRANSMISSION ] = percentage( el[ COL.DL_RETRANSMISSION ], el[ COL.DL_PACKET_COUNT ] );
         el[ COL.UL_RETRANSMISSION ] = percentage( el[ COL.UL_RETRANSMISSION ], el[ COL.UL_PACKET_COUNT ] );
      });
      
      cb( err, data );
   }, false);
}