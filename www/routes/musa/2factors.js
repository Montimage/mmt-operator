const request = require('request');
const nativeKafka  = require('kafka-node');

//TODO: to update when upload to musa server
const HOST_NAME  = "http://assurance-platform.musa-project.eu/operator";
const KAFKA_HOST = "37.48.247.117:2181"

const oldData = {};

String.prototype.regex = function( regex, index ){
   
   var ret = regex.exec( this );
   if( ret == undefined || ret.length == 0 )
      return null;
   if( index == undefined )
      index = 1;
   return ret[index];
}

function receiveMessage (message) {
   //console.log( message );
   if( message == undefined )
      return;
   message = message.value;
   
   //not found user johnd
   if( message.indexOf( "johnd" ) == -1 )
      return;
   
   var date = message.regex(/EVENT_TIMESTAMP = (.+)\n/);
   //not found date
   if( date == undefined )
      return;
   date = new Date( date );

   //console.log( message );
   
   var clientIP = message.regex(/ip-address(\u001a|\u0014)((\d|\.)+)/, 2);
   //not found client IP
   if( clientIP == undefined )
      return;
   
   //console.log( clientIP );
   
   //the first time?
   if( oldData.date == undefined ){
      oldData.date      = date;
      oldData.clientIP  = clientIP;
      return;
   }
   
   //detect different IP
   //login from 2 different IPs
   if( oldData.clientIP == clientIP ){
      oldData.date = date;
      console.log( "client IP: " + clientIP + ", date: " + date.toString() );
      return;
   }
   
   //login from 2 different IPs in a small interval
   var timeDiff   = Math.abs(oldData.date.getTime() - date.getTime());
   var minuteDiff = timeDiff / 1000 / 60;
   
   //raise alert
   if( minuteDiff < 5 ){
      console.log( "Detected violation for 2factors authentication" );
      const requestOptions = {};
      //call this dummy url to generate alerts/violations
      request( HOST_NAME  + "/musa/dummy/violation/authentication", requestOptions, function (error, response, body) {
         if( error )
            console.error( error );
         console.log( body );
      })
   }
   
   oldData.date      = date;
   oldData.clientIP  = clientIP;
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
      new nativeKafka.Client( KAFKA_HOST ),
      [],
      {
         //consumer group id, default `kafka-node-group`
         groupId: 'SecAP-kafka-client', 
         // Auto commit config 
         //TODO: reset to true
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
         fromOffset: -1, // "latest",
         // If set to 'buffer', values will be returned as raw buffer objects. 
         encoding: 'utf8',
         keyEncoding: 'utf8'
      }
   );
   
   const topicsArr = [
     //"musa-demo-securityCommandResponses",
     //"musa-demo-basedataModelUpdates",
     //"musa-demo-fleetCommandResponses",
     //"musa-demo-fleetModelUpdates",
     //"musa-demo-securityModelUpdates",
     //"musa-demo-airlineModelUpdates",
     //"musa-demo-basedataCommandResponses",
     "musa-demo-events", //focus only on this 
     //"musa-demo-airlineCommandResponses"
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

//start(1);
