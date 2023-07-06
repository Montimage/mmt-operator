/**
 * Read reports from message bus (redis or kafka) then save them to DB
 */
const config         = require('../libs/config');
const constant       = require('../libs/constant.js');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");
const DBInserter     = require("./DBInserter.js");
const database       = new DataBase();
const processMessage = new ProcessMessage( database );


var pub_sub    = null;
let topic      = null;
let clientName = null;

switch( config.input_mode ){
case constant.REDIS_STR:
	pub_sub    = require("../libs/redis");
	topic      = config.redis_input.channel;
	clientName = config.redis_input.name;
    break;
case constant.KAFKA_STR:
	pub_sub    = require("../libs/kafka");
	topic      = config.kafka_input.topic;
	clientName = config.kafka_input.name;
    break;
default:
	console.error( "Does not support input mode = " + config.input_mode );
	process.exit();
}
//This function  extracts descriptions corresponding to CID and 
//gives in output a new json with the correct data format
function extractDescriptions(json1, json2) {
	const cidArray = json1[0];
	const attackArrays = json1[1];
  
	const output = [];
  
	for (let i = 0; i < cidArray.length; i++) {
	  const cid = cidArray[i];
	  const index = cidArray.indexOf(cid);
	  const description = json2[index].description;
	  const attack = attackArrays[i];
  
	  const json = {
		"CID": cid,
		"description": description,
		"attack": attack
	  };
  
	  output.push(json);
	}
  
	return output;
  }
  
function receiveMessage (channel, message) {
   console.log( "[" + channel + "] " + message );
   try{
      processMessage.process( message );
   }catch( err ){
      console.error("Error when processing message on channel: " + channel );
      console.error( message );
      console.error( err );
   }
}

const report_client = pub_sub.createClient( "consumer", clientName );

const sancus_db = new DBInserter( config.databaseName );


const report_client_miugio = pub_sub.createClient( "miugio", clientName );
report_client_miugio.subscribe( config.kafka_input.topic_miugio );
report_client_miugio.on('message',function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
		console.log("Received message on Miugio topic "+message+" "+config.databaseName);

		//Insert to Databases
		const json1 = JSON.parse( message);//Convert MIU?GIO json 

		const json2 = require('../countermeasures.json');
		console.log("json2")
		const jsonOutput = extractDescriptions(json1, json2);
		//json.description = 'ciao';
		console.log(jsonOutput)
		//process message: insert into "sancus_report" collection
	
			sancus_db.add("remediation",jsonOutput);
		
			
		//sancus_db._insert( "remediation", [rem_json] ) 


})


const report_client_generaltopic = pub_sub.createClient( "general_topic", clientName );
report_client_generaltopic.subscribe( config.kafka_input.general_topic );

report_client_generaltopic.on('message', function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
		console.log("Received message on General topic "+message);

		//Insert to Databases
		var json = JSON.parse( message);//Convert from string to json
		//process message: insert into "general_topic" collection
		sancus_db.add( "general_topic", [message] ) 


}  );
//when a topic is explicite in config file
if( topic ){
	report_client.subscribe( topic )
}
else{
	//default channels
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
}

report_client.on('message', receiveMessage);
//const report_client2 = pub_sub.createClient( "consumer", "busReader2" );
//for MUSA
//report_client2.subscribe("metrics.avail");

//report_client2.on('message', receiveMessage);
//*/


report_client.on('error', function(){
	if( report_client._is_restarting )
		return;
	report_client._is_restarting = true;
	
	console.error("Error when gotting messages from busReader. Restart the busReader process in 10 seconds.")
	database.flush( function(){ 
		//exit this process with code!=0
		//=> its parent will recreate a new process for it
		const EXIT_CODE=20;
		//restart after 10 seconds to avoid overhead of several consecutive restarts
		setTimeout( process.exit, 10*1000, EXIT_CODE );
	});
});



process.stdin.resume();//so the program will not close instantly
//Ctrl+C
process.on('SIGINT',function(){
 database.flush( process.exit );
});
