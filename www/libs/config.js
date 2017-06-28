const
    config  = require("../config.json"),
    fs      = require("fs"),
    util    = require("util"),
    moment  = require('moment'),
    path    = require('path'),
    tools   = require('./tools.js'),
    VERSION = require("../version.json").VERSION_NUMBER + "-" + require("../version.json").VERSION_HASH,
    constant= require('./constant.js')
;

//is MMT-Operator running for a specific project?
config.project = constant.project.NONE; //MUSA

config.isMusaProject = ( config.project === constant.project.MUSA );

config.version = VERSION; 
	
if( config.input_mode != constant.REDIS_STR 
		&& config.input_mode != constant.FILE_STR 
		&& config.input_mode != constant.KAFKA_STR)
    config.input_mode = constant.FILE_STR;

if( Number.isNaN( config.port_number ) || config.port_number < 0 )
    config.port_number = 80;

function set_default_value( variable, prop, value ){
  if( variable[prop] == undefined )
    variable[prop] = value;
}

set_default_value( config, "log_folder", path.join( __dirname, "..", "log") );

if( config.probe_analysis_mode != "online" && config.probe_analysis_mode != "offline" )
  config.probe_analysis_mode = "offline";

config.is_probe_analysis_mode_offline = (config.probe_analysis_mode === "offline");

set_default_value( config, "database_server", {} );

set_default_value( config.database_server, "host", "127.0.0.1" );
set_default_value( config.database_server, "port", 27017 );

set_default_value( config.redis_server, "host", "127.0.0.1" );
set_default_value( config.redis_server, "port", 6379 );

set_default_value( config.micro_flow, "packet", 7 );
set_default_value( config.micro_flow, "byte"  , 448 );

//period to retain detail reports (1 report for 1 session during sample period, e.g. sconds)
//retain 7days
set_default_value( config, "retain_detail_report_period", 7*24*3600 );

set_default_value( config, "probe_stats_period", 5);
config.probe_stats_period_in_ms = config.probe_stats_period * 1000;

//use in Cache to decide when we will push caches to DB:
//- either their size >= max_length_size
//- or interval between 2 reports >= max_interval
set_default_value( config.buffer, "max_length_size", 10000 );
set_default_value( config.buffer, "max_interval", 30 );


config.json = JSON.stringify( config );

// ensure log directory exists
if( !fs.existsSync( config.log_folder ) ){
  console.error("Error: Log folder [" + config.log_folder + "] does not exists.");
  console.info( "\nConfiguration: " );
  console.info( config.json );
  console.info( "node version: %s, platform: %s", process.version, process.platform );
  process.exit();
}


//overwrite console.log
var logFile   = fs.createWriteStream(path.join(config.log_folder, (moment().format("YYYY-MM-DD")) + '.log'), { flags: 'a' });
var logStdout = process.stdout;
var errStdout = process.stderr;

console.logStdout = console.log;
console.errStdout = console.error;

console.log = function () {
	var logLineDetails = ((new Error().stack).split("at ")[2]).trim();
	logLineDetails     = logLineDetails.split("www/")[1];
    var prefix = new Date().toLocaleString() + ", " + logLineDetails + "\n  ";
    
    if( config.is_in_debug_mode === true  )
        logStdout.write  ( prefix + util.format.apply(null, arguments) + '\n');

    logFile.write( prefix + util.format.apply(null, arguments) + '\n');
}

console.warn = console.log;

console.error = function( msg, err ){
	console.log( msg );
	if( err && err.stack )
		console.log( err.stack );
}

console.debug = function( msg ){
    try{
        throw new Error( msg );
    }catch( err ){
        console.logStdout( err.stack );
    }
}

console.info = console.log;

config.logStdout = logStdout;
config.logFile   = logFile;
config.outStream = logStdout;

if( config.is_in_debug_mode == true )
  config.outStream = logFile
  
  
//MUSA
config.sla = tools.merge( {
    "active_check_period"   : 5,
    "violation_check_period": 5
}, config.sla);
  
module.exports = config;
