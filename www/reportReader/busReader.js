/**
 * Read reports from message bus (redis or kafka) then save them to DB
 */
const config         = require('../libs/config');
const constant       = require('../libs/constant.js');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");
const DBInserter     = require("./DBInserter.js");
const { MongoClient }= require('mongodb');
const database       = new DataBase();
const processMessage = new ProcessMessage( database );


var pub_sub    = null;
let topic      = null;
let clientName = null;
//let attacksTargeted =[];
//let index=0 ;
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
	const dbName = 'mmt-data'; // Replace with your database name
	var ipAttacker='';
	// MongoDB aggregation pipeline
	const pipeline = [
		{    $match: {      "4": attackId    }  }, 
		{    $project: {      "ipSrc": {        $arrayElemAt: ["$8.event_1.attributes", 0]      }   }  },  
		{    $project: {      "ipSrcValue": {        $arrayElemAt: ["$ipSrc", 1]      },      "_id": 0     }  },  
		{    $limit: 1  }
	  ];

	  	const client = new MongoClient(url ,{ useNewUrlParser: true, useUnifiedTopology: true });

		  try {
				// Connect to MongoDB
				await client.connect();
				const db = client.db(dbName);

				// Perform the aggregation query
				var result = await db.collection('security').aggregate(pipeline, {cursor : { }} ).toArray();
					if ( result.length > 0 ) {
						ipAttacker = result[0].ipSrcValue;
				
					}
			
		} catch (err) {
			console.error('Error:', err);
		} finally {
			// Close the MongoDB connection
			client.close();
			return ipAttacker;
		}
}
//Message input ex: [['C4', [[9,10]]], [[], []]]
 async function  extractDescriptions(json1, json2 ) {
	// Initialize an empty array to store the output JSON objects
	const outputJson = {} ;
	var ipAttacker = "" ;
	try{
		
	if( typeof json1[0] === 'string'  ){
		ipAttacker = await  queryIpMongo(  json1[1][0][0] ); // first element of second array. In the example is 9
		console.log("Attack ID from Miu "+ json1[1][0][0] );
		const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
		const descriptionObj = json2.find( (item) => item.CID === json1[0]);
		outputJson.CID = json1[0];
		outputJson.attack = json1[1][0];
		outputJson.description =  descriptionObj ? descriptionObj.description : "";
		outputJson.ipAttack  =  ipAttacker ;
		outputJson.timestamp  =  currentTimestampInSeconds ;

	 }
	
	} catch( err ){
		console.error('Error:', err);

	}
	finally{
	 return outputJson;
	}
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

const report_client = pub_sub.createClient( "consumer", clientName );

const sancus_db = new DBInserter( config.databaseName );


const report_client_miugio = pub_sub.createClient( "miugio", clientName );
report_client_miugio.subscribe( config.kafka_input.topic_miugio );
report_client_miugio.on('message',  async function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
	try{
		//console.log("Received message on Miugio topic " + message + " "+config.databaseName);
		//Insert to Databases
		const json1 = JSON.parse( message );//Convert MIU?GIO json 

		const json2 = require('../countermeasures.json');
		//console.log("json2")
		
		const  jsonAttacks 		=	await extractDescriptions( json1 [0] , json2 );
		const  jsonRemediation  =	await extractDescriptions( json1 [1] , json2 );

		//json.description = 'ciao';
		// Print the JSON objects

		//process message: insert into "sancus_report" collection
		if( JSON.stringify(jsonAttacks) != '{}')

			sancus_db.add("remediationAttack",[jsonAttacks]);

		if( JSON.stringify(jsonRemediation) != '{}')

			sancus_db.add("remediationVuln", [ jsonRemediation]);
  

		}
	catch (error) {
			// Handle the exception here
			console.error('An error occcurred:', error);

		  }


});

const report_client_civ = pub_sub.createClient( "civ", clientName );
report_client_civ.subscribe( config.kafka_input.topic_civ );

report_client_civ.on('message', function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
		//console.log("Received message on CIV topic "+message);

		//Insert to Databases
		var jsonCiv = JSON.parse( message);//Convert from string to json
		//process message: insert into "general_topic" collection
		sancus_db.add( "CivCollection", [ jsonCiv ] ) 


}  );

const report_client_generaltopic = pub_sub.createClient( "general_topic", clientName );
report_client_generaltopic.subscribe( config.kafka_input.general_topic );

report_client_generaltopic.on('message', function  ( channel,message) {
	//message is a string {id:0, []}
		//Process message: it should have a particular structure
		try{
			//console.log("Received message on General topic "+message);

			//Insert to Databases
			var jsonGeneraltopic = JSON.parse( message);//Convert from string to json
			//process message: insert into "general_topic" collection
			sancus_db.add( "general_topic", [jsonGeneraltopic ]) 
		}
		catch (error) {
			// Handle the exception here
			console.error('An error occcurred:', error);
		  }

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