const fs = require("fs");
const topics = ["metrics.avail"];


const sslOptions = {
      ca : fs.readFileSync( "./data/kafka-ca.cert" ),
      rejectUnauthorized : false
};

const zkOptions = undefined;// {};
const noAckBatchOptions =  undefined;// {};

var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client(
             "37.48.247.124:2181",
             "nghia-test", //clientName
             zkOptions,
             noAckBatchOptions,
             sslOptions
          ),
    consumer = new Consumer(
        client,
        [],
        {
            autoCommit: true
        }
    );

consumer.addTopics( topics, console.log );

consumer.on('message', function (message) {
   console.log(message);
});
