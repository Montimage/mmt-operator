/**
 * Backup/restore MongoDB to/from a file on FTP Server
 * @example:

 var assert = require("assert");
 var backup = require("../libs/manager_db");
 backup.backup({
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
  , path  = require('path')
  , fs    = require('fs')
  , FTP   = require('ftp');

/**
 * log
 *
 * Logs a message to the console with a tag.
 *
 * @param message  the message to log
 * @param tag      (optional) the tag to log with.
 */
function log(message, tag) {
  console.log( "==> " + message )
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
  return string + '.bak';
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
 * @param archiveFile  archive file containing result
 * @param callback   callback(err)
 */
function mongoDump(options, archiveFile, callback) {
  var mongodump
    , mongoOptions;

  callback = callback || function() { };

  mongoOptions= [
    '-h', options.host + ':' + options.port,
    '-d', options.db,
    '--gzip',
    '--archive=' + archiveFile
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
 * mongoDump
 *
 * Calls mongodump on a specified database.
 *
 * @param options    MongoDB connection options [host, port, username, password, db]
 * @param archiveFile  archive file containing result
 * @param callback   callback(err)
 */
function mongoStore(options, archiveFile, callback) {
  var mongodump
    , mongoOptions;

  callback = callback || function() { };

  mongoOptions= [
    '-h', options.host + ':' + options.port,
    '-d', options.db,
    '--gzip',
    '--drop', //Before restoring the collections from the dumped backup, drops the collections from the target database. --drop does not drop collections that are not in the backup.
    '--keepIndexVersion',
    '--archive=' + archiveFile
  ];

  if(options.username && options.password) {
    mongoOptions.push('-u');
    mongoOptions.push(options.username);

    mongoOptions.push('-p');
    mongoOptions.push(options.password);
  }

  log('Starting mongorestore of ' + options.db + " from " + archiveFile);
  mongodump = spawn('mongorestore', mongoOptions);

  mongodump.on('exit', function (code) {
    if(code === 0) {
      log('mongodump executed successfully', 'info');
      callback(null);
    } else {
      callback(new Error("Mongodump exited with code " + code));
    }
  });
}


var FTP_CODE = {
  100   : "The requested action is being initiated, expect another reply before proceeding with a new command.",
  110	  : "Restart marker replay.",
  120	  : "Service ready in nnn minutes.",
  125	  : "Data connection already open; transfer starting.",
  150	  : "File status okay; about to open data connection.",
  200   : "The requested action has been successfully completed.",
  202	  : "Command not implemented, superfluous at this site.",
  211	  : "System status, or system help reply.",
  212	  : "Directory status.",
  213	  : "File status.",
  214	  : "Help message.On how to use the server or the meaning of a particular non-standard command.",
  215	  : "NAME system type. Where NAME is an official system name from the registry kept by IANA.",
  220	  : "Service ready for new user.",
  221	  : "Service closing control connection.",
  225	  : "Data connection open; no transfer in progress.",
  226	  : "Closing data connection. Requested file action successful (for example, file transfer or file abort).",
  227	  : "Entering Passive Mode (h1,h2,h3,h4,p1,p2).",
  228	  : "Entering Long Passive Mode (long address, port).",
  229	  : "Entering Extended Passive Mode (|||port|).",
  230	  : "User logged in, proceed. Logged out if appropriate.",
  231	  : "User logged out; service terminated.",
  232	  : "Logout command noted, will complete when transfer done.",
  234	  : "Specifies that the server accepts the authentication mechanism specified by the client, and the exchange of security data is complete.",
  250	  : "Requested file action okay, completed.",
  257	  : "PATHNAME created.",
  300   : "The command has been accepted, but the requested action is on hold, pending receipt of further information.",
  331	  : "User name okay, need password.",
  332	  : "Need account for login.",
  350	  : "Requested file action pending further information",
  400   : "The command was not accepted and the requested action did not take place, but the error condition is temporary and the action may be requested again.",
  421	  : "Service not available, closing control connection.",
  425	  : "Can't open data connection.",
  426	  : "Connection closed; transfer aborted.",
  430	  : "Invalid username or password",
  434	  : "Requested host unavailable.",
  450	  : "Requested file action not taken.",
  451	  : "Requested action aborted. Local error in processing.",
  452	  : "Requested action not taken. Insufficient storage space in system.File unavailable (e.g., file busy).",
  500   : "Syntax error, command unrecognized and the requested action did not take place. This may include errors such as command line too long.",
  501	  : "Syntax error in parameters or arguments.",
  502	  : "Command not implemented.",
  503	  : "Bad sequence of commands.",
  504	  : "Command not implemented for that parameter.",
  530	  : "Not logged in.",
  532	  : "Need account for storing files.",
  534	  : "Could Not Connect to Server - Policy Requires SSL",
  550	  : "Requested action not taken. File unavailable (e.g., file not found, no access).",
  551	  : "Requested action aborted. Page type unknown.",
  552	  : "Requested file action aborted. Exceeded storage allocation (for current directory or dataset).",
  553	  : "Requested action not taken. File name not allowed.",
  600   : "Replies regarding confidentiality and integrity",
  631	  : "Integrity protected reply.",
  632	  : "Confidentiality and integrity protected reply.",
  633	  : "Confidentiality protected reply.",
  10000 : "Common Winsock Error Codes",
  10054	: "Connection reset by peer. The connection was forcibly closed by the remote host.",
  10060	: "Cannot connect to remote server.",
  10061	: "Cannot connect to remote server. The connection is actively refused by the server.",
  10066	: "Directory not empty.",
};

function ftpErrorCode( err ){
  if( err == undefined )
    return;

  if( err.code != undefined && err.message == undefined ){
    err.message = FTP_CODE[ err.code ];
  }
  return {
    ftp: {
      code   : err.code,
      message: err.message
    }
  };
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
  var client = new FTP();
  log( "send to FTP Server" + source_file );
  client.on( 'ready', function(){
    client.put( source_file, target_file, function( err){
      client.end();
      callback( ftpErrorCode(err) );
    } )
  });


  client.on("error", function( err ){
    callback( ftpErrorCode(err) );
  });
  client.connect( options );
}


/**
 * Sends a file to FTP server
 *
 * @param options   ftp connect options( hosst, port, secure, username, password)
 * @param source_file file to download
 * @param target_file local file name to save to
 * @param callback  callback(err)
 */
function getFromFtpServer(options, source_file, target_file, callback) {
  callback = callback || function() { };
  var client = new FTP();
  log( "get from FTP Server: " + source_file + " ==> " + target_file );
  client.on( 'ready', function(){
    //see https://github.com/mscdex/node-ftp
    client.get( source_file, function( err, stream ){
      if( err ) return callback( ftpErrorCode(err) );

      stream.once('close', function(){
        client.end();
        callback();
      } );
      stream.once('error', function( err ){
        client.end();
        callback( err );
      } );
      stream.pipe( fs.createWriteStream( target_file ) );
    } )
  });

  client.on("error", function( err ){
    callback( ftpErrorCode(err) );
  });
  client.connect( options );
}

/**
 * backup
 *
 * Performs a mongodump on a specified database, gzips the data,
 * and uploads it to FTP server if FtpConfig.host != undefined
 *
 * @param mongodbConfig   mongodb config [host, port, username, password, db]
 * @param FtpConfig        FTP config [host, port, username, password, secure]
 * @param callback        callback(err)
 */
function backup(mongodbConfig, FtpConfig, callback) {
  var tmpDir      = path.join( __dirname, '..', 'public', 'db_backup')
    , archiveName = getArchiveName( mongodbConfig.db )
    , archiveFile = path.join( tmpDir, archiveName );

  callback = callback || function() {};

  log("Backup database");
  //delete old archive file (if exists)
  removeRF( archiveFile, function(){

    //backup to tar.gz file
    mongoDump( mongodbConfig, archiveFile, function( err ){

      if( err ) return callback( err );

      //send tar.gz file to FTP server
      if( FtpConfig.isEnable != undefined )
        sendToFtpServer( FtpConfig, archiveFile, archiveName, function( err ){
          callback(err, archiveFile );
        });
      else
        callback(null, archiveFile );
    })
  })
}

/**
 * restore
 * Download file from FTP server if FtpConfig.host != undefined
 * Performs a mongostore on a specified database, gzips the data,
 *
 * @param archiveFile    local or remote backup file
 * @param mongodbConfig  mongodb config [host, port, username, password, db]
 * @param FtpConfig      FTP config [host, port, username, password, secure]
 * @param callback       callback(err)
 */
function restore(archiveFile, mongodbConfig, FtpConfig, callback) {
  var tmpFile = path.join( require("os").tmpdir(), getArchiveName( mongodbConfig.db ) );

  callback = callback || function() {};
  log("Restore database");

  if( FtpConfig.host != undefined )
    getFromFtpServer( FtpConfig, archiveFile, tmpFile, function( err ){
      if( err ) return callback( err );
      mongoStore( mongodbConfig, tmpFile, function( err ){
        //delete tmpFile after restoring
        removeRF( tmpFile );
        callback(err);
      } );
    });
  else
    mongoStore( mongodbConfig, archiveFile, callback );
}

module.exports = { backup: backup, restore : restore};
