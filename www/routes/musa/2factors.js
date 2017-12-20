const nativeKafka  = require('kafka-node');

function receiveMessage (message) {
   console.log( message );
}

function start( pub_sub ){
   //donot check if redis/kafka is not using
   if( pub_sub == undefined ){
      console.error("This works only for kafka/redis bus");
      process.exit( 1 );
      return;
   }
   
   const consumer = new nativeKafka.Consumer(
      //LHS server is temporally 
      new nativeKafka.Client( "localhost:2181" ),
      [],
      {
         //consumer group id, default `kafka-node-group`
         groupId: 'SecAP-kafka-client', 
         // Auto commit config 
         //TODO: reset to true
         autoCommit: false, //true,
         autoCommitIntervalMs: 500,
         // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms 
         fetchMaxWaitMs: 100,
         // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte 
         fetchMinBytes: 1,
         // The maximum bytes to include in the message set for this partition. This helps bound the size of the response. 
         fetchMaxBytes: 1024 * 1024,
         // If set true, consumer will fetch message from the given offset in the payloads 
         //fromOffset: false,
         fromOffset: -1, // "latest",
         // If set to 'buffer', values will be returned as raw buffer objects. 
         encoding: 'utf8',
         keyEncoding: 'utf8'
      }
   );
   
   const topicsArr = [
     "musa-demo-securityCommandResponses",
     "musa-demo-basedataModelUpdates",
     "musa-demo-fleetCommandResponses",
     "musa-demo-fleetModelUpdates",
     "musa-demo-securityModelUpdates",
     "musa-demo-airlineModelUpdates",
     "musa-demo-basedataCommandResponses",
     "musa-demo-events",
     "musa-demo-airlineCommandResponses"
   ]
   
   consumer.addTopics( topicsArr, function( err, removed){
      if( err )
         console.error( err );
   } );
   
   consumer.on( "message", receiveMessage );
   
}

function reset(){

}

module.exports = {
      start: start,
      reset: reset
}

start(1);