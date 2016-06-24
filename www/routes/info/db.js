/**
 * get/set information from config: local IPs
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var backup  = require("../../libs/backup_db");
var fs      = require("fs");

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

  /**
   * Delete a backup file
   */
  if( action == "del" ){
    var data = req.body || {};
    //use time as id of each backup
    var time = data.time;
    backup.get_data( function( err, obj ){
      if( err )
        return res.status(500).send( err );
      var lst = obj.backup || [];
      //find the backup having the same timestamp
      for( var i=0; i<lst.length; i++){
        if( lst[i].time == time ){
          if( lst[i]._file ){
            //delete file
            fs.unlink( lst[i]._file, function( err ){
              if( err ) return res.status(500).send( err );
              //update information in DB
              obj.backup.splice(i, 1);
              obj.lastBackup = obj.backup[0];

              backup.set_data( obj, function( err, ret ){
                if( err )
                  return res.status(500).send( err );
                else
                  return res.send( ret );
              });
              return;
            });
            return;
          }
        }
      }
      return res.status(500).send( "Noting to delete" );
    });
    return
  }

  if( action == "restore" ){
    return;
  }
  //other
  res.send( "WTF" );
});


module.exports = router;
