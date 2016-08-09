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
var path    = require('path');
var config  = require('../../libs/config.js');

const OPERATOR_CONFIG_FILE = path.join(__dirname, "..", "..", "config.json");
var  INTERFACES_FILE       = "/etc/network/interfaces";
var PLATFORM               = _os.platform();
if( PLATFORM != "linux" )
  INTERFACES_FILE = './test/interfaces';

//the previous config of operator and probe
//=> to determine if they are changed (or not) in order to update them into files and restart operator/probe to take into account new configurations
router._cache_files = {};

router.get("/", function( req, res, next ){

  fs.readFile( INTERFACES_FILE, { encoding: 'utf8' }, function (err, probe) {
    if( err ){
      res.status(500).send( err );
      return;
    }
    fs.readFile( OPERATOR_CONFIG_FILE, { encoding: 'utf8' }, function (err, operator) {
      if( err ){
        res.status(500).send( err );
        return;
      }

      router._cache_files.probe    = probe;
      router._cache_files.operator = operator;

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
    if( obj.probe != router._cache_files.probe ){
      //backup file
      fs.writeFile( INTERFACES_FILE + "_" + (new Date()).getTime() + ".backup", router._cache_files.probe );

      router._cache_files.probe = obj.probe.trim();

      fs.writeFile( INTERFACES_FILE, router._cache_files.probe, function( err ){
        if( err )
          return res.status( 500 ).send( err );

        //restart network by reboot the machine
        exec("reboot");

        res.send( "{}" );
      } );
    }else{
      res.send( {res: "nothing change"} );
    }
    return;
  }
  //save MMT-Operator
  if( obj.operator ){
    if( obj.operator != router._cache_files.operator ){

      //check if the config is a valided json format
      try{
        obj.operator = JSON.parse( obj.operator );
      }catch( err ){
        res.status( 500 ).send( err );
      }

      //backup file
      fs.writeFile( OPERATOR_CONFIG_FILE + "_" + (new Date()).getTime() + ".backup", router._cache_files.operator );

      router._cache_files.operator = JSON.stringify( obj.operator, null, "  ").trim();

      fs.writeFile( OPERATOR_CONFIG_FILE, router._cache_files.operator, function( err ){
        if( err )
          return res.status( 500 ).send( err );

        //restart nodejs
        exec("service operator_d restart");

        res.send( {restart: "Done"} );
      });
    }else{
      res.send( {res: "nothing change"} );
    }
    return;
  }

  //other
  res.send( "WTF" );
});



//get log file
router.get("/log/:year/:month/:day", function( req, res, next){
  var date = new Date(req.params.year, req.params.month - 1, req.params.day);

  fs.readFile(  path.join(config.log_folder, (moment(date).format("YYYY-MM-DD")) + ".log" ), { encoding: 'utf8' }, function (err, data) {

    if( err )
      return res.status(500).send( err );

    res.setHeader( 'Content-Type', 'text/plain' );
    res.send( data );
  });
  return;
});

module.exports = router;
