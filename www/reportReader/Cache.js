const config          = require("../libs/config.js");
const dataAdaptor     = require("../libs/dataAdaptor.js");
const tools           = require("../libs/tools.js");
const CONST           = require("../libs/constant.js");

const TIMESTAMP       = dataAdaptor.StatsColumnId.TIMESTAMP; //index of timestamp
const REPORT_NUMBER   = dataAdaptor.StatsColumnId.REPORT_NUMBER;
const PROBE_ID        = dataAdaptor.StatsColumnId.PROBE_ID;
const FORMAT_ID       = dataAdaptor.StatsColumnId.FORMAT_ID;

/**
 * @param   {Object} option
 {
     database: mongo database, object,
     collection_name: ,string,
     message_format:{
         key : array of string
         inc : array of string
         set : array of string
         init: array of string
         avg :
     },
     period: "real", "minute", "hour", "day"
 }
 * @returns {[[Type]]} [[Description]]
 */
function Cache ( option ) {
	"use strict";

	const _this                   = this;
	const _PERIOD_TO_UPDATE_NAME  = option.period;
	const _PERIOD_TO_UPDATE       = option.periodNumber;
	const _inserter               = option.database;
	
	const _IS_REAL_PERIOD  = (_PERIOD_TO_UPDATE_NAME === CONST.period.REAL);
	const _IS_RETAIN_ALL   = (_PERIOD_TO_UPDATE_NAME === CONST.period.SPECIAL);
	
	const _collection_name        = option.collection_name + "_" + option.period;

	var _dataObj = {}; //key => data
	var _dataSize = 0;

	
	//check
	if( !_IS_RETAIN_ALL && ( !Array.isArray( option.message_format.key ) || option.message_format.key.length == 0)){
		return console.error( "Key must not empty" );
	}

	
	/**
	 * Flush data to DB
	 */
	_this.flushDataToDatabase = function( cb ){
		//convert object to array
		var data = [];
		for( var i in _dataObj )
			data.push( _dataObj[ i ] );

		_this.clear();

		if( data.length === 0 ){
			if( cb ) cb( null, data );
			return data;
		}

		_inserter.add( _collection_name, data, function( err, result){
			console.info( "=> flushed " + result.insertedCount + "(" + data.length + ") records to [" + _collection_name + "]" );

			if( cb ) 
				cb( err, data );
		});
		
		return data;
	}

	const _IS_NDN_COLLECTION = (_collection_name === "data_ndn_real");
	var _lastUpdateTime = 0;
	this.addMessage = function ( msg, cb ) {
		const ts = msg[ TIMESTAMP ];
		if( _lastUpdateTime == 0 )
			_lastUpdateTime = ts;
		
		const isDummy = (msg[ FORMAT_ID ]  === dataAdaptor.CsvFormat.DUMMY_FORMAT);
		
		if( !isDummy ){
			//retain original message
			if( _IS_RETAIN_ALL )
				//clone msg
				_dataObj[ _dataSize ++ ] = JSON.parse(JSON.stringify( msg ));
			else
				_addMessage( msg );
		}

		//only for ndn offline
		if( _IS_NDN_COLLECTION ){
			var data = _this.flushDataToDatabase();

			if( cb != null ){
				if( isDummy )
					data.push( msg );
				cb( data );
			}
			return;
		}
		//end NDN


		//a message that comes in a period that was updated
		//update it directly in db
		//if( ts <= _lastUpdateTime ){
		//    console.log("wrong order!!!!!");
		//return;
		//}

		//flush data in _dataObj to database
		//need messages arrive in time order???
		if( _dataSize >= config.buffer.max_length_size
				|| ts - _lastUpdateTime >= _PERIOD_TO_UPDATE ){
			
			_lastUpdateTime = ts;
			var data        = _this.flushDataToDatabase();

			if( cb !== undefined ){
				if( isDummy )
					data.push( msg );
				
				cb( data );
			}
			return;
		}
	};

	_this.addArray = function (arr, cb ) {
		if( arr == null || !(arr.length > 0) )
			return;

		for( var i=0; i<arr.length; i++ )
			this.addMessage( arr[i], cb );
	}

	/**
	 * Clear data in the cache
	 */
	_this.clear = function () {
		_dataObj = {};
		_dataSize = 0;
	};

	const key_id_arr           = option.message_format.key;
	const key_inc_arr          = option.message_format.inc  || [];
	const key_set_arr          = option.message_format.set  || [] ;
	const key_init_arr         = option.message_format.init || [];
	const key_avg_arr          = option.message_format.avg  || [];
	/**
	 * calculate data to be $inc, $set and $init then store them to _dataObj
	 * @param {Object/Array} msg message tobe added
	 */
	var _addMessage = function ( msg ) {

		var key_obj    = {};
		var key_string = "";
		for( var i=0; i<key_id_arr.length; i++ ){
			key_obj [ key_id_arr[i] ] = msg[ key_id_arr[i] ];
			key_string               += msg[ key_id_arr[i] ] + ";";
		}

		if( _IS_REAL_PERIOD ){
			//key_obj[ REPORT_NUMBER ] = msg[ REPORT_NUMBER ];
			key_obj[ TIMESTAMP ] = msg[ TIMESTAMP ];
		}else{ //each minute, hour, day, month
			key_obj[ TIMESTAMP ] = moment( msg[ TIMESTAMP ] ).startOf( _PERIOD_TO_UPDATE_NAME ).valueOf();
		}
		key_string = key_obj[ TIMESTAMP ] + ";" + key_string 

		var oo = key_obj;
		//first msg in the group identified by key_obj
		if (_dataObj[key_string] == undefined){
			_dataObj[key_string] = key_obj;
			_dataSize ++;
		}
		else
			oo = _dataObj[ key_string ];

		oo[ TIMESTAMP ] = oo[ TIMESTAMP ];
 		
		//increase
		for (var j=0; j<key_inc_arr.length; j++){
			var key = key_inc_arr[ j ];
			var val = msg[ key ];
			if( Number.isNaN( val ) )
				val = 0;
			if (oo[ key ] == undefined)
				oo[ key ]  = val;
			else
				oo[ key ] += val;
		}

		//avg: calculate average value
		for (var j=0; j<key_avg_arr.length; j++){
			var key = key_avg_arr[ j ];
			var val = msg[ key ];
			if( Number.isNaN( val ) )
				val = 0;
			if (oo[ key ] == undefined)
				oo[ key ]  = val;
			else
				oo[ key ] += val;
		}

		//set: override value by the last one
		for (var j=0; j<key_set_arr.length; j++){
			var key = key_set_arr[ j ];
			var val = msg[ key ];

			if( val != undefined )
				oo[ key ] = val;
		}

		//init: initialise  value
		for( var j=0; j<key_init_arr.length; j++ ){
			var key = key_init_arr[ j ];

			//init for the data in a period: minute, hour, day, month,
			if( oo[ key ] == undefined )
				oo[ key ] = msg[ key ];

		}
	};
};


