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
  res.setHeader("Content-Type", "application/json");
  res.send({});
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

  //other
  res.send( "WTF" );
});

module.exports = router;
