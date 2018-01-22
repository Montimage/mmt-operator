const request = require('request');
const nativeKafka  = require('kafka-node');

//TODO: to update when upload to musa server
const HOST_NAME  = "http://assurance-platform.musa-project.eu/operator";
const KAFKA_HOST = "37.48.247.117:2181"
//const KAFKA_HOST = "localhost:2181"
const USER_TO_MONITOR = "dummy1";

const oldData = {};
//global variable for this module
var dbconnector = null;

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
   
   //is a login message?
   if( message.indexOf( "CONTENT_TYPE = security-login_v2" ) == -1 )
      return;
   
   var user = message.regex(/SECURITY_IDENTITY = (.+)\n/);
   //console.log( user );
   
   var date = message.regex(/EVENT_TIMESTAMP = (.+)\n/);
   //not found date
   if( date == undefined )
      return;
   
   //console.log( date );
   
   date = new Date( date );

   //console.log( JSON.stringify(message ));
   
   
   var clientIP  = message.regex(/ip-address(\u001a|\u0014|\u001c)((\d|\.)+)/, 2);
   if( clientIP == null )
      clientIP  = message.regex(/forwarded-for((\d|\.)+)/, 1);
   
   var userAgent = message.regex(/user-agent(.+)\u0000/, 1)
   
   //not found client IP
   if( userAgent == undefined )
      return;
   
   
   const obj = {user: user, ts: date.getTime(), ip: clientIP, ua: userAgent};
   console.log( obj );
   //save to DB
   if( dbconnector == null )
      console.error( "Database is not ready" );
   else{
      
      dbconnector._updateDB( "metrics_authentication", "insert", obj, function( err, data ){
         if( err )
            console.error( err );
      });
   }
   
   //console.log( clientIP );
   //not found user
   if( message.indexOf( USER_TO_MONITOR ) == -1 )
      return;
   
   //the first time?
   if( oldData.date == undefined ){
      oldData.date      = date;
      oldData.userAgent = userAgent;
      return;
   }
   
   //detect different IP
   //login from 2 different IPs
   if( oldData.userAgent == userAgent ){
      oldData.date = date;
      console.log( "- client IP: " + userAgent + "\n- date: " + date.toString() );
      return;
   }
   
   //login from 2 different IPs in a small interval
   var timeDiff   = Math.abs(oldData.date.getTime() - date.getTime());
   
   //raise alert
   if( timeDiff < 5*60*1000 ){
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
   oldData.userAgent = userAgent;
}

function _startKafkaConsumer(){
   console.log("Start 2factors authentication detector");
   
   const consumer = new nativeKafka.Consumer(
      //LHS server is temporally 
      new nativeKafka.Client( KAFKA_HOST ),
      [
         {topic: "musa-demo-events"}
      ],
      {
         //consumer group id, default `kafka-node-group`
         groupId: 'SecAP-kafka', 
         // Auto commit config 
         //TODO: reset to true
         //autoCommit: false,
         autoCommit: true,
         autoCommitIntervalMs: 500,
         // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms 
         fetchMaxWaitMs: 100,
         // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte 
         fetchMinBytes: 1,
         // The maximum bytes to include in the message set for this partition. This helps bound the size of the response. 
         fetchMaxBytes: 1024 * 1024,
         // If set true, consumer will fetch message from the given offset in the payloads 
         fromOffset: false,
         //fromOffset: "latest",
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
      {
         topic: "musa-demo-events", //focus only on this
         offset: "latest"//-2 //208
      }
     //"musa-demo-airlineCommandResponses"
   ]
  /* 
   consumer.addTopics( topicsArr, function( err, added){
      console.log( "subscribed ", added );
      if( err )
         console.error( err );
   }, true );
   */
   //consumer.setOffset('topic', 0, 0);
   
   consumer.on( "message",          receiveMessage );
   consumer.on( "error",            console.error );
   consumer.on( "offsetOutOfRange", console.error );
   //consumer.commit( console.error );
}

function start( pub_sub, _dbconnector ){
   //donot check if redis/kafka is not using
   if( pub_sub == undefined ){
      console.error("This works only for kafka/redis bus");
      process.exit( 1 );
      return;
   }
   
   //when db is ready
   _dbconnector.onReady( function(){
      console.log("DBConnector is ready for 2factors");
      dbconnector = _dbconnector;
      _startKafkaConsumer();
   });
   
}

function reset(){

}

module.exports = {
      start: start,
      reset: reset
}

//_startKafkaConsumer();
