/**
 * Get/set list of Probes
 */

 var express = require('express');
 var router  = express.Router();
 var fs      = require("fs");
var AdminDB  = require("../../libs/AdminDB");
var Probe    = require("../../libs/Probe");

var dbadmin = new AdminDB();

function sendResponse( res ){
  return function( err, ret ){
    if( err ) return res.status(500).send( err );
    return res.send( {data: ret} );
  }
}

function getInfo( probe_id, cb ){
  dbadmin.connect( function(err, db){
    if( err ) return res.status(500).send( err );

    var match = {};
    if( probe_id ) match.probe_id = probe_id;

    db.collection("probes").find( match ).toArray( function(err, arr){
      cb( err, arr );
    });
  });
}

//get list of probes
router.get("/", function( req, res, next ){
 getInfo( null, sendResponse( res) );
});


 //add a new probe
 router.post("/add", function( req, res, next ){
   var data = req.body || {};
   if( data.address == "localhost" || (data.address && data.username && data.password )){
     dbadmin.connect( function(err, db){
       if( err ) return res.status(500).send( err );

       data._id       = data.probe_id + data.address;
       data.timestamp = (new Date()).getTime();

       db.collection("probes").update( {_id : data._id}, data, {upsert: true}, sendResponse( res ) );
     });
     return;
   }
   //other
   res.send( "WTF" );
 });

//stop a probe
router.get('/stop/:probe_id', function( req, res, next){

});

//remove a probe
router.post('/remove/:probe_id', function( req, res, next){
  dbadmin.connect( function(err, db){
    if( err ) return res.status(500).send( err );
    var probe_id = req.params.probe_id;
    //uninstall probe
    //
    db.collection("probes").remove( {probe_id : probe_id}, sendResponse( res ));
  });
});

//get config of a probe
router.get('/config/:probe_id', function( req, res, next){
  getInfo( req.params.probe_id, function( err, arr ){
    if( err || arr.length == 0 )
      return res.status(500).send( {description: "Not found probe " + probe_id} );

    var probe_cfg = arr[0];
    var probe     = new Probe( "online", probe_cfg );
    probe.get_conf( sendResponse( res )  );
  })
});

//set config of a probe
router.post('/config/:probe_id', function( req, res, next){
  getInfo( req.params.probe_id, function( err, arr ){
    if( err || arr.length == 0 )
      return res.status(500).send( {description: "Not found probe " + probe_id} );

    var probe_cfg = arr[0];
    var probe     = new Probe( "online", probe_cfg );
    probe.set_conf( req.body.config, sendResponse( res )  );
  })
});
 module.exports = router;
