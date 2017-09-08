/**
 * Read reports from csv files and save to DB  
 */


"use strict";

//
const fs           = require('fs');
const path         = require('path');
const lineReader   = require('readline');

//libs
const config         = require("../libs/config");
const tools          = require("../libs/tools");
const DBInserter     = require('./DBInserter');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");

//total number of reader processes
const TOTAL_READERS = process.argv[3];
//index of the current process
const READER_INDEX  = process.argv[2];
const DATA_FOLDER               = config.file_input.data_folder;
const DELETE_FILE_AFTER_READING = config.file_input.delete_data;

const database = new DataBase();
const dbadmin  = new DBInserter( config.adminDatabaseName );
const processMessage = new ProcessMessage( database );

// ensure data directory exists
if( !fs.existsSync( DATA_FOLDER ) ){
	console.error("Error: Data folder [" + DATA_FOLDER + "] does not exists.");
	process.exit( 1 );
}

if( READER_INDEX == 0 )
   process.stdout.write("\n"+ TOTAL_READERS +" csv readers is waiting for data in the folder [" + DATA_FOLDER + "] ...\n");

console.info( "start csv reader " + READER_INDEX );

//load list of read csv file from db
var read_files = [];
//=READER_INDEX to ensure that all processes do not clean garbage in the same time
//var fileCounter = READER_INDEX;

function process_file (file_name, cb) {
	const lr = lineReader.createInterface({
		input: fs.createReadStream( file_name )
	});
	var totalLines = 0;
	var hasError   = false;
	var start_ts = tools.getTimestamp();

	lr.on ('line', function (line) {
		// 'line' contains the current line without the trailing newline character.
		try{
		   //_TODO: re-enable this
			processMessage.process( line );
		}catch( e ){
			console.error( "Error when processing line " + totalLines + " of file " + file_name, e );
			hasError = true;
		}
		line = null;
		totalLines ++;
	});

	lr.on('close', function () {
		// All lines are read, file is closed now.
		console.info( READER_INDEX + " processed file "+ path.basename(file_name) +" ("+ totalLines +" lines, "+ (tools.getTimestamp() - start_ts) +" ms)");
		
		//periodically clean garbage
		//=> NO NEED
		//fileCounter ++;
		//if( fileCounter === 50 ){
		//   fileCounter = 0;
		//   if( global && global.gc )
		//      global.gc();
		//}
		
		
		//delete data file
		if( DELETE_FILE_AFTER_READING ){
			//remove semaphore file
			fs.unlink( file_name + ".sem", function(err){
				if( err ) console.error( err );
				
				//remove csv file only when there are no errors
				if( !hasError )
					fs.unlink( file_name, function( e ){
						if( err ) console.error( err );
						cb( totalLines );
					});
				else{
					cb( totalLines );
				}
			});
		}
		else{
			read_files.push( file_name );
			dbadmin.add("read-files", [{"file_name": file_name}], function(){
				cb( totalLines );
			});
		}
	});
};


var isStop = false;
//list of csv files to be read
var _cache_files = [];
//get the oldest file containing data and not beeing locked
function get_csv_file(dir) {
   if( isStop )
      return null;
   
	if( _cache_files.length > 0){
		//delete the first element from _cache_files and return the element
		return _cache_files.splice(0, 1)[0];
	}

	//Returns an array of filenames excluding '.' and '..'.
	var files = fs.readdirSync(dir);
	var arr = []; //will contain list of csv files

	for (var i=0; i<files.length; i++) {
		var file_name = files[i];

		//filename format: timestamp_threadid_name.csv
		//  1500992643_10_dataoutput.csv
		var thread_index = file_name.split("_")[1];
		
		//process only some csv files
		if( thread_index % TOTAL_READERS != READER_INDEX  )
			continue

			//file was read (check in database when the read files are not deleted)
			if( DELETE_FILE_AFTER_READING !== true )
				if( read_files.indexOf( dir + file_name ) > -1 )
					continue;

		//need to end with csv
		if (file_name.match(/csv$/i) == null)
			continue;

		//check if there exists its semaphore
		if ( files.indexOf( file_name + ".sem" ) > -1 )
			arr.push(dir + file_name);
	}

	if( arr.length == 0 )
		return null;

	//sort by ascending of file name
	_cache_files = arr.sort();

	//delete the first element from _cache_files and return the element
	return _cache_files.splice(0, 1)[0];
};


var process_folder = function () {
	var file_name = get_csv_file( DATA_FOLDER );
	if (file_name == null) {
	   //if threre is no report => wait for 0.5 second
		setTimeout(process_folder, 500);
		return;
	}
	try{
		process_file(file_name, function () {
			process_folder();
		});
	}catch( ex ){
		console.error( ex );
		process_folder();
	}
};

//need to delete .csv and .sem files after reading
if( DELETE_FILE_AFTER_READING ){
	//start after 2 seconds
	setTimeout( process_folder, 2000);
}else{
	//connect to DB to store list of read files
	var start_process = function(){
		return process_folder();
		dbadmin.connect( function( err, mdb ) {
			if( err ){
				throw new Error( "Cannot connect to mongoDB" );
				process.exit(0);
			}
			mdb.collection("read-files").find().toArray( function(err, doc){
				read_files = [];
				for(var i in doc)
					read_files.push( doc[i].file_name );
				process_folder();
			});
		});
	};

	setTimeout( start_process, 2000);
}

process.stdin.resume();//so the program will not close instantly
//Ctrl+C
process.on('SIGINT',function(){
   //press Ctrl+C again
   if( isStop )
      process.exit( 1 );
   
   isStop = true;
   database.flush( function(){
      console.error("Ended csv reader " + READER_INDEX );
      process.exit();
   } );
});