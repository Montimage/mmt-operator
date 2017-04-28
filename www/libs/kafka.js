const config = require("./config");
const kafkaConnectionString = config.kafka_server.host + ":" + config.kafka_server.port;

var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client( kafkaConnectionString
                              , "mmt-operator" //client ID
                              
                             ),
    consumer = new Consumer(
        client,
        [
        	//payloads: Array,array of FetchRequest, FetchRequest is a JSON object like:
        ],
        {
            autoCommit: true
        }
    );

consumer._topics = [];
consumer._ready  = false;

consumer.on('ready', function () {
    consumer._ready = true;
    
    consumer.addTopics( consumer._topics, function( err, added ){
            if( err )
                console.error( err );
        });
});

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
    if( consumer._ready )
        consumer.addTopics([channel], function( err, added ){
            if( err )
                console.error( err );
        });
    else
        consumer._topics.push( channel );
};


//override "on" function
consumer._on = consumer.on;
consumer.on = function( ev, cb ){
    if( ev === "message" )
        consumer._on("message", function( msg ){
            cb( msg.topic, msg.value );
        })
    else
        consumer._on( ev, cb );
};

module.exports = {
	createClient: function(){
		return consumer;
	}
};
