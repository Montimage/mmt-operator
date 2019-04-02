/**
 * Read reports from message bus (redis or kafka) then save them to DB
 */
const config         = require('../libs/config');
const constant       = require('../libs/constant.js');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");

const database       = new DataBase();
const processMessage = new ProcessMessage( database );


var pub_sub = null;

switch( config.input_mode ){
case constant.REDIS_STR:
	pub_sub = require("../libs/redis");
    break;
case constant.KAFKA_STR:
	pub_sub = require("../libs/kafka");
    break;
default:
	console.error( "Does not support input mode = " + config.input_mode );
	process.exit();
}

function receiveMessage (channel, message) {
   //console.log( "[" + channel + "] " + message );
   try{
      processMessage.process( message );
   }catch( err ){
      console.error("Error when processing message on channel: " + channel );
      console.error( message );
      console.error( err );
   }
}


const report_client = pub_sub.createClient( "consumer", "busReader" );

//*
report_client.subscribe("license.stat");
report_client.subscribe("security.report");
report_client.subscribe("protocol.flow.stat");
report_client.subscribe("session.flow.report");
report_client.subscribe("protocol.stat");
//report_client.subscribe("radius.report");
//report_client.subscribe("microflows.report");
report_client.subscribe("flow.report");
report_client.subscribe("web.flow.report");
report_client.subscribe("ssl.flow.report");
report_client.subscribe("rtp.flow.report");

report_client.subscribe("behaviour.report");

report_client.subscribe("ndn.report");
report_client.subscribe("OTT.flow.report");
report_client.subscribe("cpu.report");

report_client.on('message', receiveMessage);

const report_client2 = pub_sub.createClient( "consumer", "busReader2" );
//for MUSA
report_client2.subscribe("metrics.avail");

report_client2.on('message', receiveMessage);
//*/





process.stdin.resume();//so the program will not close instantly
//Ctrl+C
process.on('SIGINT',function(){
 database.flush( process.exit );
});