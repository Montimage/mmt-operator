/**
 * get/set information from config: local IPs
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");

router.get("/", function( req, res, next ){
  var mode = router._objRef.config.probe_analysis_mode;
  var probe_config_file  = "/opt/mmt/probe/conf/" + mode + ".conf",
      operator_config_file = "./config.json";

  if( _os.platform() == "darwin" )
    probe_config_file = "./test/online.conf";

  fs.readFile( probe_config_file, { encoding: 'utf8' }, function (err, probe) {
    if( err ){
      res.status(500).send( err );
      return;
    }
    fs.readFile( operator_config_file, { encoding: 'utf8' }, function (err, operator) {
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
});

module.exports = router;
