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
const OPERATOR_CONFIG_FILE = "./config.json";

router.get("/", function( req, res, next ){

  router._objRef.probe.get_conf( function (err, probe) {
    if( err ){
      res.status(500).send( err );
      return;
    }
    fs.readFile( OPERATOR_CONFIG_FILE, { encoding: 'utf8' }, function (err, operator) {
      if( err ){
        res.status(500).send( err );
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.send({ data: {
          probe   : probe,
          operator: operator
        }
      });
    });//end second fs
  });//end first fs
});

//when user want to save the config
router.post("/", function( req, res, next ){
  var obj = req.body;
  //save MMT-Probe
  if( obj.probe ){
    router._objRef.probe.set_conf( obj.probe, function( err ){
      if( err )
        return res.status( 500 ).send( err );
      router._objRef.probe.restart();
      res.send( "{}" );
    } )
    return;
  }
  //save MMT-Operator
  if( obj.operator ){
    try{
      obj.operator = JSON.parse( obj.operator );
    }catch( err ){
      res.status( 500 ).send( err );
    }
    fs.writeFile( OPERATOR_CONFIG_FILE, JSON.stringify( obj.operator, null, "   "), function( err ){
      if( err )
        return res.status( 500 ).send( err );

      res.send( "{}" );

      //router._objRef.config = obj.operator;
      //restart nodejs
      exec("service operator_d restart");
    } );
    return;
  }

  //other
  res.send( "WTF" );
});

module.exports = router;
