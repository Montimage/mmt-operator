const mqtt = require('mqtt');
const config = require("./config");
const tools  = require("./tools");

function createClient() {
	const ret = { topics: [], isReady: false };
	const connectOptions = config.mqtt_input.connect_options || {};
	connectOptions.clientId = connectOptions.clientId  || "mmt-operator-" + tools.getTimestamp();

	ret.client = mqtt.connect(config.mqtt_input.broker_url, connectOptions);

	/**
	 * subscribe to a new channel
	 * - channel: name of channel to subscribe
	 * - cb     : callback( err, added )
	 */
	ret.subscribe = function(topic) {
		console.log("subscribe", topic);
		if( ret.isReady )
			ret._subscribe( topic );
		else
			ret.topics.push( topic );
	}
	
	/** subscribe directly to a channel
	*/
	ret._subscribe = function( topic ){
		ret.client.subscribe(topic, function(err) {
			if (err) {
				console.warn("Cannot subscribe to " + topic + ": " + err.message + ". Retry to subscribe in 10 seconds.");
				setTimeout(ret.subscribe, 10 * 1000, topic);
			} else
				console.log("subscribed to", topic);
		});
	}
	
	//callback when the client is connected successfully to the broker
	ret.client.on("connect", () => {
		console.log("connected to %s", config.mqtt_input.broker_url);
		
		ret.isReady = true
		//subscribe the required topics
		ret.topics.forEach( ret._subscribe );
	});
	
	
	//override "on" function
	ret.on = function(ev, cb) {
		if (ev === "message")
			ret.client.on("message", function(topic, msg) {
				msg = msg.toString();
				//console.log( msg );
				cb(topic, msg);
			});
		else
			ret.client.on(ev, cb);
	};

	//on error
	ret.client.on('error', (err)=>{
		console.error("MQTT Error", err.message);
	});
	
	return ret;
}

module.exports = {
	createClient: createClient
};