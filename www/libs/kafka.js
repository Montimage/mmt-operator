const config = require("./config");
const kafkaConnectionString = config.kafka_server.host + ":" + config.kafka_server.port;

const kafka = require('kafka-node'),
client = new kafka.Client( 
		kafkaConnectionString, 
		"mmt-operator"
),
consumer = new kafka.Consumer(
		client,
		[],
		{autoCommit: true}
),
producer = new kafka.Producer(client);

consumer._topics = [];
consumer._ready  = false;

//producer
producer._ready = false;
producer._data  = [];

function onReady(){
	producer.createTopics( consumer._topics, false, function( err, data){
		if( err )
			console.error( err );
	});
	
	//subscribe to topics
	consumer.addTopics( consumer._topics, function( err, added ){
		if( err )
			console.error( err );
	});

	consumer._ready = true;
	
	//send data on cache
	for( var i in producer._data)
		producer.send( producer._data[i] );
	
	producer._ready = true;
}


producer.on("ready", onReady ); 
consumer.on('ready', onReady );

consumer.on('error', function (err) {
	console.error("Kafka is error");
	console.error( err );
})

/**
 * subscribe to a new channel
 * - channel: name of channel to subscribe
 * - cb     : callback( err, added )
 */
consumer.subscribe = function( channel ){
	//console.log( "subscribe", channel );
	if( consumer._ready ){
		consumer.addTopics([channel], function( err, added ){
			if( err )
				console.error( err );
		});
	}else
		consumer._topics.push( channel );
};


//override "on" function
consumer._on = consumer.on;
consumer.on = function( ev, cb ){
	if( ev === "message" )
		consumer._on("message", function( msg ){
			//console.log( msg );
			cb( msg.topic, msg.value );
		})
		else
			consumer._on( ev, cb );
};


consumer.publish = function( topic, message, cb ){
	cb = cb || function( err, data ){ 
		//console.log( arguments ); 
	};
	var data = [{topic: topic, messages: message}];
	if( producer._ready )
		producer.send( data, cb );
	else
		producer._data.push( data );
};

module.exports = {
		createClient: function(){
			return consumer;
		}
};
