/**
 * An abstract Reader that will call either 
 * - csvReader
 * - or busReader
 * @returns
 */
const net             = require("net");
const fs              = require('fs');
const config          = require("../libs/config");
const constant        = require('../libs/constant.js');
const child_process   = require("../libs/child_process");

//array of folders containing reports
const DATA_FOLDERS              = [];

function addDataFolder( path ){
   // ensure data directory exists
   if( !fs.existsSync( path ) )
      console.error("Ignore data folder [" + path + "] as it does not exists.");
   else
      DATA_FOLDERS.push( path );
}

if( Array.isArray( config.file_input.data_folder ))
   config.file_input.data_folder.forEach( addDataFolder );
else
   addDataFolder( config.file_input.data_folder );


function Reader(){
   const _readers = [];
   const self     = this;

   const execArgv = [
      //"--inspect-brk",
      //"--inspect-brk=10.0.0.2",
      //"--expose_gc",
      //"--max-old-space-size=2048"
      ];

   self.start = function(){

      if( process._children === undefined ){
         process._children = [];
      }

      switch( config.input_mode ){
      case constant.REDIS_STR:
      case constant.KAFKA_STR:
         let ret = child_process( __dirname + "/busReader.js", [],
               {execArgv: execArgv}  ).start();

         //console.log("started kafka client", ret);
         process._children.push( ret );
         break;
         
      case constant.SOCKET_STR:
         //Create and return a net.Server object, 
         // the function will be invoked when client connect to this server.
         
         // Use pauseOnConnect to prevent
         //  the sockets from being read before they are sent to the child process.
         const tcpServer = net.createServer({ pauseOnConnect: true });

         tcpServer.maxConnections = config.socket_input.max_connections;
         //when error
         tcpServer.on('error', console.error);
         //when server received a new client
         tcpServer.on('connection', function( client ) {
            console.log( 'New client connected : ' + client.remoteAddress + ':' + client.remotePort );
            
            let child = child_process( __dirname + '/streamProcess.js', [], 
                     {execArgv: execArgv}, 
                     1 //do not auto restart after exitting 
                     ).start();
            
            process._children.push( child );
            
            child.send('socket', client );
         });
         tcpServer.listen( config.socket_input.port, config.socket_input.host, function () {
            console.info('MMT-Operator is waiting for reports on address : ' + tcpServer.address());
         });

         
         break;
      default:
         // ensure data directory exists

         //ensure there exists at least one folder
         if( DATA_FOLDERS.length === 0 ){
            console.error("No data_folder is given. Please set it in 'file_input.data_folder'");
            process.exit();
         }

         //create processes to parallel readering
         const total_processes = config.file_input.nb_readers;
         for( let i=0; i<total_processes; i++ ){
            let ret = child_process( __dirname + '/csvReader.js', [i, total_processes], 
                  {execArgv: execArgv}
            ).start();
            process._children.push( ret );
         }
      }//end of switch

      
      //this process removes older records from Database
      let ret = child_process( __dirname + "/maintainDB.js", [],
      {execArgv: [
         //'--debug=5857'
         ]} 
      ).start();

      process._children.push( ret );
   }
}


//when main process exit, need to stop all its children
function _cleanUp(){
   if( process._children ){
      process._children.forEach( function( child ){
         if( child == undefined )
            return;
         
         child.stop();
      });
      process._children = undefined;
   }
}

process.on('SIGINT', _cleanUp);


module.exports = Reader;