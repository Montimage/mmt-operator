const kafka  = require('kafka-node');
const kafkaConnectionString="kafka:9092";

var client = new kafka.KafkaClient({
   kafkaHost: kafkaConnectionString, 
});

const consumer = new kafka.Consumer(
   client,
   [],
   {
      //consumer group id, default `kafka-node-group`
      groupId: 'group-mmt-operator-consumer', 
      // Auto commit config 
      autoCommit: true,
      autoCommitIntervalMs: 500,
      // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms 
      fetchMaxWaitMs: 100,
      // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte 
      fetchMinBytes: 1,
      // The maximum bytes to include in the message set for this partition. This helps bound the size of the response. 
      fetchMaxBytes: 1024 * 1024,
      // If set true, consumer will fetch message from the given offset in the payloads 
      //fromOffset: false,
      fromOffset: "latest",
      // If set to 'buffer', values will be returned as raw buffer objects. 
      encoding: 'utf8',
      keyEncoding: 'utf8'
   }
)


//consumer.on("message", console.log);

const subscribe = function( channel ){
   console.log( "subscribe", channel );
   consumer.addTopics([channel], function( err, added ){
      if( err )
         console.warn( err.message );
      else
         console.log("subscribed", channel );
   });
};
