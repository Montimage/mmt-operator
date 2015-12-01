var express         = require('express');
var session         = require('express-session')
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');

var routes          = require('./routes/index');
var chartRoute      = require('./routes/chart');
var api             = require('./routes/api');

var socketRoute     = require('./routes/socketio.js');
var probeRoute      = require('./routes/probe-server.js');

var mmtAdaptor      = require('./libs/dataAdaptor');
var dbc             = require('./libs/mongo_connector');
var config          = require("./config.json");

var REDIS_STR = "redis",
    FILE_STR  = "file";

if( config.input_mode != REDIS_STR && config.input_mode != FILE_STR)
    config.input_mode = FILE_STR;

console.log( "configuration: " + JSON.stringify( config, null, "   " ) );

if( config.is_in_debug_mode !== true ){
    console.log = function( obj ){};
}

var dbconnector = new dbc( {
    connectString: 'mongodb://'+ config.database_server +':27017/mmt-data'
});

var app = express();

var io = require('socket.io')();

app.io = io;


var redis = require("redis");

socketRoute.start_socketio( io );

probeRoute.route_socketio = socketRoute.emit_data;

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
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    cookie: { maxAge: 30*60*1000 },
    secret: 'mmt2montimage'
}))


routes.dbConnectionString = 'mongodb://'+ config.database_server +':27017/mmt-admin';

app.use('/', routes);
app.use('/chart/', chartRoute);

api.dbconnector = dbconnector;
app.use('/traffic', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


function exit(){
    console.log("bye!\n");
    setTimeout( function(){
        process.exit(1);
    }, 2000 );
}

//clean up
function cleanup ( cb ){
    console.log( "\nCleaning up before exiting... ");
    if( dbconnector )
        dbconnector.flushCache( exit );
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
