var config    = require("../libs/config")
  , backupDB  = require("../libs/backup_db_to_ftp")
  , AdminDB   = require("../libs/admin_db")
  , DataDB    = require("../libs/data_db");


var dbadmin = new AdminDB( config.database_server.host, config.database_server.port );

function set_data( data, callback ){
  callback = callback || function(){};

  dbadmin.connect( function(err, db){
    if( err )
      return callback( err );

    if( data["$set"] == undefined )
      data._id = 1;

    db.collection("db-backup").update( {_id : 1}, data, {upsert: true}, callback);
  });
}

/**
 * Get data from collection "db-backup"
 * @param  {Function} callback callback(error, data)
 */
function get_data( callback ){
  callback = callback || function(){};

  dbadmin.connect( function(err, db){
    if( err ) return callback( err );
    db.collection("db-backup").find( {_id : 1}).toArray( function(err, arr){
      if( err ) return callback( err );
      if( arr.length > 0 )
        return callback( null, arr[0] );
      return callback("not found");
    });
  });
}

//backup database
function backup( callback ){
  callback = callback || function(){};

  set_data({$set: {isBackingUp : true}}, function( err ){
    if( err ) return callback( err );
    get_data( function( err, obj ){
      if( err ) return callback( err );

      backupDB.sync({
          db  : (new DataDB()).db_name,
          host: config.database_server.host,
          port: config.database_server.port,
      }, {
          host    : obj.ftp.server,
          port    : 21,
          user    : obj.ftp.username,
          password: obj.ftp.password,
          secure  : obj.ftp.isSecure
      }, function( err, file ) {
        var data = {
          $set: {isBackingUp : false}
        };

        if( err == undefined && file ){
          //backup success
          var lastBackup = {
                time     : (new Date()).getTime(),
                file     : file.substr( file.indexOf("public/") + "public/".length )
              };

          data = {
            $set : {isBackingUp : false, lastBackup: lastBackup},
            $push: {backup: lastBackup}
          };
        }
        set_data(data, function( err2 ){
          callback( err || err2, file );
        });
      });
    })
  })
}

module.exports = {
  get_data: get_data,
  set_data: set_data,
  backup  : backup
}
