/**
 * get/set information from config: local IPs
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var backup  = require("../../libs/backup_db");


router.get("/", function( req, res, next ){
  backup.get_data( function( err, obj ){
    if( err )
      return res.status(500).send( err );
    return res.send( [obj] );
  })
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

    //backup database now
    if( data.$set && data.$set.isBackingUp === true )
      backup.backup();

    //save other information
    backup.set_data( data, function( err, ret ){
      if( err )
        return res.status(500).send( err );
      else
        return res.send( ret );
    });
    return;
  }

  //other
  res.send( "WTF" );
});

module.exports = router;
