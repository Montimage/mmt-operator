const { spawn } = require('child_process');

if( global.__exec_script_database == undefined )
	global.__exec_script_database = {};
const database = global.__exec_script_database;

function exec(command, args, options ){
	if( database[command] == undefined )
		database[command] = {};

	const db = database[command];
	//only one can be executed at time
	if( db.isRunning )
		return false;

	db.isRunning = true;
	db.time = {start: new Date()};
	//full execution log
	db.log = {
		stdout: [],
		stderr: []
	}
	//cache of log between 2 consecutive status's queries
	db.cacheLog = {
		stdout : [ command, args ],
		stderr : []
	}
	
	const ps = spawn( command, args, options );

	ps.stdout.on('data', (data) => {
		//db.log.stdout.push( data );
		data = data.toString();
		db.cacheLog.stdout.push( data );
	});

	ps.stderr.on('data', (data) => {
		data = data.toString();
		db.cacheLog.stderr.push( data );
	});

	ps.on('close', (code) => {
		//when the process is killed => considered as success
		db.exitCode = code;
		if( db.exitCode == null )
			db.exitCode = 0;

		db.isRunning = false;
		db.time.end = new Date();
		delete( db.process );
	});
	
	ps.on('error', (err) => {
		db.cacheLog.stderr.push( err.message );
		db.exitCode = -1;
		db.isRunning = false;
		db.time.end = new Date();
		delete( db.process );
	});
	
	db.process = ps;
	return status( command );
}


function status( command ){
	console.log( "status " + command);
	if( database[command] == undefined )
		return {};
	const db = database[command];
	//console.log( db );
	const ret = {
		isRunning: db.isRunning,
		stdout   : db.cacheLog.stdout,
		stderr   : db.cacheLog.stderr
	};
	//clear cache log
	db.cacheLog.stdout = [];
	db.cacheLog.stderr = [];
	
	ret.time = {
		start : db.time.start,
		now   : new Date()
	}
	
	if( ! db.isRunning ){
		ret.exitCode = db.exitCode;
		ret.time.end = db.time.end;
	}
	return ret;
}

function stop( command, signal ){
	console.log( "status " + command);
	if( database[command] == undefined )
		return;
	const db = database[command];
	if( db.process == undefined )
		return;
	if( signal == undefined )
		signal = 'SIGTERM';
	db.process.stdin.pause();
	db.process.kill(signal);
}

module.exports = {
	exec: exec,
	status: status,
	stop: stop
}