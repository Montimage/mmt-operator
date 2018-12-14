/**
 * An abstract Reader that will call either 
 * - csvReader
 * - or busReader
 * @returns
 */
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

console.error("typeof = " + typeof(config.file_input.data_folder) );
if( Array.isArray( config.file_input.data_folder ))
   config.file_input.data_folder.forEach( addDataFolder );
else
   addDataFolder( config.file_input.data_folder );


function Reader(){
   const _readers = [];
   const self     = this;

   const execArgv = [
      //"--inspect",
      //'--debug-brk' , //debug
      //"--expose_gc",
      "--max-old-space-size=2048"
      ];
   //forward location of config file
   var configLocation = "";
   if( config.location )
      configLocation =  ("--config=" + config.location );

   self.start = function(){

      if( process._children == undefined ){
         process._children = [];
      }

      switch( config.input_mode ){
      case constant.REDIS_STR:
      case constant.KAFKA_STR:
         var ret = child_process( __dirname + "/busReader.js", [configLocation],
               {execArgv: execArgv}  ).start();

         //console.log("started kafka client", ret);
         process._children.push( ret );
         break;
      default:
         // ensure data directory exists

         //ensure there exists at least one folder
         if( DATA_FOLDERS.length == 0 ){
            console.error("No data_folder is given. Please set it in 'file_input.data_folder'");
            process.abort();
         }

         //create processes to parallel readering
         const total_processes = config.file_input.nb_readers;
         for( var i=0; i<total_processes; i++ ){
            var ret = child_process( __dirname + '/csvReader.js', [i, total_processes, configLocation], 
                  {execArgv: execArgv}
            ).start();
            process._children.push( ret );
         }
      }

      if( ! config.is_probe_analysis_mode_offline )
      {
         //this process removes older records from Database
         var ret = child_process( __dirname + "/maintainDB.js", [configLocation]
         , {execArgv: [
            //'--debug=5857'
            ]} 
         ).start();

         process._children.push( ret );
      }
   }
}

module.exports = Reader;