/**
 * data = {
 *  key : array
 * 	init: array
 * 	inc : array
 *  set : array
 *  avg : array
 * }
 */

var DataCache = function( db, collection_name_prefix, message_format, level ){
	"use strict";
	var self = this;

	var option = {
			database       : db,
			collection_name: collection_name_prefix,
			message_format : message_format,
	}
	this.option  = option;
	const _cache = {  };
	var  _periodToUpdateValue = 0;
	
	//when <code>retain_period</code> is explicitly specified
	//=> we retain only information at "real" level,
	//   we do not calculate "minute", ... levels
	
	//default is to store all
	if( level == undefined )
		level = CONST.period.DAY;
	
	switch( level ){
	case CONST.period.DAY:
		option.period        =  CONST.period.DAY;
		option.periodNumber  = 24*60*60*1000;  //update each day
		_cache.day           = new Cache( option );
		//no break: day need hour
	case CONST.period.HOUR:
		option.period        =  CONST.period.HOUR;
		option.periodNumber  = 60*60*1000;  //update each hour
		_cache.hour          = new Cache( option );
		//no break: hour need minute
	case CONST.period.MINUTE:
		option.period        =  CONST.period.MINUTE;
		option.periodNumber  = 60*1000;  //update each minute
		_cache.minute        = new Cache( option );
		//no break: minute need real
	case CONST.period.REAL:
	//default:
		option.period        = CONST.period.REAL;
		option.periodNumber  = config.buffer.max_interval * 1000;         //each 5 seconds, for example
		_cache.real          = new Cache( option );
		break;
	case CONST.period.SPECIAL:
		option.period        = CONST.period.SPECIAL;
		option.periodNumber  = config.buffer.max_interval * 1000;         //each 5 seconds, for example
		_cache.real          = new Cache( option );
	}
	
	//mark: whether containing any messages
	this.havingMessage = false;
	//timestamp of the last message
	var _lastMessageTimestamp = 0.
	/**
	 * Add a message to the caches
	 */
	this.addMessage = function( msg ){
		_lastMessageTimestamp = msg[ TIMESTAMP];
		
		self.havingMessage = true;
		//update to the real cache
		_cache.real.addMessage( msg, function( arr_1 ){
			//update to the minute cache if any
			if( arr_1.length == 0 || _cache.minute == undefined ) return;
			
			_cache.minute.addArray( arr_1, function( arr_2 ){
				if( arr_2.length === 0 || _cache.hour == undefined ) return;
				
				_cache.hour.addArray( arr_2, function( arr_3 ){
					if( arr_2.length === 0 || _cache.day == undefined ) return;
					_cache.day.addArray( arr_3 );
				})
			} )
		} );
	};

	/**
	 * Flush all caches to DB
	 */
	this.flushDataToDatabase = function( cb ){
		cb = cb || function(){};

		if( !self.havingMessage ) {
			cb();
			return;
		}

		self.havingMessage = false;
		
		self.flushCaches( "day", cb );
	};

	/**
	 * Flush only caches concerning to some level
	 */
	this.flushCaches = function( level, cb ){
		cb = cb || function(){};

		if( level == "real" || level == "minute" || level == "hour" || level == "day"){
			_cache.real.flushDataToDatabase( function(err, arr){
				if( err ) return cb( err );
				
				if( !_cache.minute ) return;
					
				_cache.minute.addArray( arr );

				if( level == "minute" || level == "hour" || level == "day"){
					_cache.minute.flushDataToDatabase( function( err1, arr1){
						if( err1 ) return cb( err1 );
						
						if( !_cache.hour ) return;
						
						_cache.hour.addArray( arr1 );

						if( level == "hour" || level == "day"){
							_cache.hour.flushDataToDatabase( function( err2, arr2 ){
								if( err2 ) return cb( err2 );

								if( !_cache.day ) return;
								
								_cache.day.addArray( arr2 );
								if( level == "day")
									_cache.day.flushDataToDatabase( cb );
								else
									cb( err2, arr2 );
							} );
						}
						else
							cb( err1, arr1 );
					});

				}else
					cb( err, arr );
			});
		}
	}

	/**
	 * Clear all caches
	 */
	this.clear = function(){
		_cache.real.clear();
		if( _cache.minute )
			_cache.minute.clear();
		if( _cache.hour )
			_cache.hour.clear();
		if( _cache.day )
			_cache.day.clear();
	}
	
	const interval = config.buffer.max_interval * 1000;
	//start timers to update
	var _now = 0;
	var _timer = setInterval( function(){
		if( _now == 0 ){
			_now = _lastMessageTimestamp;
			return;
		}
		_now += interval;
		
		//still waiting for the new csv files
		if( _now < _lastMessageTimestamp + config.probe_stats_period*1000*2 )
			return;
		
		//after 2 waiting, no csv files are read ==> insert dummy report to flush caches
		
		var msg = {};
		msg[ FORMAT_ID ]  = dataAdaptor.StatsColumnId.DUMMY_FORMAT;
		msg[ TIMESTAMP ] = _lastMessageTimestamp + config.probe_stats_period*1000;
		self.addMessage( msg );
		
	}, interval );
}

module.exports = DataCache;