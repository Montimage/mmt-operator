//this router is used to receive data from MMT-Connector and then to store data to database
const express = require('express');
const router  = express.Router();
const fs      = require("fs");

var publisher = undefined;


function send_message( channel, msg ){
  if( publisher == undefined )
      publisher = router.pub_sub.createClient();
  publisher.publish( channel, msg, function( err, data ){
	  throw err;
  } );
}

router.get("/pub/:channel", function( req, res, next ){
  var channel = req.params.channel;
  var msg = req.query.msg;
  if( msg == undefined )
	  return res.end("");
  msg = JSON.parse( msg );
  
  if( msg[3] === "now" )
    msg[3] = (new Date()).getTime()/1000;

  msg = JSON.stringify( msg );
  send_message(channel, msg );

  res.writeHead(200, { "Content-channel": "text/event-stream",
                             "Cache-control": "no-cache" });

  res.end("sent to channel: " + channel + "\nmessage:"+ msg);
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
  var client = router.pub_sub.createClient();
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
