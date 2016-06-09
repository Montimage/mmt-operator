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
})
module.exports = router;
