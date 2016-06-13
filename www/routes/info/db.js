/**
 * get/set information from config: local IPs
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");
var exec    = require('child_process').exec;

router.get("/", function( req, res, next ){
  if( req.query.all !== undefined ){

  }

  res.setHeader("Content-Type", "application/json");
  res.send({});
});


router.get("/conf", function( req, res, next ){
  router._objRef.dbadmin.connect( function(err, db){
    if( err )
      return res.status(500).send( err );

    db.collection("db-backup").find( {_id : 1}).toArray( function(err, ret){
      if( err )
        return res.status(500).send( err );
      else
        return res.send( ret );
    } );
  } );
});


//when user want to save the config
router.post("/", function( req, res, next ){
  var action = req.query.action;

  if( action == "empty-db"){
    router._objRef.dbconnector.emptyDatabase(
        function(){
          res.send({});
        }
    );
    return ;
  }

  if( action == "save" ){
    var data = req.body;
    router._objRef.dbadmin.connect( function(err, db){
      if( err )
        return res.status(500).send( err );

      if( data["$set"] == undefined )
        data._id = 1;

      db.collection("db-backup").update( {_id : 1}, data, {upsert: true}, function(err, ret){
        if( err )
          return res.status(500).send( err );
        else
          return res.send( ret );
      } );
    } );
    return;
  }

  //other
  res.send( "WTF" );
});

module.exports = router;
