const dataAdaptor = libRequire("dataAdaptor");
/**
 * Supported paramerts:
 * - param.probe = 1
 * - param.ip = 'x.x.x.x'
 * - param.app = 'SSL'
 */
module.exports = function( startTime, endTime, period, param, dbconnector, cb ){
   //select only TCP-based app
   const APP_PATH_REGEX = {"$regex" : ".354.", "$options" : ""};
   const COL = dataAdaptor.StatsColumnId;
   //mongoDB aggregate
   const group = { _id : {} };

   [ COL.TIMESTAMP ].forEach( function( el, index){
      group["_id"][ el ] = "$" + el;
   });
   [ COL.DATA_VOLUME, COL.ACTIVE_FLOWS, COL.PACKET_COUNT, 
      COL.PAYLOAD_VOLUME,
      COL.DL_RETRANSMISSION, COL.UL_RETRANSMISSION,
      COL.HANDSHAKE_TIME, COL.APP_RESPONSE_TIME, COL.DATA_TRANSFER_TIME,
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
   
   dbconnector.queryDB( "data_session_" + period, "aggregate", query, cb, false);
}