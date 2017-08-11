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
		switch( config.input_mode ){
		case constant.REDIS_STR:
		case constant.KAFKA_STR:
			var ret = child_process.fork( __dirname + "/busReader.js" );
			_readers.push( ret );
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
				var ret = child_process.fork( __dirname + '/csvReader.js', [i, total_processes] );
				_readers.push( ret );
			}
		}

		//this process removes older records from Database
		child_process.fork( __dirname + "/maintainDB.js");
	}
}

module.exports = Reader;