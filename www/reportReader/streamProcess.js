const config         = require('../libs/config');
const DBInserter     = require('./DBInserter');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");


const database       = new DataBase();
const processMessage = new ProcessMessage( database );

process.title = "mmt-operator-socket-reader-" + process.pid;



function _processLine( line ){
   try{
      processMessage.process( line );
   }catch( e ){
      console.error( "Error when processing line :" + line, e );
   }
}

let isStop = false;
function _cleanUp(){
   //press Ctrl+C again
   if( isStop )
      process.exit();

   isStop = true;
   database.flush( function(){
      console.warn("Ended " + process.title );
      process.exit();
   });
}

/**
 * A quick little thingy that takes a Stream instance and makes
 * it emit 'line' events when a newline is encountered.
 *
 *   Usage:
 *   ‾‾‾‾‾
 *  emitLines(process.stdin)
 *  process.stdin.resume()
 *  process.stdin.setEncoding('utf8')
 *  process.stdin.on('line', function (line) {
 *    console.log(line event:', line)
 *  })
 *  
 *  
 * https://gist.github.com/TooTallNate/1785026
 */
function emitLines (stream) {
   var backlog = '';
   stream.on('data', function (data) {
      backlog += data;
      let n = backlog.indexOf('\n');
      // got a \n? emit one or more 'line' events
      while ( n != -1) {
         stream.emit('line', backlog.substring(0, n));
         backlog = backlog.substring(n + 1);
         n = backlog.indexOf('\n');
      }
   });

   stream.on('end', function () {
      if (backlog) {
         stream.emit('line', backlog);
      }
   });
}



function processStream( stream ){
   database.onReady( function(){

      emitLines( stream );

      stream.setEncoding('utf-8');

      // When receive stream data.
      stream.on('line',  _processLine);

      // When stream send data complete.
      stream.on('end', _cleanUp);
   });
}




//when this script file is run as standalone process

process.stdin.resume();//so the program will not close instantly
//Ctrl+C
process.on('SIGINT', _cleanUp);

process.on('message', function(message, socket) {
   if( message === "socket" )
      processStream( socket );
});


///
module.exports = processStream;