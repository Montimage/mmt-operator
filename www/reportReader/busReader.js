/**
 * Read reports from message bus (redis or kafka) then save them to DB
 */
const config         = require('../libs/config');
const constant       = require('../libs/constant.js');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");
const DBInserter     = require("./DBInserter.js");
const { MongoClient } = require('mongodb');
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

//This function executes a query to get the ip of the attacker
async function queryIpMongo( attackId ) {
	const url = `mongodb://` + config.database_server.host+ `:` + config.database_server.port;
	console.log("Url queryipMongo "+url)
	const dbName = 'mmt-data'; // Replace with your database name
	var ipAttacker='';
	// MongoDB aggregation pipeline
	const pipeline = [
		{
		  $match: {
			"4": attackId
		  }
		},
		{
		  $project: {
			"ipSrc": {
			  $arrayElemAt: ["$8.event_1.attributes", 0]
			}
		  }
		},
		{
		  $project: {
			"ipSrcValue": {
			  $cond: {
				if: { $and: [{ $isArray: "$ipSrc" }, { $gte: [{ $size: "$ipSrc" }, 2] }] },
				then: { $arrayElemAt: ["$ipSrc", 1] },
				else: null // Handle the case where "ipSrc" is not an array with at least two elements
			  }
			},
			"_id": 0
		  }
		},
		{
		  $limit: 1
		}
	  ];
	  	const client = new MongoClient(url,{ useNewUrlParser: true });

		try {
			// Connect to MongoDB
			await client.connect();

			const db = client.db(dbName);

			// Perform the aggregation query
			var result = await db.collection('security').aggregate(pipeline, {cursor : { }} ).toArray();
			if (result.length > 0) {
				ipAttacker = result[0].ipSrcValue;
			
			}
			else
				ipAttacker="10.10.10.2";

		} catch (err) {
			console.error('Error:', err);
		} finally {
			// Close the MongoDB connection
			client.close();
			console.log("Query ip mongo" + ipAttacker)
			return ipAttacker;
		}
}
async function  extractDescriptions(json1, json2) {
	// Initialize an empty array to store the output JSON objects
		const output = [];

		// Loop through the input array
		json1.forEach(([CID, attack]) => {
			// Find the corresponding description from json2
			const descriptionObj = json2.find((item) => item.CID === CID);

			// Create the output JSON object
			const jsonObj = {
				CID:CID,
				attack: attack[0],
				description: descriptionObj ? descriptionObj.description : "" ,//if there is no description this value will be empty string
				ipAttack: "10.2.2.3"
			};


			// Push the jsonObj into the output array
			output.push(jsonObj);
		});

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
report_client_miugio.on('message',async function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
		console.log("Received message on Miugio topic "+message+" "+config.databaseName);
		//Insert to Databases
		const json1 = JSON.parse( message);//Convert MIU?GIO json 

		const json2 = require('../countermeasures.json');
		//console.log("json2")

		const  [jsonOutput1, jsonOutput2]  = await extractDescriptions(json1, json2);
		//json.description = 'ciao';
		// Print the JSON objects

		//console.log("jsonOutput1 =", JSON.stringify(jsonOutput1, null, 4));
	//	console.log("jsonOutput2 =", JSON.stringify(jsonOutput2, null, 4));
		//process message: insert into "sancus_report" collection
		if(jsonOutput1["CID"] != null)
			sancus_db.add("remediation",[jsonOutput1]);
		if(jsonOutput2["CID"] != null)
			sancus_db.add("remediation",[jsonOutput2]);




})


const report_client_generaltopic = pub_sub.createClient( "general_topic", clientName );
report_client_generaltopic.subscribe( config.kafka_input.general_topic );

report_client_generaltopic.on('message', function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
		console.log("Received message on General topic "+message);

		//Insert to Databases
		var jsonGeneraltopic = JSON.parse( message);//Convert from string to json
		//process message: insert into "general_topic" collection
		sancus_db.add( "general_topic", jsonGeneraltopic ) 


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