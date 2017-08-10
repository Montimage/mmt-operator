const child_process   = require("child_process");
const config          = require("../libs/config");
const constant        = require('../libs/constant.js');
/**
 * An abstract Reader that will call either 
 * - csvReader
 * - or busReader
 * @returns
 */
function Reader(){
	const _readers = [];
	const self     = this;

	self.start = function(){
		switch( config.input_mode ){
		case constant.REDIS_STR:
		case constant.KAFKA_STR:
			var ret = child_process.fork( "./csvReader.js" );
			_readers.push( ret );
			break;
		default:
			//create processes to parallel readering
			const total_processes = config.file_input.nb_readers;
			for( var i=0; i<total_processes; i++ ){
				var ret = child_process.fork('./probe/csvReader.js', [i, total_processes] );
				_readers.push( ret );
			}
		}

		//this process removes older records from Database
		child_process.fork("./probe/maintainDB.js");
	}
}

module.exports = Reader;