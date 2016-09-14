var config   = require("../libs/config")
;

const PID = process.pid;

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

//do sth
//

die();
