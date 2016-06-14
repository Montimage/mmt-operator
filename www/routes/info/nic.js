/**
 * get/set information of network interface: monitoring and admin
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var ifconfig = require('../../libs/ifconfig');

router.get("/", function( req, res, next ){
  //get list of available interfaces
  ifconfig.interfaces( function( err, interfaces){
    //get the monitoring interface
    router._objRef.probe.get_input_source( function( iface ){
      res.setHeader("Content-Type", "application/json");
      res.send( {data: {
        probe     : iface,
        interfaces: interfaces
      }} )
    })//end router._
  })//end ifconfig.i
});

//when user want to save the config
router.post("/", function( req, res, next ){
  var obj = req.body;
  console.log( JSON.stringify(obj) );

  var send_error = function( msg ){
    res.status(500).send( msg );
  }

  ifconfig.configure( obj.admin.iface,{
    address           : obj.admin["address"],
    netmask           : obj.admin["netmask"],
    gateway           : obj.admin["gateway"],
    "dns-nameservers" : obj.admin["dns-nameservers"]
  }, function( err ){
    if( err ){
      send_error( err );
      return;
    }
    if( obj.monitor != obj.admin.iface ){
      ifconfig.configure( obj.monitor, {
        address           : "0.0.0.0",
        netmask           : "0.0.0.0",
        gateway           : "0.0.0.0",
        "dns-nameservers" : "0.0.0.0",
      }, function(){} )
    }

    router._objRef.probe.updateInputSource( obj.monitor, function( err ){
      if( err ){
        send_error( err );
        return;
      }
      router._objRef.probe.restart( function(){
        res.send("{}");
      } )
    } )
  })
});
module.exports = router;
