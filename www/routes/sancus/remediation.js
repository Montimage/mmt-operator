var express  = require('express');
var router   = express.Router();
const config = require("../../libs/config");
const { MongoClient } = require('mongodb');
pub_sub    = require("../../libs/kafka");


//Todo:produce message on specific topic
//Pass the message through the route
const { Kafka } = require('kafkajs');
async function deleteDocuments(cid,attackId,collectionName) {
  // Replace these with your MongoDB connection details
  const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
  const dbName = 'mmt-data';
  cid = `${cid}`;
  attackId =  parseInt(attackId, 10)
  //console.log( 'deleteDocuments  ' +  attackId + " "+ cid )
  // Define the two conditions for deletion

  const condition1 = { CID: cid };
  const condition2 = { attack: attackId};
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      // Connect to the MongoDB server
      await client.connect();
  
      // Access the database and collection
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
  
      // Delete documents that match both conditions
      const result = await collection.deleteMany({ $and: [condition1, condition2] });
  
      console.log(`Deleted ${result.deletedCount} documents`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Close the MongoDB connection
      client.close();
    }
  }


async function produceMessage(msg) {
  // Create a new Kafka instance
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [config.kafka_input.host+':'+config.kafka_input.port] // Replace with your Kafka broker(s) address
  });

  // Create a producer
  const producer = kafka.producer({ createPartitioner: Kafka.DefaultPartitioner  });

  // Connect the producer to the Kafka cluster
  await producer.connect();//In JavaScript, the await keyword is used to pause the execution of an asynchronous function until a promise is resolved or rejected. It can only be used inside an async function.
  let result=false;
    try {
      // Create a message object with the desired payload and topic
      console.log("subscribed to "+config.kafka_input.orchestrator_topic);

      // Publish the message to the Kafka topic
      await producer.send({
          topic: config.kafka_input.orchestrator_topic,//Orchestrator-Topic
          messages: [{
                value: msg
          }]
      });
      console.log('Message published successfully to orchestrator');
      result=true;
      return result;
    } catch (error) {
      console.error('Error publishing message to orchestrator:', error);
      result=false;

    } finally {
      // Disconnect the producer from the Kafka cluster
      await producer.disconnect();
      console.log("result in function "+result)
      return result;
    }
}


router.post("",async function(req, res) {
  console.log("Received "+req.query.CID+" "+req.query.AttackId+" "+ req.query.IP +" "+req.query.type);
  //produceMessage();
  //_publishMessage( "testTopic", "ciao" )
  if(req.query.CID=="C3"){
  var scriptCode = config.master_node.command;
    const command_ip = scriptCode.replace(/IP_ATT/g, req.query.IP);
    console.log("Command "+command_ip);
    var result=await produceMessage( command_ip );
  //  publisher.publish( "testTopic", "Hello Kafkabus");
  console.log("Remediation.js server");
  if(req.query.type=='A')
      deleteDocuments(req.query.CID,req.query.AttackId,"remediationAttack");
  else
      deleteDocuments(req.query.CID,req.query.AttackId,"remediationVuln");

 // res.sendFile('index.html', { root: __dirname + "../views/" } )    
  if(result==true){
       res.status(204).end()//204: The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.

   }
    else
        res.status(500).send( "Error:Message not published on KafkaBus" );

  //  res.status(400).end()//204: The server has not fulfilled the request and that there is no additional content to send in the response payload body.
  }
  else
    res.status(500).send( "Cannot apply the selected remediation" );

});


module.exports = router;










