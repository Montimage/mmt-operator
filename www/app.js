//expressjs
const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//core
const path = require('path');
const compress = require('compression');
const util = require('util');
const moment = require('moment');
const fs = require('fs');
const child_process = require("child_process");
const os = require("os");

global.rootRequire = name => require(`${__dirname}/${name}`);
global.libRequire = name => require(`${__dirname}/libs/${name}`);

const config = require("./libs/config");
const routes = require('./routes/index');
const chartRoute = require('./routes/chart');
const api = require('./routes/api');
const probeRoute = require('./routes/probe-server.js');

const mmtAdaptor = require('./libs/dataAdaptor');
const DBC = require('./libs/DataDB');
const AdminDB = require('./libs/AdminDB');
const Probe = require('./libs/Probe');
const constant = require('./libs/constant.js');
const ReportReader = require('./reportReader/ReportReader.js');
const interProcCache = require('./libs/InterProcessCache.js');

process.title = "mmt-operator";
console.log("Start MMT-Operator");
console.info(config.json);

console.log("[INFO] NodeJS version: %s, OS: %s-%s", process.version, os.type(), os.release());

console.logStdout("[INFO] MMT-Operator version %s is listening on port %d ...\n", config.version, config.port_number);

const dbconnector = new DBC();
dbconnector.config = config;

const dbadmin = new AdminDB();
const probe = new Probe();

const app = express();
app.config = config;

var socketio = require('socket.io')();
app.socketio = socketio;

var _objRef = {
	socketio: socketio,
	config: config,
	dbconnector: dbconnector,
	dbadmin: dbadmin,
	probe: probe,
	__base: __dirname + '/'
};

//define a global variable
global._mmt = _objRef;

probeRoute.socketio = socketio;
probeRoute.config = config;
probeRoute.dbconnector = dbconnector;
probeRoute.dbadmin = dbadmin;

routes.socketio = socketio;
routes.config = config;
routes.dbconnector = dbconnector;
routes.dbadmin = dbadmin;
routes.probe = probe;

chartRoute.socketio = socketio;
chartRoute.config = config;
chartRoute.dbconnector = dbconnector;

api.socketio = socketio;
api.config = config;
api.dbconnector = dbconnector;

var pub_sub = null;
switch (config.input_mode) {
	case constant.REDIS_STR:
		pub_sub = require("./libs/redis");
		break;
	case constant.KAFKA_STR:
		pub_sub = require("./libs/kafka");
		break;
	default:

}

if (config.input_mode !== constant.NONE_STR ){
	//start report reader
	const reportReader = new ReportReader();
	reportReader.start();
} else {
	console.info("Disable input");
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(compress());
app.use(express.static(path.join(__dirname, 'public'), {
	lastModified: true,
	//Set the max-age property of the Cache-Control header in milliseconds: 5minutes
	maxAge: 5 * 60 * 1000
}));
//share js libraries 
app.use('/_js', require("./routes/server2client.js"));

//a proxy to access outside API to avoid CORS
app.use('/proxy', require("./routes/proxy.js"));

//log http req/res
morgan.token('time', function(req, res) { return moment().format("HH:mm:ss"); });
app.use(morgan(':time :method :url :status :response-time ms - :res[content-length]', {
	stream: config.outStream
})
);

//limit size of file to upload
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: false }));
app.use(cookieParser());


app.use(session({
	cookie: { maxAge: 4 * 60 * 60 * 1000 }, //4h
	secret: 'mmt2montimage',    //hash code to generate cookie
	resave: true,
	saveUninitialized: true,
}));


//active checking for MUSA
//TODO to remove in final product
if (config.isSLA) {
	/*
	  //module to check preodically if components of apps are available
	  require("./routes/musa/active_check.js").start( pub_sub, dbconnector );
	*/

	//module to verify preodically if the current data are violdated
	//const engine = require("./routes/musa/violation_check_engine.js");
	//engine.start( pub_sub, dbconnector );
	//app.use("/musa/dummy", engine.router );
	/*  
	  //require("./routes/musa/reaction_manager.js").start( pub_sub, dbconnector );
	  
	  const reaction = require("./routes/musa/reaction.js");
	  reaction.pub_sub     = pub_sub;
	  reaction.dbconnector = dbconnector;
	  app.use("/musa/sla", reaction);
	  
	  
		const musaStatus = require("./routes/musa/status.js");
		musaStatus.pub_sub     = pub_sub;
		musaStatus.dbconnector = dbconnector;
		app.use("/", musaStatus);
	   
		  
	  //2 factors authentication for Luhstansa case study
	  require("./routes/musa/2factors.js").start( pub_sub, dbconnector );
	
	*/

	const sla = require("./routes/musa/sla.js");
	sla.dbconnector = dbconnector;
	app.use("/musa/sla", sla);

	const connector = require("./routes/musa/connector.js");
	connector.dbconnector = dbconnector;
	app.use("/musa/connector", connector);


}



