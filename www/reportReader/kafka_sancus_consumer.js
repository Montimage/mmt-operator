const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');

// Kafka configuration
const kafkaConfig = {
  clientId: 'my-app',
  brokers: ['localhost:9092']
};



async function insertInMongodb(client,message){

 
    const db = client.db('mmt-data'); // Replace 'mmt-data' with your desired database name
    // Publish the message in MongoDB
    await db.collection('remediation').insertOne(message); // Assuming the entire JSON message should be inserted
    console.log('[Sancus]Message published to MongoDB');
   // Add your custom logic here to process the consumed message
}
// Create Kafka instance
const kafka = new Kafka(kafkaConfig);

// Create consumer
const consumer = kafka.consumer({ groupId: 'my-group' });

// Function to consume messages from Kafka
async function consumeMessages(topic) {
  try {
    // Connect the consumer to Kafka broker
    await consumer.connect();
    console.log(`[Sancus]Connected to Kafka`);
    var client=await connectToMongo();


    // Subscribe to the topic
    await consumer.subscribe({ topic: topic });

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        console.log(`[Sancus]Received message:`, value);
        await insertInMongodb(client,message);
      }
    });
  } catch (error) {
    console.error('Error consuming meessage/inserting message :', error);
  }
}

// Consume messages from the Kafka topic
//consumeMessages('testTopic');
module.exports = {consumeMessages};
