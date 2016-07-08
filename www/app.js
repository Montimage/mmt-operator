const VERSION         = "v0.5.0-4b76871";

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

var config          = require("./libs/config");
var redis           = require("./libs/redis");
var routes          = require('./routes/index');
var chartRoute      = require('./routes/chart');
var api             = require('./routes/api');
var probeRoute      = require('./routes/probe-server.js');

var mmtAdaptor      = require('./libs/dataAdaptor');
var DBC             = require('./libs/DataDB');
var AdminDB         = require('./libs/AdminDB');
var Probe           = require('./libs/Probe');

config.version = VERSION;
//config parser
var REDIS_STR = "redis",
    FILE_STR  = "file";

console.log( "node version: %s, platform: %s", process.version, process.platform );

console.logStdout("MMT-Operator version %s is running on port %d ...", VERSION, config.port_number );

var dbconnector = new DBC();
dbconnector.config = config;

var dbadmin = new AdminDB();
var probe   = new Probe();

var app = express();
app.config = config;

var socketio = require('socket.io')();
app.socketio        = socketio;

var _objRef = {
  socketio    : socketio,
  config      : config,
  dbconnector : dbconnector,
  dbadmin     : dbadmin,
  probe       : probe
};

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

if( config.input_mode == REDIS_STR ){
    probeRoute.startListening(dbconnector, redis);
}
else{
    probeRoute.startListeningAtFolder( dbconnector, config.data_folder);
}


//active checking for MUSA
//TODO to remove in final product
//require("./libs/active_check.js").start( redis, dbconnector );

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
               {
                 stream: config.outStream
               }
              )
       );
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: false }));
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

app.use('/ip', require("./routes/ip2loc.js"))

api.dbconnector = dbconnector;
app.use('/api', api);

app.use("/a_api", require("./routes/a_api.js"));

app.use("/info/os", require("./routes/info/os"));

var route_probe = require("./routes/info/probe");
route_probe._objRef = _objRef;
app.use("/info/probe", route_probe);

var route_conf = require("./routes/info/conf");
route_conf._objRef = _objRef;
app.use("/info/conf", route_conf);

var route_db = require("./routes/info/db");
route_db._objRef = _objRef;
app.use("/info/db", route_db);

app.use("/export", require("./routes/html2img.js"));

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
        console.logStdout("Bye!\n");
        process.exit(1);
    }, 2000 );
}

//clean up
function cleanup ( cb ){
    console.logStdout( "\nCleaning up before exiting ... ");
    //reset state of db-backup to default
    dbadmin.connect( function(err, db){
      if( err ) return console.error( err );

      db.collection( "db-backup" ).update(  {_id:1}, {
        $set : {
          isBackingUp : null,
          isRestoring : null
        }
      }, {
        upsert : true
      }, function(){
        if( dbconnector ){
            dbconnector.close( exit );
        }
      } );
    });
};


var is_existing = false;
process.on('SIGINT',function(){
    try{
      if( is_existing ){
        console.log( "MMT-Operator is being existed!");
        return;
      }
      is_existing = true;
      cleanup();
    }catch( err ){
        console.error( err );
        exit();
    }
});


module.exports = app;
