var config   = require("../libs/config")
  , backup   = require("../libs/backup_db_to_ftp")
  , backupDB = require("../libs/backup_db")
  , DataDB  = require("../libs/data_db");


var dbadmin = new AdminDB( config.database_server.host, config.database_server.port );

function update_data( data, callback ){
  callback = callback || function(){};

  dbadmin.connect( function(err, db){
    if( err )
      return callback( err );

    if( data["$set"] == undefined )
      data._id = 1;

    db.collection("db-backup").update( {_id : 1}, data, {upsert: true}, function(err, ret){
      if( err ) return callback( err );
      callback();
    } );
  });
}

//backup database
function backup( callback ){
  callback = callback || function(){};


}

function run(){
  var now = (new Date()).getTime();

}

module.exports = {
  backup: backup,
  run : run,
  cron: "* *"
}
