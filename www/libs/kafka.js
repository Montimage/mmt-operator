//a wrapper of kafka
"use strict";

const fs     = require("fs");
const config = require("./config");
const tools  = require("./tools");
const kafka  = require('kafka-node');

const kafkaConnectionString = config.kafka_input.host + ":" + config.kafka_input.port;
const zkOptions = undefined;// {};
const noAckBatchOptions =  undefined;// {};
const sslOptions = {};

if( config.kafka_input["ssl.ca.location"] ){
   try{
      sslOptions.ca = fs.readFileSync( config.kafka_input["ssl.ca.location"] );
   }catch( err ){
      console.error( "Error while reading ssl.ca.location", err.message );
   }
   //donot verify hostname
   sslOptions.rejectUnauthorized = false;
}

/**
 * 
 * @param type either "producer", "consumer" or "both"
 * @returns
 */
function createClient( type, clientName  ){

   const isNeedConsumer = ( type != "producer" );
   const isNeedProducer = ( type != "consumer" );

   //name of kafka client
   if( clientName == undefined )
      clientName = "mmt-operator-" + tools.getTimestamp();
   else
      clientName = "mmt-operator-" + clientName;
   
   var client = new kafka.Client( 
         kafkaConnectionString, 
         clientName,
         zkOptions,
         noAckBatchOptions,
         sslOptions
   );
   
   const ret = { topics: [], clientName : clientName };
   
   
   function onError( err ){
      console.error("Kafka Error", err.message );
   }


   //1. consumer
   if( isNeedConsumer ){

      //create kafka client
      ret.consumer = new kafka.Consumer(
            client,
            [],
            {
               //consumer group id, default `kafka-node-group`
               groupId: 'kafka-node-group', 
               // Auto commit config 
               autoCommit: true,
               autoCommitIntervalMs: 5000,
               // The max wait time is the maximum amount of time in milliseconds to block waiting if insufficient data is available at the time the request is issued, default 100ms 
               fetchMaxWaitMs: 100,
               // This is the minimum number of bytes of messages that must be available to give a response, default 1 byte 
               fetchMinBytes: 1,
               // The maximum bytes to include in the message set for this partition. This helps bound the size of the response. 
               fetchMaxBytes: 1024 * 1024,
               // If set true, consumer will fetch message from the given offset in the payloads 
               fromOffset: false,
               // If set to 'buffer', values will be returned as raw buffer objects. 
               encoding: 'utf8',
               keyEncoding: 'utf8'
            }
      ),

      console.log("KafkaConsumer ["+ ret.clientName +"] is created !!!!" );


      /**
       * subscribe to a new channel
       * - channel: name of channel to subscribe
       * - cb     : callback( err, added )
       */
      ret.subscribe = function( channel ){
         console.log( "subscribe", channel );
         ret.consumer.addTopics([channel], function( err, added ){
            if( err )
               console.warn( err.message );
         });
      };


      //override "on" function
      ret.on = function( ev, cb ){
         if( ev === "message" )
            ret.consumer.on("message", function( msg ){
               //console.log( msg );
               cb( msg.topic, msg.value );
            });
         else
            ret.consumer.on( ev, cb );
      };
      
      //on error
      ret.consumer.on('error', onError );
   }

   //2. producer
   if( isNeedProducer ){
      ret.producer = new kafka.Producer( client );
      
      ret.producer._ready  = false;
      ret.producer._topics = [];
      ret.producer._data   = [];

      ret.producer.on("ready", function(){
         //create topics if they do not exist
         if( ret.topics.length > 0 ){
            ret.producer.createTopics( ret.topics, function( err, data){
               if( err )
                  console.error( err.message );
            });
         }

         ret.producer._ready = true;

         console.log("KafkaProducer ["+ ret.clientName +"] is ready !!!!", ret.producer._topics );

         //publish cache's data
         for( var i in ret.producer._data ){
            var o = ret.producer._data[i];
            ret.producer.send( o.data, o.cb );
         }
         //empty _cache
         ret.producer._data = null;
      }); 


      ret.publish = function( topic, message, cb ){
         cb = cb || function( err, data ){ 
            if( err )
               return console.error( err );

            //console.log( data );
         };
         const data = [{topic: topic, messages: message}];

         if( ret.producer._ready )
            ret.producer.send( data, cb );
         else{
            ret.topics.push( topic );
            ret.producer._topics.push( topic );
            //save to the cache
            ret.producer._data.push( {data: data, cb: cb} );
         }
      };

      ret.producer.on('error', onError );
   }
   return ret;
}

module.exports = {
      createClient: createClient
};
