//this router is used to receive data from MMT-Connector and then to store data to database
const express = require('express');
const router  = express.Router();
const fs      = require("fs");

function now(){
  return (new Date()).getTime();
}

var last_update = now();
router.post("/", function(req, res, next) {

   //avoid 2 consecutive requests
//   const ts = now();
//   if( ts == last_update )
//     return res.status( 429 ).send("Too much!");
//   last_update = now;
   
  var b = new Buffer(req.body.Event, 'base64')
  message = b.toString();
  
  var obj;
  try{
     obj = JSON.parse( message );
  }catch ( e ){
     obj = JSON.parse( "[" + message + "]" );
  }
  

  var collection = "mmt-connector";
  switch( obj[ 3 ] ){
     case 50:
        collection = "availability_real";
        break;
     case 10:
        collection = "misc";
        break;
  }
  
  router.dbconnector.mdb.collection( collection ).insert( obj, function( err, result ){
    if( err )
      return res.status( 415 ).send( err );
    return res.status( 200 ).send( result );
  })
});

router.get("/", function( req, res, next ){
  res.send("Hi there!");
});
module.exports = router;
