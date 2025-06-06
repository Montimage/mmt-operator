const _global = require("./global");
const path = require('path');
const val = _global.get("config");
const isMainProcess = ( process.send == undefined ); 

function parseBool( val ){
   if( val === true || val === false )
      return val;
   return val === 'true';
}

function set_default_value( variable, prop, value, convertFn ){
   if( variable[prop] === undefined )
      variable[prop] = value;
   //if we need to convert its value
   else if( convertFn )
      variable[prop] = convertFn( variable[prop] );
}

if( val !== undefined ){
   module.exports = val;
}
else{
 //ensure that mmt-operator is running on a good nodejs version
   if( isMainProcess && (process.release.lts === undefined || process.release.lts !== 'Jod' ))
      console.warn("[WARN] MMT-Operator works well on Jod release of NodeJS. It may not work on this version "+ process.version +".");
   
// allow to change config.json
   var configPath = path.resolve( path.join( __dirname, "..", "config.json" ));
   process.argv.forEach(function (val) {
      //console.log(index + ': ' + val);
      const arr = val.split("=");
      if( arr[0] == "--config"){
         if( path.isAbsolute( arr[1] ))
            configPath = arr[1];
         else
            configPath = path.resolve( arr[1] );
         
         //parent process
         if( isMainProcess )
            console.warn("[INFO] MMT-Operator used configuration in " + arr[1] );
      }
   });

   const
   config  = require( configPath ),
   fs      = require("fs"),
   util    = require("util"),
   moment  = require('moment'),
   tools   = require('./tools.js'),
   VERSION = require("../version.json").VERSION_NUMBER + "-" + require("../version.json").VERSION_HASH,
   constant= require('./constant.js')
   ;

   //override config attributes by running parameters
   process.argv.forEach(function ( param ) {
      //the parameter must start by -X
      if( param.indexOf('-X') !== 0 )
         return;
      const val = param.substring(2).trim(); //remove -X
      //For example: val = 'database_server.host="localhost"'


      //console.log(index + ': ' + val);
      const arr = val.split("=");
      if( arr.length < 2 && isMainProcess)
         console.warn("[WARN] Ignore incorrect paramter: " + param);
      
      const nameArr = arr.shift().split('.'); //get array of the attribute hierarchy: 
      let obj = config;
      let isOverriden = true;
      for( let i=0; i<nameArr.length - 1; i++){
         let key = nameArr[i];
         if( obj[key] === undefined  ){
            obj[key] = {};
            isOverriden = false; //we created a new obj for this key => not override the one existing
         }
         obj = obj[key];
      }
      //assign value
      let value = arr.join("=");
      //try to parse the value if it is JSON
      try{
         value = JSON.parse( value );
      }catch( e ){
         //do nothing here as keep the original data format
      }
      
      obj[ nameArr[ nameArr.length - 1 ] ] = value;
         
      if( isOverriden && isMainProcess)
         console.info("[INFO] Override parameter: " + param );
   });



   config.location = configPath;

   config.version = VERSION; 
   
   config.rootDirectory = path.join( __dirname, ".." );
   
   const support_modes = [ constant.REDIS_STR,
         constant.KAFKA_STR,
         constant.FILE_STR, 
         constant.SOCKET_STR,
         constant.MQTT_STR,
         constant.NONE_STR
       ];
 
   if( support_modes.indexOf( config.input_mode ) === -1 )
   {
      
      console.warn("[ERROR] Unknown input mode " + config.input_mode);
      console.warn("[INFO]  Supported mode: " + support_modes);
      process.exit();
   }

   //disable input
   if( config.input_mode === constant.NONE_STR )
      config.probe_analysis_mode = "online";

   if( config.probe_analysis_mode != "online" && config.probe_analysis_mode != "offline" ){
      console.error("[ERROR]: 'probe_analysis_mode' in config file must be either 'online' or 'offline'");
      process.exit();
   }

   config.is_probe_analysis_mode_offline = (config.probe_analysis_mode === "offline");
   

// == HTTP server port number
   if( Number.isNaN( config.port_number ) || config.port_number < 0 )
      config.port_number = 80;



// == Database name
   config.databaseName      = "mmt-data";  //database 
   config.adminDatabaseName = "mmt-admin"; //database for administrator

   //default values when they are ignored
   set_default_value( config, "log_folder", path.join( __dirname, "..", "log") );


   set_default_value( config, "database_server", {} );

   set_default_value( config.database_server, "host", "127.0.0.1" );
   set_default_value( config.database_server, "port", 27017, parseInt );

   set_default_value( config, "redis_input", {});
   set_default_value( config.redis_input, "host", "127.0.0.1" );
   set_default_value( config.redis_input, "port", 6379, parseInt );
  
   set_default_value( config, "file_input", {});
   set_default_value( config.file_input, "data_folder", "/tmp/" );
   set_default_value( config.file_input, "delete_data", true, parseBool );
   set_default_value( config.file_input, "nb_readers",  1, parseInt );
   
   set_default_value( config, "socket_input", {});
   set_default_value( config.socket_input, "host", "127.0.0.1" );
   set_default_value( config.socket_input, "port", 50000, parseInt );
   set_default_value( config.socket_input, "max_connections", 0, parseInt );

   set_default_value( config, "micro_flow", {});
   set_default_value( config.micro_flow, "packet", 7, parseInt );
   set_default_value( config.micro_flow, "byte"  , 448, parseInt );

// period to retain detail reports (1 report for 1 session during sample period, e.g. sconds)
// retain 7days
   set_default_value( config, "retain_detail_report_period", 7*24*3600, parseInt );
   set_default_value( config, "auto_reload_report", true, parseBool );

   set_default_value( config, "probe_stats_period", 5);
   config.probe_stats_period_in_ms = config.probe_stats_period * 1000;
   
   set_default_value( config, "query_cache", {} );
   set_default_value( config.query_cache, "enable", false );
   set_default_value( config.query_cache, "folder", "/tmp/" );
   set_default_value( config.query_cache, "bytes",  5*1000*1000, parseInt ); //5MB
   set_default_value( config.query_cache, "files",  999, parseInt );

// use in Cache to decide when we will push caches to DB:
// - either their size >= max_length_size
// - or interval between 2 reports >= max_interval
   set_default_value( config, "buffer", {});
   set_default_value( config.buffer, "max_length_size", 10000, parseInt );
   set_default_value( config.buffer, "max_interval", 30, parseInt );
   
   set_default_value( config, "modules_config", {});

   config.json = JSON.stringify( config );
   
// ensure log directory exists
   if( !fs.existsSync( config.log_folder ) ){
      console.info("[INFO]: Log folder [" + config.log_folder + "] does not exists. Creating it ..");
      try{
          fs.mkdirSync(config.log_folder, { recursive: true });
      }catch( e ){
          console.error( "Cannot create " + config.json + ":" + e );
          console.info( "node version: %s, platform: %s", process.version, process.platform );
          process.exit();
      }
   }
   
   
//====== overwrite console.log 
   console.logStdout = console.log;
   console.errStdout = console.error;

   const logFile = {
         date   : (new Date()).getDate(),
         stream : fs.createWriteStream(path.join(config.log_folder, (moment().format("YYYY-MM-DD")) + '.log'), { flags: 'a' })
   };
   
   const _writeLog = function( msg, date ){
      //output to console
      if( config.is_in_debug_mode == true )
         console.logStdout( msg );
      
      //ensure each one log file for each day
      if( logFile.date !== date ){
         logFile.date   = date;
         logFile.stream = fs.createWriteStream(path.join(config.log_folder, (moment().format("YYYY-MM-DD")) + '.log'), { flags: 'a' });
      }

      logFile.stream.write( msg + "\n" );
   };

   var logStdout = process.stdout;
   var errStdout = process.stderr;


// get prefix to print message: date time, file name and line number of caller
   const getPrefix = function( txt ){
      const date = new Date();
      var logLineDetails = ((new Error().stack).split("at ")[3]).trim();
      //root is not always www
      logLineDetails     = logLineDetails.split( config.rootDirectory )[1];
      var prefix = date.toLocaleString() + ", " + logLineDetails + ", " + txt + "\n  ";

      return {msg: prefix, date: date.getDate()};
   };
   
   //console.log, debug, info, warn, error
   if( !Array.isArray( config.log ) )
      config.log = [];
   
   //by default disable alls log unless console.error
   console.error = function(){
      var prefix  = getPrefix("ERROR");
      var content = util.format.apply(null, arguments);
      _writeLog( prefix.msg + content, prefix.date );
   };
   
   console.log = console.warn = console.info = function(){};
   
   for( var i in config.log ){
      var type = config.log[ i ];
      switch( type ){
         case "log":
            console.log = function(){
               var prefix  = getPrefix("LOG");
               var content = util.format.apply(null, arguments);
               _writeLog( prefix.msg + content, prefix.date );
            };
         case "warn":
            console.warn = function(){
               var prefix  = getPrefix("WARN");
               var content = util.format.apply(null, arguments);
               _writeLog( prefix.msg + content, prefix.date );
            };
         case "info":
            console.info = function(){
               var prefix  = getPrefix("INFO");
               var content = util.format.apply(null, arguments);
               _writeLog( prefix.msg + content, prefix.date );
            };
      }
   }

   config.logStdout     = logStdout;
   config.logFileStream = logFile.stream;
   config.outStream     = logStdout;

//    list of pages to show on Web (see "all_page" on routes/chart.js)
   if( ! Array.isArray( config.modules ))
      config.modules = [];

   //list of pages to be added
   //const fixPages = ["link","network","application", "dpi"];
   const fixPages = [];

   for( var i=fixPages.length-1; i>=0; i--)
      if( config.modules.indexOf( fixPages[i] ) == -1 )
         config.modules.unshift( fixPages[i] );


// is MMT-Operator running for a specific project?
// config.project = constant.project.MUSA
// config.project = "MUSA"

   config.isSLA = ( config.modules.indexOf("sla") !== -1 );

// MUSA
   config.sla = tools.merge( {
      "active_check_period"   : 5,
      "violation_check_period": 5,
      "reaction_check_period" : 5
   }, config.modules_config.sla);


// check Musa
   if( config.isSLA ){
//      if( config.input_mode == constant.FILE_STR ){   
//         console.error('Error in config.json: input_mode must be either "kafka" or "redis" when enabling "sla" module.');
//         process.exit( 1 );
//      }

      if( config.sla == undefined ){
         console.error('Error in '+ config.location +': sla must be defined.');
         process.exit( 1 );
      }

      if( !Array.isArray( config.sla.init_components ) ){
         console.error('Error in config.json: sla.init_components must be an array.');
         process.exit( 1 );
      }
      if( !Array.isArray( config.sla.init_metrics ) ){
         console.error('Error in config.json: sla.init_metrics must be an array.');
         process.exit( 1 );
      }
      if( config.sla.actions == undefined ){
         console.error('Error in config.json: sla.actions must be defined.');
         process.exit( 1 );
      }
   }


   module.exports = config;

   _global.set( "config", config );
}