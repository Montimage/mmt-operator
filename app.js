/**
 * This is main program of MMT-Operator.
 * It is an intermediate among MMT-Probe, MMT-Drop and Database. Specifically:
 * 1. It receives data in real-time from MMT-Probe though Redis via publish/subscribe.
 *      Then it stores the received data into DB using either Sqlite or MongoDB.
 *      The data are also transfered to all MMT-Drop that are connecting with.
 * 2. It queries data from DB and responses to MMT-Drop when MMT-Drop requests
 * 3. It setups an HTTP server for MMT-Drop.
 * 
 */

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var io = require('socket.io');
var moment = require('moment');
var mmtAdaptor = require('./js/dataAdaptor.js');

//The process object is a global object and can be accessed from anywhere.
process.on('uncaughtException', function(err) {
	  console.log('Caught exception: ' + err);
	  console.trace();
});


// Parser running parameters
var argv = require('optimist')
		.usage('Run MMT Operator.\nUsage: $0')
		.demand('d')
		.alias('d', 'db')
		.describe('d',
				'Indicates the data base to use. Must be one of [mongo, sqlite]').argv;

////////////////////////////////////////////////////////////////////////////////////////////
// Receive real-time data from MMT-Probe and insert them into database
////////////////////////////////////////////////////////////////////////////////////////////

var dbconnector = null;
if (argv.db === 'mongo') {
	var dbc = require('./js/mongo_connector');
	dbconnector = new dbc();
} else if (argv.db === 'sqlite')
	dbconnector = require('./js/sqlite_connector');
else
	throw (new Error(
			'Unsopported database type. Database must be one of [sqlite, mongo]'));

var redis = require("redis");
var report_client = redis.createClient();
report_client.subscribe("protocol.stat");
report_client.subscribe("radius.report");
report_client.subscribe("microflows.report");
report_client.subscribe("flow.report");
report_client.subscribe("web.flow.report");
report_client.subscribe("ssl.flow.report");
report_client.subscribe("rtp.flow.report");

report_client.on('message', function(channel, message) {
	message = mmtAdaptor.formatReportItem(JSON.parse(message));
	//this is for test purpose only: to create two different probeID
	//message.probe += Math.round(Math.random()); //==> either 0 or 1
	dbconnector.addProtocolStats(message, function(err, msg) {
	});
});

////////////////////////////////////////////////////////////////////////////////////////////



/**
 * Constants: MMT Response codes
 */
var mmtCode = {
	OK : 1000,
	ResourceNotFound : 1101,
	ParameterError : 1102,
	InternalError : 1103,
};

var mmtErrMsg = {
	ResourceNotFoundMsg : "Resource not found",
	ParameterErrorMsg : "Parameter error",
	InternalErrorMsg : "Internal error",
};


////////////////////////////////////////////////////////////////////////////////////////////
// Setup an HTTP server
////////////////////////////////////////////////////////////////////////////////////////////
app.set('port', process.env.PORT || 8088);
app.use(express.favicon());
//To use our own favicon instead of Express's default one
//app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
	console.log(err);
	if (!err || !err.http_code)
		err = mmtError(400, mmtCode.ParameterError, err.message);
	res.send(err.http_code, {
		error : {
			message : err.message,
			code : err.err_code
		}
	});
})

////// C U S T O M   E R R O R  /////
function mmtError(http_code, err_code, err_message) {
	err = new Error(err_message);
	err.http_code = http_code;
	err.err_code = err_code;
	return err;
}

//Default page
app.get('/', function(req, res, next) {
	res.redirect('/index.html');
});

//info
console.log("\nMMT-Operator is listening at port " + app.get('port') + " ....");
////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////
//Response to requests of MMT-Drop
////////////////////////////////////////////////////////////////////////////////////////////
var PERIOD = {
	MINUTE : "minute",
	HOUR : "hour",
	DAY : "day",
	WEEK : "week",
	MONTH : "month"
};

function getOptionsByPeriod(period) {
	var retval = {
		collection : 'traffic',
		time : moment().valueOf() - 600 * 1000
	};
	if (period === PERIOD.HOUR) {
		retval = {
			collection : 'traffic_min',
			time : moment().valueOf() - 3600 * 1000
		};
	} else if (period === PERIOD.DAY) {
		retval = {
			collection : 'traffic_hour',
			time : moment().valueOf() - 24 * 3600 * 1000
		};
	} else if (period === PERIOD.WEEK) {
		retval = {
			collection : 'traffic_hour',
			time : moment().valueOf() - 7 * 24 * 3600 * 1000
		};
	} else if (period === PERIOD.MONTH) {
		retval = {
			collection : 'traffic_day',
			time : moment().valueOf() - 30 * 24 * 3600 * 1000
		};
	}
	return retval;
}

/**
 * API for responding requests of MMT-Drop
 */
app.get('/traffic/data', function(request, response, next) {
	var period = request.query.period || PERIOD.MINUTE;
	options = getOptionsByPeriod(period);

	//default values
	options.format = 99;
	options.raw    = true;
	options.probe  = [];
	options.source = [];
	
	if (request.query.format)
		options.format = parseInt(request.query.format);
	
	if (request.query.raw)
		options.raw = (request.query.raw === 'true');
	
	if (request.query.probe instanceof Array){
		request.query.probe.forEach( function (e){
			options.probe.push (parseInt(e));
		});
	}
	
	if (request.query.source instanceof Array){
		request.query.source.forEach( function (e){
			options.source.push ("'" + e  + "'") ; //TODO avoid sql injection here
		});
	}
	
	console.log(options);
	

	dbconnector.getProtocolStats(options, function(err, data) {
		if (err) {
			return next(err);
		}
		//this allow a request coming from a different domain
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Content-Type", "application/json");
		response.send(data);
	});
});
////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////
//API for real-time emitting data to MMT-Drop
////////////////////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app);
io = io.listen(server);
io.set('log level', 1); //warning + errors
server.listen(app.get('port'));

io.sockets.on('connection', function(client) {
	var sub = redis.createClient();

	sub.psubscribe("*flow.report");
	
	sub.psubscribe("*.stat");
	sub.subscribe("endperiod");

	sub.on("pmessage", function(pattern, channel, message) {
		message = JSON.parse(message);
		var msg = mmtAdaptor.formatReportItem(message);
		client.emit('stats', msg);
		
		message[3] = message[3] * 1000;
		client.emit('stats_raw', message );
	});

	sub.on("message", function(channel, message) {
		if (channel === "endperiod") {
			message = JSON.parse(message);
			client.emit('period', message);
			
			
		}
	});

	client.on("message", function(msg) {

	});

	client.on('disconnect', function() {
		sub.end();
	});

});
////////////////////////////////////////////////////////////////////////////////////////////