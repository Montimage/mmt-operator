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

if( config.log_folder == undefined )
    config.log_folder = __dirname + '/log';


// ensure log directory exists
fs.existsSync( config.log_folder ) || fs.mkdirSync( config.log_folder )
//overwrite console.log
var logFile   = fs.createWriteStream(config.log_folder + '/' + (moment().format("YYYY-MM-DD")) +'.log', { flags: 'a' });
var logStdout = process.stdout;

console.logStdout = console.log;

console.log = function () {
    var prefix = moment().format("h:mm:ss") + " " ;
    if( config.is_in_debug_mode === true  )
        logStdout.write  ( prefix + util.format.apply(null, arguments) + '\n');

    logFile.write( prefix + util.format.apply(null, arguments) + '\n');

}

console.error = function( err ){
    if( err == undefined ) return;
    console.log( arguments );
    console.log( err.stack );
}

console.debug = function( msg ){
    try{
        throw new Error( msg );
    }catch( err ){
        console.logStdout( err.stack );
    }
}

config.logStdout = logStdout;
config.logFile   = logFile;

module.exports = config;
