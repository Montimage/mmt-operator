var express  = require('express');
var router   = express.Router();
const config = require("../../libs/config");

pub_sub    = require("../../libs/kafka");


//Todo:produce message on specific topic
//Pass the message through the route
const { Kafka } = require('kafkajs');

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

    // Publish the message to the Kafka topic
    await producer.send({
 	 topic: 'so-topic',//Orchestrator-Topic
 	 messages: [{
  		  key: null,
  		  value: msg
  }]
    });
    console.log('Message published successfully');
    result=true;
    return result;
  } catch (error) {
    console.error('Error publishing message:', error);
    result=false;

  } finally {
    // Disconnect the producer from the Kafka cluster
    await producer.disconnect();
    console.log("result in function "+result)
    return result;
  }
}


router.get("",async function(req, res,next) {
    console.log("Received "+req.query.value);
    //produceMessage();
    //_publishMessage( "testTopic", "ciao" )
    var result=await produceMessage(req.query.value);

    //  publisher.publish( "testTopic", "Hello Kafkabus");
    console.log("Remediation.js server");
    console.log("Result "+result)
   // res.sendFile('index.html', { root: __dirname + "../views/" } )    
   if(result==true){
      // res.status(204).end()//204: The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.
      
     // res.status(202).setHeader("Content-Type", "application/json");
      //res.sendFile('index.html', { root: __dirname + "../views/" } ) 

      //res.send({message: "Message correctly published on kafkabus "});
     MMTDrop.alert.success("your message here", 10*1000); 
   }
      else
          res.status(500).send( "Error:Message not published on KafkaBus" );

    //  res.status(400).end()//204: The server has not fulfilled the request and that there is no additional content to send in the response payload body.

});

router.post("",async function(req, res) {
  console.log("Received "+req.query.value);
  //produceMessage();
  //_publishMessage( "testTopic", "ciao" )
  var result=await produceMessage(req.query.value);

  //  publisher.publish( "testTopic", "Hello Kafkabus");
  console.log("Remediation.js server");
  console.log("Result "+result)
 // res.sendFile('index.html', { root: __dirname + "../views/" } )    
 if(result==true){
    // res.status(204).end()//204: The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.
    
   // res.status(202).setHeader("Content-Type", "application/json");
    //res.sendFile('index.html', { root: __dirname + "../views/" } ) 

    //res.send({message: "Message correctly published on kafkabus "});
   MMTDrop.alert.success("your message here", 10*1000); 
 }
    else
        res.status(500).send( "Error:Message not published on KafkaBus" );

  //  res.status(400).end()//204: The server has not fulfilled the request and that there is no additional content to send in the response payload body.

});


module.exports = router;











