/**
 * get/set information of network interface: monitoring and admin
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var ifconfig = require('../../libs/ifconfig');

router._oldConfig = {};

router.get("/", function( req, res, next ){
  //get list of available interfaces
  ifconfig.interfaces( function( err, interfaces){
    //get the monitoring interface
    router._objRef.probe.get_input_source( function(err, iface ){
      if( err )
        return res.status(500).send( msg );

      router._oldConfig = {
        probe     : iface,
        interfaces: interfaces
      };

      res.setHeader("Content-Type", "application/json");
      res.send( {data: router._oldConfig} )
    })//end router._
  })//end ifconfig.i
});

//when user want to save the config
router.post("/", function( req, res, next ){
  var obj = req.body;
  console.log( JSON.stringify(obj) );

  ifconfig.configure( obj.admin.iface,{
    address           : obj.admin["address"],
    netmask           : obj.admin["netmask"],
    gateway           : obj.admin["gateway"],
    "dns-nameservers" : obj.admin["dns-nameservers"]
  }, function( err ){

    if( err )
      return res.status(500).send( msg );

    //set monitoring interface to zero if it differents with the admin one
    if( obj.monitor != obj.admin.iface ){
      ifconfig.configure( obj.monitor, {
        address           : "0.0.0.0",
        netmask           : "0.0.0.0",
        gateway           : "0.0.0.0",
        "dns-nameservers" : "0.0.0.0",
      }, function(){} )
    }

    //update monitor interface only when it is changed
    if( obj.monitor != router._oldConfig.probe ){
      router._oldConfig.probe = obj.monitor;

      router._objRef.probe.updateInputSource( obj.monitor, function( err ){
        if( err )
          return res.status(500).send( msg );

        router._objRef.probe.restart( function(){
          return res.send("{}");
        } )
      });
      return;
    }
    res.send("{}");
  })
});
module.exports = router;
