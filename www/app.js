var VERSION         = "v0.5.0-a6cd9d0";

var express         = require('express');
var session         = require('express-session')
const MongoStore    = require('connect-mongo')(session);
var path            = require('path');
var favicon         = require('serve-favicon');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var compress        = require('compression');
var util            = require('util');
var moment          = require('moment');
var fs              = require('fs');

var config          = require("./config.json");

var routes          = require('./routes/index');
var chartRoute      = require('./routes/chart');
var api             = require('./routes/api');
var probeRoute      = require('./routes/probe-server.js');

var mmtAdaptor      = require('./libs/dataAdaptor');
var dbc             = require('./libs/mongo_connector');
var AdminDB         = require('./libs/admin_db');
var Probe           = require('./libs/probe');

config.version = VERSION;
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

console.log( "node version: %s, platform: %s", process.version, process.platform );

console.logStdout("MMT-Operator version %s is running on port %d ...", VERSION, config.port_number );

console.log( "configuration: " + JSON.stringify( config, null, "   " ) );



var dbconnector = new dbc( {
    connectString: 'mongodb://'+ config.database_server +':27017/mmt-data-' + config.probe_analysis_mode
});

dbconnector.config = config;

var dbadmin = new AdminDB( 'mongodb://'+ config.database_server +':27017/mmt-admin' );
var probe   = new Probe( config.probe_analysis_mode );

var app = express();
app.config = config;

var socketio = require('socket.io')();
app.socketio        = socketio;

probeRoute.socketio    = socketio;
probeRoute.config      = config;
probeRoute.dbconnector = dbconnector;
probeRoute.dbadmin     = dbadmin;

routes.socketio        = socketio;
routes.config          = config;
routes.dbconnector     = dbconnector;
routes.dbadmin         = dbadmin;
routes.probe           = probe;

chartRoute.socketio    = socketio;
chartRoute.config      = config;
chartRoute.dbconnector = dbconnector;

api.socketio           = socketio;
api.config             = config;
api.dbconnector        = dbconnector;

var redis = require("redis");

if( config.input_mode == REDIS_STR ){
    redis._createClient = redis.createClient;
    redis.createClient = function(){
        return redis._createClient(6379, config.redis_server, {});
    }

    probeRoute.startListening(dbconnector, redis);
}
else{
    probeRoute.startListeningAtFolder( dbconnector, config.data_folder);
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(compress());
app.use(express.static(path.join(__dirname, 'public'),{
    maxAge: 30*24*60*60*1000,    //30 day
    lastModified: true
}));
//log http req/res
morgan.token('time', function(req, res){ return  moment().format("YYYY-MM-DD");} )
app.use(morgan(':time :method :url :status :response-time ms - :res[content-length]',
               {stream: (config.is_in_debug_mode === true )? logStdout : logFile
               }
              )
       );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    cookie: { maxAge: 4*60*60*1000 }, //4h
    secret: 'mmt2montimage',    //hash code to generate cookie
    resave: true, saveUninitialized: true,
    store : new MongoStore({
        url       : dbadmin.connectString,
        touchAfter: 60, //lazy session update, time period in seconds
        collection: "_expressjs_session",
        ttl       : 14 * 24 * 60 * 60 // = 14 days. Default
    })
}))


routes.dbConnectionString = 'mongodb://'+ config.database_server +':27017/mmt-admin';
routes.dbconnector        = dbconnector;
app.use('/', routes);
app.use('/chart/', chartRoute);

api.dbconnector = dbconnector;
app.use('/traffic', api);

function license_alert(){
    dbadmin.getLicense( function( err, msg){
        if( err || msg == null ){
            //TODO
            //throw new Error("No License");
        }

        var ts  = msg[mmtAdaptor.LicenseColumnId.EXPIRY_DATE];
        var now = (new Date()).getTime();
        console.log( "time", ts - now );
        if( ts - now <= 15*24*60*60*1000 ){ //15day
            var alert       = null;
            var expire_time = (new Date( ts )).toString();
            switch( msg[ mmtAdaptor.LicenseColumnId.LICENSE_INFO_ID ] ){
                case 1:
                    alert = {type: "error", html: "Buy license for this device!"};
                    break;
                case 2:
                    alert = {type: "error", html: "License expired on <br/>" + expire_time};
                    break;
                case 3:
                    alert = {type: "danger", html: "License will expire on <br/>" + expire_time};
                    break;
                case 4:
                    alert = {type: "danger", html: "License file was modified!"};
                    break;
                case 5:
                    alert = {type: "danger", html: "License file does not exist!"};
                    break;
                case 6:
                    alert = {type: "success", html: "License will expire on <br/>" + expire_time};
                    break;
            }

            if( ts - now <= 5*24*60*60*1000 )
                alert.type = "error";

            if( alert != null){
                socketio.emit("log", alert);
                console.log( alert );
            }
        }

        var interval = 60*60*1000;//check each hour
        setTimeout( license_alert, interval );
    });
}
license_alert();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
    console.error( err );

    res.status(err.status || 500);
    if(config.is_in_debug_mode !== true)
        err.stack = {};

    res.render('error', {message: err.message, error: err} );
});

process.on('uncaughtException', function (err) {
    console.error( err );

    if( err.response ){
        if(config.is_in_debug_mode !== true)
            err.stack = {};

        err.response.render('error', {message: err.message, error: err} );
    }
});

function exit(){
    setTimeout( function(){
        console.log("bye!\n");
        console.logStdout("Bye!\n");
        process.exit(1);
    }, 2000 );
}

//clean up
function cleanup ( cb ){
    console.log( "Cleaning up before exiting... ");
    console.logStdout( "\nCleaning up before exiting ... ");
    if( dbconnector ){
        dbconnector.close( exit );
    }
};


process.on('SIGINT',function(){
    try{
          cleanup();
    }catch( err ){
        console.error( err );
        exit();
    }
});


module.exports = app;