routes.dbConnectionString = 'mongodb://' + config.database_server + ':27017/mmt-admin';
routes.dbconnector = dbconnector;
app.use('/', routes);
app.use('/chart/', chartRoute);

app.use('/ip', require("./routes/ip2loc.js"));

api.dbconnector = dbconnector;
app.use('/api', api);

const restful = require('./routes/restful.js');
restful.dbconnector = dbconnector;
app.use('/restful', restful);

app.use("/a_api", require("./routes/a_api.js"));

app.use("/info/os", require("./routes/info/os"));

app.use("/info/file", require("./routes/info/file.js"));

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

const dummy = require("./routes/dummy_report.js");
dummy.pub_sub = pub_sub;
app.use("/dummy", dummy);

require('./routes/auto/index.js')(app, _objRef);

function license_alert() {
	dbadmin.getLicense(function(err, msg) {
		if (err || msg == null) {
			//TODO
			return console.warn("Not found Licence information");
		}

		var ts = msg[mmtAdaptor.LicenseColumnId.EXPIRY_DATE];
		var now = (new Date()).getTime();
		var expire_time = (new Date(ts)).toString();

		console.log("Licence expired on ", expire_time);

		if (ts - now <= 15 * 24 * 60 * 60 * 1000) { //15day
			var alert = null;

			if (ts < now)
				alert = { type: "error", html: "License expired on <br/>" + expire_time };
			else
				switch (msg[mmtAdaptor.LicenseColumnId.LICENSE_INFO_ID]) {
					case 1:
						alert = { type: "error", html: "Buy license for this device!" };
						break;
					case 2:
						alert = { type: "error", html: "License expired on <br/>" + expire_time };
						break;
					case 3:
						alert = { type: "danger", html: "License will expire on <br/>" + expire_time };
						break;
					case 4:
						alert = { type: "danger", html: "License file was modified!" };
						break;
					case 5:
						alert = { type: "danger", html: "License file does not exist!" };
						break;
					case 6:
						alert = { type: "success", html: "License will expire on <br/>" + expire_time };
						break;
				}

			if (ts - now <= 5 * 24 * 60 * 60 * 1000)
				alert.type = "error";

			if (alert != null) {
				socketio.emit("log", alert);
				console.log(alert);
			}
		}

		var interval = 60 * 60 * 1000;//check each hour
		setTimeout(license_alert, interval);
	});
}
license_alert();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found: ' + req.originalUrl);
	err.status = 404;
	next(err);
});

function processError(err) {
	console.trace();
	console.error(err);

	//hide stack
	err.stack = null;
	err.status = 0;
	switch (err.message) {
		case "Not connected":
			err.message = "Cannot connect to Database";
			break;
	}
	switch (err.name) {
		case "MongoError":
		case "MongoNetworkError":
			err.message = "Cannot connect to Database";
			break;
	}
}

// the last routine handler which is called when no routine above is satisfied
// error handler
app.use(function(err, req, res, next) {
	processError(err);
	res.render('error', { message: err.message, error: err });
});


function exitChildProcess() {
	//wait for child processes
	//this list is created in "reportReader/ReportReader.js"
	if (process._children) {
		for (var i = 0; i < process._children.length; i++)
			process._children[i].stop();
	}
	process._children = false;
}


process.stdin.resume();//so the program will not close instantly


//clean up
var isExiting = false;
function exitHandler(options, exitCode) {

	//pressing Ctr+C again when being existing
	if( isExiting && exitCode == 2){
		//force to exit
		console.logStdout("Exit now. Bye");
		process.exit( 1 );
		return;
	}
	
	isExiting = true;
	
	console.logStdout("\nCleaning up before exiting ... ");
	
	function _exit(){
		console.logStdout("Bye");
		if( exitCode )
			process.exit( exitCode );
		else
			process.exit();
	}

	try {
		//exit all child processes
		exitChildProcess();

		//reset state of db-backup to default
		dbadmin.connect(function(err, db) {
			if (err){
				console.error(err);
				_exit();
				return;
			}

			db.collection("db-backup").update({ _id: 1 }, {
				$set: {
					isBackingUp: null,
					isRestoring: null
				}
			}, {
				upsert: true
			}, function() {
				if (dbconnector) {
					dbconnector.close(_exit);
					return;
				}
				_exit();
			});
		});

	} catch (err) {
		console.error("Error while quiting");
		console.error(err);
		_exit();
	}
}

process.abort = exitHandler;

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }, 0));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { cleanup: true }, 2));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }, 10));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }, 12));

//catches uncaught exceptions
process.on('uncaughtException', (err) => {
	console.error("uncaughtException");
	console.error(err);
	exitHandler({}, 1);
});

module.exports = app;
