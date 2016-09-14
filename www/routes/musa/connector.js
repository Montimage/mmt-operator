//this router is used to receive data from MMT-Connector and then to store data to database
const express = require('express');
const router  = express.Router();
const fs      = require("fs");

//upload SLA files
function now(){
  return (new Date()).getTime();
}

var last_update = now();
router.post("/", function(req, res, next) {

  var b = new Buffer(req.body.Event, 'base64')
  var obj = JSON.parse( b.toString() );

  //avoid 2 consecutive requests
  const ts = now();
  if( ts == last_update )
    return res.status( 429 ).send("Too much!");
  last_update = now;

  router.dbconnector.mdb.collection( "mmt-connector" ).insert( obj, function( err, result ){
    if( err )
      return res.status( 415 ).send( err );
    return res.status( 200 ).send( result );
  })
});

router.get("/", function( req, res, next ){
  res.send("Hi there!");
});
module.exports = router;
