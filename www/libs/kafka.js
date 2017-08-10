//a wrapper of kafka
"use strict";

const fs     = require("fs");
const config = require("./config");
const kafka = require('kafka-node');

const kafkaConnectionString = config.kafka_input.host + ":" + config.kafka_input.port;
const zkOptions = undefined;// {};
const noAckBatchOptions =  undefined;// {};
const sslOptions = {};

if( config.kafka_input["ssl.ca.location"] ){
	sslOptions.ca = fs.readFileSync( config.kafka_input["ssl.ca.location"] );
	//donot verify hostname
	sslOptions.rejectUnauthorized = false;
}

function createClient(){
	var client = new kafka.Client( 
			kafkaConnectionString, 
			"mmt-operator-" + (new Date()).getTime(),
			zkOptions,
			noAckBatchOptions,
			sslOptions
	);
	var ret = {};
	ret.topics = [];
	
	ret.consumer = new kafka.Consumer(
			client,
			[],
			{
				autoCommit: true,
				fromOffset: "latest",
				encoding  : 'utf8'
			}
	),
	ret.producer = new kafka.Producer( client );

	ret.producer._ready  = false;
	ret.consumer._ready  = false;
	ret.consumer._topics = [];
	ret.producer._data   = [];
	
	ret.producer.on("ready", onReady ); 
	ret.consumer.on('ready', onReady );
	
	
	function onReady(){
		//create topics if they do not exist
		if( ret.topics.length > 0 ){
			ret.producer.createTopics( ret.topics, function( err, data){
				if( err )
					console.error( err );
			});
		}
		
		//console.log( this == ret.consumer );
		//console.log( this );
		

		ret.producer._ready = true;
		ret.consumer._ready = true;
		
		console.log("Ready !!!!", ret.topics );
		
		//subscribe to topics
		for( var i in ret.consumer._topics )
			ret.subscribe( ret.consumer._topics[i] );
			
		
		for( var i in ret.producer._data )
			ret.publish( ret.producer._data[i] );
	}
	
	function onError( err ){
		console.error("Kafka Error", err );
	}
	
	ret.consumer.on('error', onError );
	ret.producer.on('error', onError );

	/**
	 * subscribe to a new channel
	 * - channel: name of channel to subscribe
	 * - cb     : callback( err, added )
	 */
	ret.subscribe = function( channel ){
		console.log( "subscribe", channel, ret.consumer._ready );
		if( ret.consumer._ready ) {
			ret.consumer.addTopics([channel], function( err, added ){
				if( err )
					throw err;
			});
		}
		else{
			ret.topics.push( channel );
			ret.consumer._topics.push( channel );
		}
	};


//	override "on" function
	ret.on = function( ev, cb ){
		if( ev === "message" )
			ret.consumer.on("message", function( msg ){
				//console.log( msg );
				cb( msg.topic, msg.value );
			})
			else
				ret.consumer.on( ev, cb );
	};


	ret.publish = function( topic, message, cb ){
		cb = cb || function( err, data ){ 
			if( err )
				return console.error( err );
			console.log( data ); 
		};
		var data = [{topic: topic, messages: message}];
		
		if( ret.producer._ready )
			ret.producer.send( data, cb );
		else{
			ret.topics.push( topic );
			ret.producer._data.push( data );
		}
	};
	
	return ret;
}

module.exports = {
		createClient: createClient
};
