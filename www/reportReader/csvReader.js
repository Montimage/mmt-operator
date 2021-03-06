/**
 * Read reports from csv files and save to DB  
 */


"use strict";

//
const fs           = require('fs');
const path         = require('path');
const lineReader   = require('readline');
const spawn        = require('child_process').spawn;
//libs
const config         = require("../libs/config");
const tools          = require("../libs/tools");
const DBInserter     = require('./DBInserter');
const ProcessMessage = require("./ProcessMessage");
const DataBase       = require("./DataBase.js");

//after reading xx files, this process will automatically exit,
// then ReportReader will start a new process to replace this process.
//This allows to clean memory used by the readers' processes
const NB_CSV_BEFORE_RESTART = 480;
//total number of reader processes
const TOTAL_READERS = parseInt( process.argv[3] );
//index of the current process
const READER_INDEX              = parseInt( process.argv[2] );
const DELETE_FILE_AFTER_READING = config.file_input.delete_data;
//array of folders containing reports
const DATA_FOLDERS              = [];

function addDataFolder( path ){
   // ensure data directory exists
   if( !fs.existsSync( path ) )
      console.error("Ignore data folder [" + path + "] as it does not exists.");
   else
      DATA_FOLDERS.push( path );
}

if( Array.isArray( config.file_input.data_folder ))
   config.file_input.data_folder.forEach( addDataFolder );
else
   addDataFolder( config.file_input.data_folder );

//ensure there exists at least one folder
if( DATA_FOLDERS.length === 0 ){
   console.error("No data_folder is given. Please set it in 'file_input.data_folder'");
   process.exit();
}

const database = new DataBase();
const dbadmin  = new DBInserter( config.adminDatabaseName );
const processMessage = new ProcessMessage( database );

process.title = "mmt-operator-csv-reader-" + READER_INDEX;


if( READER_INDEX === 0 )
   process.stdout.write("\n"+ TOTAL_READERS +" csv readers is waiting for data in the folder(s) [" + DATA_FOLDERS + "] ...\n");

console.info( "start csv reader " + READER_INDEX );


/**
 * Restart this process
 */
function restart_process(){
   
   database.flush( function(){
      console.warn("Exit reader " + READER_INDEX );
      //the reader will be restarted by libs/child_process
      process.exit(1);
      //process.exitCode = 1
   });
}

//load list of read csv file from db
var read_files = {};

function process_file (file_name, cb) {
	const lr = lineReader.createInterface({
		input: fs.createReadStream( file_name )
	});
	
	var hasError   = false;
	var start_ts = tools.getTimestamp();
	var totalLines = 0;

	lr.on ('line', function (line) {
		// 'line' contains the current line without the trailing newline character.
		try{
			processMessage.process( line );
		}catch( e ){
			console.error( "Error when processing line " + (totalLines + 1) + " of file " + file_name, e );
			hasError = true;
		}
		line = null;
		totalLines ++;
	});

	lr.on('close', function () {
		// All lines are read, file is closed now.
		console.info( READER_INDEX + " processed file "+ path.basename(file_name) +" ("+ totalLines +" lines, "+ (tools.getTimestamp() - start_ts) +" ms)");
		
		//delete data file
		if( DELETE_FILE_AFTER_READING ){
			//remove semaphore file
			fs.unlink( file_name + ".sem", function(err){
				if( err ) console.error( err );
				
				//remove csv file only when there are no errors
				if( !hasError )
					fs.unlink( file_name, function( e ){
						if( e ) console.error( e );
						cb( totalLines );
					});
				else{
					cb( totalLines );
				}
			});
		}
		else{
		   //if the report files are not deleted by MMT-Operator
		   //=> Operator must remember the list of files that have been processed to do not process the files again
		   //
			read_files[ file_name ] = true;
			dbadmin.add("read-files", [{"file_name": file_name}], function(){
				cb( totalLines );
			});
		}
	});
}


var isStop = false;
//list of csv files to be read
var _cache_files = [];
//get the oldest file containing data and not beeing locked
function get_csv_file() {
   if( isStop )
      return null;
   
	if( _cache_files.length > 0){
		//delete the first element from _cache_files and return the element
		return _cache_files.splice(0, 1)[0];
	}

	var arr = []; //will contain list of csv files
	
	//for each folder in the list
	DATA_FOLDERS.forEach( function( dir ){

	   //Returns an array of filenames excluding '.' and '..'.
	   var files = fs.readdirSync(dir);

	   for (var i=0; i<files.length; i++) {
	      var file_name = files[i];

	      //filename format: timestamp_threadid_name.csv
	      //  1500992643_10_dataoutput.csv
	      var thread_index = file_name.split("_")[1];

	      //process only some csv files
	      if( thread_index % TOTAL_READERS !== READER_INDEX  )
	         continue;

	         //file was read (check in database when the read files are not deleted)
	         if( DELETE_FILE_AFTER_READING !== true )
	            if( read_files[ dir + file_name ] === true )
	               continue;

	      //need to end with csv
	      if (file_name.match(/csv$/i) == null)
	         continue;

	      //check if there exists its semaphore
	      if ( files.indexOf( file_name + ".sem" ) > -1 )
	         arr.push(dir + file_name);
	   }
	});
	
	//no reports
	if( arr.length === 0 )
		return null;

	//sort by ascending of file name
	_cache_files = arr.sort();

	//delete the first element from _cache_files and return the element
	return _cache_files.splice(0, 1)[0];
}

//=READER_INDEX to ensure that all processes do not clean garbage in the same time
var fileCounter = 0;
const process_folder = function () {
	var file_name = get_csv_file();
	if (file_name == null) {
	   //if threre is no report => wait for 0.5 second
		setTimeout(process_folder, 500);
		return;
	}
	try{
		process_file(file_name, function () {
		   //restart this reader after reading xx, e.g., 48, csv files
		   //4 csv readers read result from 16 probe threads
		   // => each reader reads 4 csv in 5 seconds
		   // => each reader reads 48 csv in 1 minute
		   
		   if( fileCounter >= NB_CSV_BEFORE_RESTART ){
		      restart_process();
		   }else{
		      fileCounter ++;
		      process_folder();
		   }
		});
	}catch( ex ){
		console.error( ex );
		process_folder();
	}
};

//start processing when database is connected
database.onReady( function(){
   let start_process = process_folder;
   
	//need to delete .csv and .sem files after reading
	if( !DELETE_FILE_AFTER_READING ){
	   
		//connect to DB to get the list of read files
	   start_process = function(){
			dbadmin.onReady( function( mdb ) {
				mdb.collection("read-files").find().toArray( function(err, doc){
					read_files = {};
					for(var i in doc)
						read_files[ doc[i].file_name ] = true;
					
					//start processing csv files
					process_folder();
				});
			});
		};
	}
	
	
	setTimeout( start_process, 2000);
});

//process.stdin.resume();//so the program will not close instantly
//Ctrl+C
process.on('SIGINT',function(){
   //when user explictly press Ctrl+C or the process parent wants to stop it
   //=> exit normally
   process.exitCode = 0;
   
   //press Ctrl+C again
   if( isStop )
      process.exit( 0 );
   
   isStop = true;
   database.flush( function(){
      console.warn("Ended csv reader " + READER_INDEX );
      process.exit( 0 );
   } );
});