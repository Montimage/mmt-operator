var config  = require("../config.json"),
    fs      = require("fs"),
    util    = require("util"),
    moment  = require('moment');;

//config parser
var REDIS_STR = "redis",
    FILE_STR  = "file";

if( config.input_mode != REDIS_STR && config.input_mode != FILE_STR)
    config.input_mode = FILE_STR;

if( isNaN( config.port_number ) || config.port_number < 0 )
    config.port_number = 80;

function set_default_value( variable, prop, value ){
  if( variable[prop] == undefined )
    variable[prop] = value;
}

if( config.log_folder == undefined )
    config.log_folder = __dirname + '/log';

if( config.probe_analysis_mode != "online" && config.probe_analysis_mode != "offline" )
  config.probe_analysis_mode = "offline";

set_default_value( config, "database_server", {} );

set_default_value( config.database_server, "host", "127.0.0.1" );
set_default_value( config.database_server, "port", 27017 );

set_default_value( config.redis_server, "host", "127.0.0.1" );
set_default_value( config.redis_server, "port", 6379 );


// ensure log directory exists
fs.existsSync( config.log_folder ) || fs.mkdirSync( config.log_folder )
//overwrite console.log
var logFile   = fs.createWriteStream(config.log_folder + '/' + (moment().format("YYYY-MM-DD")) +'.log', { flags: 'a' });
var logStdout = process.stdout;

console.logStdout = console.log;

console.log = function () {
    var prefix = moment().format("HH:mm:ss") + " " ;
    if( config.is_in_debug_mode === true  )
        logStdout.write  ( prefix + util.format.apply(null, arguments) + '\n');

    logFile.write( prefix + util.format.apply(null, arguments) + '\n');
}

console.error = function( err ){
    if( err == undefined ) return;
    console.log( arguments );
    if( err.stack )
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

console.log( "Start MMT-Operator" );
console.info( JSON.stringify( config ) );

config.logStdout = logStdout;
config.logFile   = logFile;

module.exports = config;
