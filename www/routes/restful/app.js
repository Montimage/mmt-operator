const dataAdaptor = libRequire("dataAdaptor");
/**
 * Supported paramerts:
 * - param.format = 99/100
 * 
 * - param.probe = 1
 * - param.ip = 'x.x.x.x'
 */
module.exports = function( startTime, endTime, period, param, dbconnector, cb ){
   //select only TCP-based app
   const COL = dataAdaptor.StatsColumnId;
   //mongoDB aggregate
   const group = { _id : {} };

   [ COL.APP_ID ].forEach( function( el, index){
      group["_id"][ el ] = "$" + el;
   });
   
   [ COL.APP_PATH, COL.APP_ID ].forEach( function( el, index){
      group[ el ] = {"$last" : "$"+ el};
   } );

   const $match = {};
   //timestamp
   $match[ COL.TIMESTAMP ] = {$gte: startTime, $lte: endTime };
   $match.isGen  = false;

   //load data corresponding to the selected app
   if( param.probe != undefined )
      $match[ COL.PROBE_ID ] = parseInt( param.probe );

   if( param.ip )
      $match[ COL.IP_SRC] = param.ip;

   const project = {"_id": 0};

   const query = [{"$match": $match},{"$group" : group}, {"$project": project}];
   
   dbconnector.queryDB( "data_session_" + period, "aggregate", query, function( err, data ){
      if( err || data == null )
         return cb( err );
      //convert app id => name
      data.map( (el) => {
         el[ COL.APP_ID ]   = dataAdaptor.getProtocolNameFromID( el[ COL.APP_ID ] );
         el[ COL.APP_PATH ] = dataAdaptor.getPathFriendlyName( el[ COL.APP_PATH ] );
      });
      
      cb( err, data );
   }, false);
}