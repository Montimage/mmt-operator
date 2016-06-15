/**
 * Backup MongoDB, compress, then upload to a FTP Server
 * @example:

 var assert = require("assert");
 var backup = require("../libs/backup_db_to_ftp");
 backup.sync({
     db: "mmt-data-offline",
     host: "localhost",
     port: 27017,
 }, {
     host: "192.168.0.196",
     port: 21,
     user: "mmt",
     password: "montimage"
 }, function(err) {
     assert.equal(err, null);
 });
 */

'use strict';

var exec  = require('child_process').exec
  , spawn = require('child_process').spawn
  , path  = require('path');

/**
 * log
 *
 * Logs a message to the console with a tag.
 *
 * @param message  the message to log
 * @param tag      (optional) the tag to log with.
 */
function log(message, tag) {
  console.log( message )
}

/**
 * getArchiveName
 *
 * Returns the archive name in database_YYYY_MM_DD.tar.gz format.
 *
 * @param databaseName   The name of the database
 */
function getArchiveName(databaseName) {
  var date = new Date();

  var string =
    [databaseName,
    date.getFullYear(),
    (date.getMonth() + 1),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()].join("-");
  return string + '.tar.gz';
}

/* removeRF
 *
 * Remove a file or directory. (Recursive, forced)
 *
 * @param target       path to the file or directory
 * @param callback     callback(error)
 */
function removeRF(target, callback) {
  var fs = require('fs');

  callback = callback || function() { };

  fs.exists(target, function(exists) {
    if (!exists) {
      return callback(null);
    }
    log("Removing " + target, 'info');
    exec( 'rm -rf ' + target, callback);
  });
}

/**
 * mongoDump
 *
 * Calls mongodump on a specified database.
 *
 * @param options    MongoDB connection options [host, port, username, password, db]
 * @param directory  Directory to dump the database to
 * @param callback   callback(err)
 */
function mongoDump(options, directory, callback) {
  var mongodump
    , mongoOptions;

  callback = callback || function() { };

  mongoOptions= [
    '-h', options.host + ':' + options.port,
    '-d', options.db,
    '-o', directory
  ];

  if(options.username && options.password) {
    mongoOptions.push('-u');
    mongoOptions.push(options.username);

    mongoOptions.push('-p');
    mongoOptions.push(options.password);
  }

  log('Starting mongodump of ' + options.db, 'info');
  mongodump = spawn('mongodump', mongoOptions);

  mongodump.on('exit', function (code) {
    if(code === 0) {
      log('mongodump executed successfully', 'info');
      callback(null);
    } else {
      callback(new Error("Mongodump exited with code " + code));
    }
  });
}

/**
 * compressDirectory
 *
 * Compressed a directory
 *
 * @param directory  running directory
 * @param input      path to input file or directory
 * @param output     path to output archive
 * @param callback   callback(err)
 */
function compressDirectory(directory, input, output, callback) {
  var tar
    , tarOptions;

  callback = callback || function() { };

  tarOptions = [
    '-zcf',
    output,
    input
  ];

  log('Starting compression of ' + input + ' into ' + output, 'info');
  tar = spawn('tar', tarOptions, {cwd: directory} );

  tar.stderr.on('data', function (data) {
    log(data, 'error');
  });

  tar.on('exit', function (code) {
    if(code === 0) {
      log('successfully compress directory', 'info');
      callback(null);
    } else {
      callback(new Error("Tar exited with code " + code));
    }
  });
}

/**
 * Sends a file to FTP server
 *
 * @param options   ftp connect options( hosst, port, secure, username, password)
 * @param source_file file to upload
 * @param target_file remote file name
 * @param callback  callback(err)
 */
function sendToFtpServer(options, source_file, target_file, callback) {
  callback = callback || function() { };
  var FTP  = require('ftp');
  var client = new FTP();
  log( "send " + source_file + " to FTP Server ..." );
  client.on( 'ready', function(){
    client.put( source_file, target_file, function( err){
      client.end();
      callback( err );
    } )
  });

  client.connect( options );
  client.on("error", callback );
}

/**
 * sync
 *
 * Performs a mongodump on a specified database, gzips the data,
 * and uploads it to FTP server.
 *
 * @param mongodbConfig   mongodb config [host, port, username, password, db]
 * @param FtpConfig        FTP config [key, secret, bucket]
 * @param callback        callback(err)
 */
function sync(mongodbConfig, FtpConfig, callback) {
  var tmpDir      = path.join( __dirname, '..', 'public', 'db_backup')
    , backupDir   = path.join( tmpDir, mongodbConfig.db )
    , archiveName = getArchiveName( mongodbConfig.db )
    , archiveFile = path.join( tmpDir, archiveName )
    , tmpDirCleanupFns;

  callback = callback || function() {};

  removeRF( backupDir, function(){
    removeRF( path.join(tmpDir, archiveName), function(){

        mongoDump( mongodbConfig, tmpDir, function( err ){

          if( err ) return callback( err );

          compressDirectory( tmpDir, mongodbConfig.db, archiveName, function( err ){
            if( err ) return callback( err );

            sendToFtpServer( FtpConfig, archiveFile, archiveName, function( err ){
              if( err ) return callback( err );
              callback(null, archiveFile );
            });
          })
        })
    })
  })
}

module.exports = { sync: sync };
