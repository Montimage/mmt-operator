/**
 * An abstract Reader that will call either 
 * - csvReader
 * - or busReader
 * @returns
 */
const child_process   = require("child_process");
const fs              = require('fs');
const config          = require("../libs/config");
const constant        = require('../libs/constant.js');


const DATA_FOLDER     = config.file_input.data_folder;

function Reader(){
	const _readers = [];
	const self     = this;

	self.start = function(){
	   
	   if( process._children == undefined ){
	      process._children = [];
	      process._childrenCount = 0;
	   }
	   
		switch( config.input_mode ){
		case constant.REDIS_STR:
		case constant.KAFKA_STR:
			var ret = child_process.fork( __dirname + "/busReader.js" );
			_readers.push( ret );
			process._children.push( ret );
			process._childrenCount ++;
			break;
		default:
			// ensure data directory exists
			if( !fs.existsSync( DATA_FOLDER ) ){
				console.error("Error: Data folder [" + DATA_FOLDER + "] does not exists.");
				process.exit( 1 );
			}
		
			//create processes to parallel readering
			const total_processes = config.file_input.nb_readers;
			for( var i=0; i<total_processes; i++ ){
            var ret = child_process.fork( __dirname + '/csvReader.js', [i, total_processes]
				      , {execArgv: [
				         //'--debug='+ (5859 + i), //debug
				         "--expose_gc"
				         ]} 
				);
				_readers.push( ret );
				process._children.push( ret );
				process._childrenCount ++;
			}
		}

		//this process removes older records from Database
		var ret = child_process.fork( __dirname + "/maintainDB.js", []
		      , {execArgv: [
		         //'--debug=5857'
		         ]} 
		);
		process._children.push( ret );
		process._childrenCount ++;
	}
}

module.exports = Reader;