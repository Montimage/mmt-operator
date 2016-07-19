var config    = require("../libs/config")
  , manager   = require("../libs/manager_db")
  , AdminDB   = require("../libs/AdminDB")
  , DataDB    = require("../libs/DataDB")
  , fs        = require("fs");


var dbadmin = new AdminDB();
var db_name = (new DataDB()).db_name;

var db_config = {
  db  : db_name,
  host: config.database_server.host,
  port: config.database_server.port,
};

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

      manager.backup( db_config, {
          //ftp connection setting. See: https://github.com/mscdex/node-ftp
          host    : obj.ftp.server,
          port    : 21,
          user    : obj.ftp.username,
          password: obj.ftp.password,
          secure  : obj.ftp.isSecure,
          isEnable: obj.ftp.isEnable
      }, function( err, file_path, file_name ) {
        var data = {
          $set: {isBackingUp : false}
        };

        var lastBackup = {
              time  : (new Date()).getTime(),
              name  : file_name,
              file  : file_path, //real file
              error : err,
              size  : file_path == undefined ? 0    : fs.statSync( file_path ).size
            };

        data = {
          $set : {isBackingUp : false, lastBackup: lastBackup},
          $push: {backup: lastBackup}
        };

        set_data(data, function( err2 ){
          callback( err || err2, file_name );
        });
      });
    })
  })
}


function restore( id, cb ){
  callback = function( err ){
    console.error( err );
    if( cb ) cb( err );
  };
  if( id == undefined )
    return callback("Need id");

  id = parseInt( id );

  get_data( function( err, obj ){
    if( err ) return callback( err );
    if( obj.ftp == undefined ) obj.ftp = {};
    var bak = undefined;
    if( obj.backup == undefined) obj.backup = [];

    //find a backup at the timestamp (=id)
    for( var i=0; i<obj.backup.length; i++){
      if( obj.backup[i].time == id ){
        bak = obj.backup[i];
        break;
      }
    }

    if( bak == undefined )
      return callback("Not found backup for time=" + id);
    if( bak.file == undefined )
      return callback("Not found file for time=" + id);

    set_data({$set: {isRestoring : id}}, function( err ){
      if( err ) return callback( err );
      var ftp_conf  = undefined
        archiveFile = undefined;
      //if there exits file at local storage
      if( fs.existsSync( bak._file )){
        archiveFile = bak.file;
      }else {
        //in this case, we need to download file from FTP server
        archiveFile = bak.file;
        ftp_conf = {
            //ftp connection setting. See: https://github.com/mscdex/node-ftp
            host    : obj.ftp.server,
            port    : 21,
            user    : obj.ftp.username,
            password: obj.ftp.password,
            secure  : obj.ftp.isSecure,
            isEnable: obj.ftp.isEnable
        };
      }
      manager.restore( archiveFile, db_config, ftp_conf, function( err ) {
        var data = {
          $set : {isRestoring : undefined},
          $push: {restore: {time: id, error: err}}
        };
        set_data(data, function( err2 ){
          callback( err || err2 );
        });
      }); //end manager.restore
    }); //end set_data
  });//end get_data
}

module.exports = {
  get_data: get_data,
  set_data: set_data,
  backup  : backup,
  restore : restore
}
