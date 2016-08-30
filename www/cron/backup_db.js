var config   = require("../libs/config")
  , AdminDB  = require("../libs/AdminDB")
  , TOOL     = require("../libs/tools")
;

const PID = process.pid;
const dbadmin = new AdminDB( config.database_server.host, config.database_server.port );


console.log( PID + "- Start");

function die( msg ){
  var code = 0;
  if( msg == undefined )
    msg = "successfully";
  else {
    msg = "error: " + msg;
    code = 1;
  }
  console.log( PID + "- Finished " + msg );
  process.exit( code );
}




dbadmin.getBackupInfo( function( err, info ){
  if( err )  return die( msg );
  if( info.isBackingUp )
    return die( "being backed up" );
  if( info.isRestoring )
    return die( "being restored" );
    
  var timeout = 0;
  //none, daily, weekly, monthly
  switch (info.autobackup) {
    case "none":
      return die();
    case "daily":
      timeout = 24*3600*1000;
      break;
    case "weekly":
      timeout = 7*24*3600*1000;
      break;
    case "monthly":
      timeout = TOOL.getDaysInMonth()*24*3600*1000;
      break;
    default:
      die("unknown");
  }

  const last_backup_ts = info.lastBackup
})
