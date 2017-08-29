//this router is used to receive data from MMT-Connector and then to store data to database
const express = require('express');
const router  = express.Router();
const fs      = require("fs");

var publisher = undefined;


function send_message( channel, msg, cb ){
   if( publisher == undefined )
      publisher = router.pub_sub.createClient("producer", "dummy-producer");
   
   publisher.publish( channel, msg, cb );
}

router.get("/pub/:channel", function( req, res, next ){
   res.writeHead(200, { "Content-channel": "text/event-stream",
      "Cache-control": "no-cache" });
   
   try{
      var channel = req.params.channel;
      var msg = req.query.msg;
      if( msg == undefined )
         return res.end("");
      
      msg = JSON.parse( msg );

      if( msg[3] === "now" )
         msg[3] = (new Date()).getTime()/1000;

      msg = JSON.stringify( msg );
      send_message(channel, msg, function( err, m){
         if( err )
            res.status(504).end("Error: " + err.message );
         else
            res.end("sent to channel: " + channel + "\nmessage:"+ msg + " " + JSON.stringify( m ));
      } );
      
   }catch( err ){
      res.status(504).end( "Error: " + err.message );
   }
});


router.get("/sub/:channel", function( req, res, next ){
   //check session loggedin
   if (req.session.loggedin == undefined) {
      res.status(403).send("Permision Denided");
      return;
   }


   res.writeHead(200, { "Content-Type": "text/event-stream",
      "Cache-control": "no-cache" });
   var channel = req.params.channel;
   var client = router.pub_sub.createClient("consumer", "dummy-consumer");
   res.write("subscribing to the channel: " + channel + "\n" );
   if(channel == undefined || channel == "*"){
      client.psubscribe( "*" );
      client.on('pmessage', function( pattern, channel, msg ){
         res.write( "["+ channel + "] " + msg + "\n" );
      });
   }else{
      client.subscribe( channel );
      client.on('message', function( channel, msg ){
         res.write( "[" + channel + "] " + msg + "\n" );
      });
   }
   client.on('disconnect', res.end );
});
module.exports = router;
