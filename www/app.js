var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var chartRoute = require('./routes/chart');
var api = require('./routes/api');

var mmtAdaptor = require('./libs/dataAdaptor');
var dbc = require('./libs/mongo_connector');
var dbconnector = new dbc( {connectString: 'mongodb://192.168.0.37:27017/test'});

var app = express();

var io = require('socket.io')();

app.io = io;


var redis = require("redis");
var report_client = redis.createClient(6379, '192.168.0.37', {});
report_client.subscribe("protocol.stat");
report_client.subscribe("radius.report");
report_client.subscribe("microflows.report");
report_client.subscribe("flow.report");
report_client.subscribe("web.flow.report");
report_client.subscribe("ssl.flow.report");
report_client.subscribe("rtp.flow.report");

report_client.on('message', function(channel, message) {
    console.log( message );
	message = mmtAdaptor.formatReportItem(JSON.parse(message));
	//this is for test purpose only: to create two different probeID
	//message.probe += Math.round(Math.random()); //==> either 0 or 1
    //console.log( message );
	dbconnector.addProtocolStats(message, function(err, msg) {
	});
});

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


module.exports = app;
