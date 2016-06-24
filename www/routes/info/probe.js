/**
 * Get/set list of Probes
 */

 var express = require('express');
 var router  = express.Router();
 var fs      = require("fs");
var AdminDB  = require("../../libs/AdminDB");


var dbadmin = new AdminDB();

router.get("/", function( req, res, next ){
 dbadmin.connect( function(err, db){
   if( err ) return res.status(500).send( err );

   db.collection("probes").find( {}).toArray( function(err, arr){
     if( err ) return res.status(500).send( err );
     res.send({data : arr});
   });
 });
});


 //when user want to save the config
 router.post("/", function( req, res, next ){
   var data = req.body || {};
   console.log( data );
   if( data.address && data.username && data.password ){
     dbadmin.connect( function(err, db){
       if( err ) return res.status(500).send( err );

       data._id       = data.address;
       data.timestamp = (new Date()).getTime();

       db.collection("probes").update( {_id : data._id}, data, {upsert: true}, function( err, ret ){
         if( err ) return res.status(500).send( err );
         return res.send( ret );
       });
     });
     return;
   }
   //other
   res.send( "WTF" );
 });


 module.exports = router;
