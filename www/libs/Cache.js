var config      = require("../libs/config.js");
var dataAdaptor = require("../libs/dataAdaptor.js");
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
	//check
	if( !Array.isArray( option.message_format.key ) || option.message_format.key.length == 0){
		return console.error( "Key must not empty" );
	}

    var _this                   = this;
    var TIMESTAMP               = dataAdaptor.StatsColumnId.TIMESTAMP; //index of timestamp
    var REPORT_NUMBER           = dataAdaptor.StatsColumnId.REPORT_NUMBER;
    var _period_to_update_value = 0;
    var _retain_period          = -1;
    var _collection_name        = option.collection_name + "_" + option.period;

    var _mdb                    = option.database;
    var _period_to_update_name  = option.period;
    var _init_data_obj          = {};

    if( _period_to_update_name == "real" ){
        _period_to_update_value = config.buffer.max_interval*1000;         //each 5 seconds, for example
        _retain_period          = 60*60*1000; //retain data of the last 60 minutes
    }else if( _period_to_update_name == "minute" ){
        _period_to_update_value = 60*1000;        //update each minute
        _retain_period          = 24*60*60*1000;   //retain data of the last day
    }else if( _period_to_update_name == "hour" ){
        _period_to_update_value = 60*60*1000;     //update each hour
        _retain_period          = 7*24*60*60*1000; //retain data of the last week
    }else if( _period_to_update_name == "day" ){
        _period_to_update_value = 24*60*60*1000;  //update each day
        _retain_period          = -1;              //retain all data
    }else if( option.retain_period != undefined ){
        _retain_period          = option.retain_period;
        _period_to_update_value = config.buffer.max_interval*1000;         //each 5 seconds, for example
        _collection_name        = option.collection_name;
    }


    this.getLastUpdateTime = function(){
        return _lastUpdateTime;
    }

    var _lastUpdateTime = 0; //timestamp of the last updating data to db
    var _nextUpdateTime = 0; //timestamp of the next expected update = _lastUpdateTime + _period_to_update_value
    var _data = {}; //key => data
    var _data_size = 0;

    this.getCollectionName = function(){
        return _collection_name;
    };

    //moment we removed old data from DB 
    var _last_remove_ts = 0;
    this.removeOldDataFromDatabase = function( ts, cb ){
 
        //retain all
        if( _retain_period === -1 ){
            if( cb != null ) cb(null, 0);
            return [];
        }

         //avoid 2 consecutive  flushes in 5 seconds
         if ( ts - _last_remove_ts <= 2*_period_to_update_value ){
            if( cb ) cb( [] );
            return [];
         }
         _last_remove_ts = ts;

       ts -= _retain_period;

        var query = {}
        query[ TIMESTAMP ] = { "$lt" :  ts };

        _mdb.collection( _collection_name ).deleteMany( query, function( err, result){

            //if( _period_to_update_name !== "real" && result.deletedCount > 0 )
            console.info("  del " + result.deletedCount + " in [" + _collection_name + "] older than " + (new Date(ts)));

            if( cb != null ) cb( err, result.deletedCount );
        });
    }

    var _last_flush_ts = 0; //real moment (of this machine, not ts from packets of mmt-probe) we flushed cache to DB
    this.flushDataToDatabase = function( cb ){
         //avoid 2 consecutive  flushes in 5 seconds
        var now = (new Date()).getTime();
         if ( now - _last_flush_ts < 10000 ){
            if( cb ) cb( [] );
            return [];
         }
         _last_flush_ts = now;
         
      //convert object to array
        var data = [];
        for( var i in _data )
          data.push( _data[ i ] );

        _this.clear();

        if( data.length === 0 ){
            if( cb ) cb( null, data );
            return data;
        }
        var method = "insert", opt = {};
        if( data.length > 1 ){
            method = "insertMany";
        }
        console.info(now + " flush " + _collection_name );
        _mdb.collection( _collection_name )[method]( data, function( err, result){
            //if( _period_to_update_name !== "real")
            console.info(now + " flushed " + data.length + " records to [" + _collection_name + "]" );

            if( err ){
                console.error( err );
                console.log( result );
            }
            if( cb ) cb( err, data );
        }  );
        return data;
    }

    const _IS_NDN_COLLECTION = (_collection_name === "data_ndn_real");
    this.addMessage = function ( msg, cb ) {

        var ts = msg[ TIMESTAMP ];
        _addMessage( msg );

        //only for ndn offline
        if( _IS_NDN_COLLECTION ){
            var data = _this.flushDataToDatabase();
            _this.removeOldDataFromDatabase( ts );

            _lastUpdateTime = ts;
            if( cb != null ) cb( data );
            return;
        }
        //end NDN


        //a message that comes in a period that was updated
        //update it directly in db
        //if( ts <= _lastUpdateTime ){
        //    console.log("wrong order!!!!!");
            //return;
        //}

        //flush data in _data to database
        //need messages arrive in time order???
        if( ts - _lastUpdateTime > _period_to_update_value //when it timestamp > period_to_update
          ||  _period_to_update_value === 0 //or the cache is updated in realtime
          || _data_size >= config.buffer.max_length_size
        ){
            var data = [];
            if( _lastUpdateTime !== 0  || _period_to_update_value == 0){
                 data = _this.flushDataToDatabase();
            }
            _lastUpdateTime = ts;

            _this.removeOldDataFromDatabase( ts );

            if( cb !== undefined )
                cb( data );
            return;
        }
    };

    this.addArray = function (arr, cb ) {
        if( arr == null || !(arr.length > 0) )
            return;
        
        for( var i=0; i<arr.length; i++ )
          this.addMessage( arr[i], cb );
    }

    /**
     * Update data from cache to mongodb, and delete old data in mongodb
     * @param   {Callback} cb( data )
     * @returns {Array} array of data inserted into mongodb
     */
    this.updateDataBase = function( cb ){
        var data = [];
        //update immediately
        if (( _period_to_update_value == 0 ) ||
            ( ts - _lastUpdateTime > _period_to_update_value && _lastUpdateTime !== 0 )){
            data = _this.flushDataToDatabase();
            _lastUpdateTime = ts;
        }

            //in realtime update, only delete data each 5 minute
            if( _period_to_update_value == 0 && ts - _lastUpdateTime > 5*60*1000 ){
            	_this.removeOldDataFromDatabase( ts );

            }else{
            	_this.removeOldDataFromDatabase( ts );
            	_lastUpdateTime = ts;
            }

        if( cb != null ) cb( data );
        return data;
    }

    /**
     * Clear data in the cache
     */
    this.clear = function () {
        _data = {};
        _data_size = 0;
    };

    const _is_real_or_special  = (_period_to_update_name === "real" || _period_to_update_name === "special");
    const key_id_arr           = option.message_format.key;
    const key_inc_arr          = option.message_format.inc  || [];
    const key_set_arr          = option.message_format.set  || [] ;
    const key_init_arr         = option.message_format.init || [];
    const key_avg_arr          = option.message_format.avg  || [];
    /**
     * calculate data to be $inc, $set and $init then store them to _data
     * @param {Object/Array} msg message tobe added
     */
    var _addMessage = function ( msg ) {

        var key_obj  = {};
        for( var i=0; i<key_id_arr.length; i++ )
          key_obj [ key_id_arr[i] ] = msg[ key_id_arr[i] ];

        if( _is_real_or_special )
            //key_obj[ REPORT_NUMBER ] = msg[ REPORT_NUMBER ];
            key_obj[ TIMESTAMP ] = msg[ TIMESTAMP ];
        else //each minute, hour, day, month
            key_obj[ TIMESTAMP ] = moment( msg[ TIMESTAMP ] ).startOf( _period_to_update_name ).valueOf();

        var txt = JSON.stringify( key_obj );

        var oo = key_obj;
        //first msg in the group identified by key_obj
        if (_data[txt] == undefined){
            _data[txt] = key_obj;
            _data_size ++;
        }
        else
             oo = _data[ txt ];

        //ts is the max ts of the reports in its period
        if( _is_real_or_special ){
          if(  oo[ TIMESTAMP ] < msg[ TIMESTAMP ] || oo[ TIMESTAMP ] == undefined )
            oo[ TIMESTAMP ] = msg[ TIMESTAMP ];
        }

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

            if( val !== undefined )
                oo[ key ] = val;
        }
        
        //init: initialise  value
        for( var j=0; j<key_init_arr.length; j++ ){
            var key = key_init_arr[ j ];

            //init for the data in a period: minute, hour, day, month,
            //if( _period_to_update_name !== "special"){

                if( oo[ key ] == undefined )
                    oo[ key ] = msg[ key ];
/*
            }else{
                if( _init_data_obj[ txt ] == undefined )
                    _init_data_obj[ txt ] = {};

                //init for the data in a real
                if( _init_data_obj[txt][ key ] == undefined )
                    _init_data_obj[txt][ key ] = val;

                oo[ key ] = _init_data_obj[txt][ key ];
            }
*/
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

var DataCache = function( mongodb, collection_name_prefix, message_format, retain_period ){
    "use strict";
    var self = this;

    var option = {
        database       : mongodb,
        collection_name: collection_name_prefix,
        message_format :message_format,
        period         : "real"
    }
    this.option          = option;
    var _cache           = { real : new Cache( option ) };
    const _is_retain_all = (retain_period != undefined);
    
    //when <code>retain_period</code> is explicitly specified
    //=> we retain only information at "real" level,
    //   we do not calculate "minute", ... levels
    if( _is_retain_all ){
        option[ "retain_period" ] = retain_period;
        option[ "period"        ] = "special";
    }
    else{

        option.period = "minute";
        _cache.minute = new Cache( option );

        option.period = "hour";
        _cache.hour   = new Cache( option );

        option.period = "day";
        _cache.day    = new Cache( option );

    }

    this.havingMessage = false;

    this.addMessage = function( msg ){
        self.havingMessage = true;
        _cache.real.addMessage( msg, function( arr_1 ){
            if( _is_retain_all === true || arr_1.length == 0) return;

            _cache.minute.addArray( arr_1, function( arr_2){
                if( arr_2.length === 0) return;
                _cache.hour.addArray( arr_2, function( arr_3 ){
                    if( arr_2.length === 0) return;
                    _cache.day.addArray( arr_3 );
                })
            } )
        } );
        };

    this.addArray = function( arr ){
        self.havingMessage = true;
        _cache.real.addArray( arr, function( arr_1 ){
            if( _is_retain_all === true ) return;

            _cache.minute.addArray( arr_1, function( arr_2){
                _cache.hour.addArray( arr_2, function( arr_3 ){
                    _cache.day.addArray( arr_3 );
                })
            } )
        } );
    };

    this.flushDataToDatabase = function( cb ){
        cb = cb || function(){};

        if( !self.havingMessage || _is_retain_all === true ) {
            cb();
            return;
        }

        self.havingMessage = false;

        _cache.real.flushDataToDatabase( function(err, arr){
          if( err ) return cb( err );
          _cache.minute.addArray( arr );

          _cache.minute.flushDataToDatabase( function(err1, arr1){
            if( err1 ) return cb( err1 );
            _cache.hour.addArray( arr1 );

            _cache.hour.flushDataToDatabase( function(err2, arr2){
              if( err2 ) return cb( err2 );
              _cache.day.addArray( arr2 );
              _cache.day.flushDataToDatabase( cb );
            });
          });
        });
    };

    this.flushCaches = function( level, cb ){
        cb = cb || function(){};

        //flush immediately
        if( _is_retain_all === true )
            return _cache.real.flushDataToDatabase( cb );


        if( level == "real" || level == "minute" || level == "hour" || level == "day"){
          _cache.real.flushDataToDatabase( function(err, arr){
            if( err ) return cb( err );
            _cache.minute.addArray( arr );

            if( level == "minute" || level == "hour" || level == "day"){
                _cache.minute.flushDataToDatabase( function( err1, arr1){
                  if( err1 ) return cb( err1 );
                  _cache.hour.addArray( arr1 );

                  if( level == "hour" || level == "day"){
                      _cache.hour.flushDataToDatabase( function( err2, arr2 ){
                          if( err2 ) return cb( err2 );

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

    this.clear = function(){
        _cache.real.clear();
        if( _cache.minute )
            _cache.minute.clear();
        if( _cache.hour )
            _cache.hour.clear();
        if( _cache.day )
            _cache.day.clear();
    }
}

module.exports = DataCache;
