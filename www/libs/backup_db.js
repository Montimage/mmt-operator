var config    = require("../libs/config")
  , manager   = require("../libs/manager_db")
  , AdminDB   = require("../libs/AdminDB")
  , DataDB    = require("../libs/DataDB")
  , fs        = require("fs");


var dbadmin = new AdminDB();
var db_name = (new DataDB()).db_name;

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
      return callback();
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


      if( obj.ftp == undefined ) obj.ftp = {};
      //in this case, we do not upload archiveFile to FTP server

      manager.backup({
          db  : db_name,
          host: config.database_server.host,
          port: config.database_server.port,
      }, {
          //ftp connection setting. See: https://github.com/mscdex/node-ftp
          host    : obj.ftp.server,
          port    : 21,
          user    : obj.ftp.username,
          password: obj.ftp.password,
          secure  : obj.ftp.isSecure,
          isEnable: obj.ftp.isEnable
      }, function( err, file ) {
        var data = {
          $set: {isBackingUp : false}
        };

        var lastBackup = {
              time  : (new Date()).getTime(),
              file  : file == undefined ? null : file.substr( file.indexOf("public/") + "public/".length ),
              _file : file, //real file
              error : err,
              size  : file == undefined ? 0    : fs.statSync( file ).size
            };

        data = {
          $set : {isBackingUp : false, lastBackup: lastBackup},
          $push: {backup: lastBackup}
        };

        set_data(data, function( err2 ){
          callback( err || err2, file );
        });
      });
    })
  })
}


function restore( archiveFile ){

}

module.exports = {
  get_data: get_data,
  set_data: set_data,
  backup  : backup,
  restore : restore
}
