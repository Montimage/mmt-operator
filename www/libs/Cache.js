var config      = require("../libs/config.js");
var dataAdaptor = require("../libs/dataAdaptor.js");
/**
 * @param   {Object} option
 {
     database: mongo database, object,
     collection_name: ,string,
     message_format:{
         key: array of string
         data: {
             $inc: array of string
             $set: array of string
             $init: array of string
         }
     },
     period: "real", "minute", "hour", "day"
 }
 * @returns {[[Type]]} [[Description]]
 */
function Cache ( option ) {
"use strict";
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
        _period_to_update_value = 60*1000; //each min//config.probe_stats_period*5*1000;         //each 25 seconds, for example
        _retain_period         = 60*60*1000; //retain data of the last 60 minutes
    }else if( _period_to_update_name == "minute" ){
        _period_to_update_value = 60*1000;        //update each minute
        _retain_period         = 24*60*60*1000;   //retain data of the last day
    }else if( _period_to_update_name == "hour" ){
        _period_to_update_value = 60*60*1000;     //update each hour
        _retain_period         = 7*24*60*60*1000; //retain data of the last week
    }else if( _period_to_update_name == "day" ){
        _period_to_update_value = 24*60*60*1000;  //update each day
        _retain_period         = -1;              //retain all data
    }else if( option.retain_period != undefined ){
        _retain_period          = option.retain_period;
        _period_to_update_value = 60*1000;
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

    this.removeOldDataFromDatabase = function( ts, cb ){
        //retain all
        if( _retain_period === -1 ){
            if( cb != null ) cb(null, 0);
            return;
        }
        ts -= _retain_period;

        var query = {}
        query[ TIMESTAMP ] = { "$lt" :  ts };

        _mdb.collection( _collection_name ).deleteMany( query, function( err, result){

            //if( _period_to_update_name !== "real" && result.deletedCount > 0 )
            //console.log("<<<<< deleted " + result.deletedCount + " records in [" + _collection_name + "] older than " + (new Date(ts)));

            if( cb != null ) cb( err, result.deletedCount );
        });
    }

    this.flushDataToDatabase = function( cb ){
      //convert object to array
        var data = [];
        for( var i in _data )
          data.push( _data[ i ] );

        _this.clear();

        if( data.length === 0 ){
            if( cb ) cb( null, data );
            return data;
        }

        _mdb.collection( _collection_name ).insert( data, function( err, result){
            //if( _period_to_update_name !== "real")
            //console.log(">>>>>>> flushed " + data.length + " records to [" + _collection_name + "]" );

            if( err ){
                console.error( err );
                console.log( result );
            }
            if( cb ) cb( err, data );
        } );

        return data;
    }

    var _is_ndn_collection = (_collection_name === "data_ndn_real");
    this.addMessage = function ( msg, cb ) {

        var ts = msg[ TIMESTAMP ];
        _addMessage( msg );

        //only for ndn offline
        if( _is_ndn_collection ){
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
          ||  _period_to_update_value == 0 //or the cache is updated in realtime
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

        var ts = 0;
        for( var i=0; i<arr.length; i++ ){
          var el = arr[i];
          _addMessage( el );

          //get the latest timestamp
          if( el[ TIMESTAMP ] > ts )
            ts = el[ TIMESTAMP ];
        };

        if( ts - _lastUpdateTime > _period_to_update_value
          || _period_to_update_value == 0
          || _data_size >= config.buffer.max_length_size
        ){
            var data = [];
            if( _lastUpdateTime !== 0  || _period_to_update_value == 0)
                data = _this.flushDataToDatabase();

          	_this.removeOldDataFromDatabase( ts );
          	_lastUpdateTime = ts;

            if( cb != null ) cb( data );
        }
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
    const key_inc_arr          = option.message_format.data["$inc"]  || [];
    const key_set_arr          = option.message_format.data["$set"]  || [] ;
    const key_init_arr         = option.message_format.data["$init"] || [];
    /**
     * calculate data to be $inc, $set and $init then store them to _data
     * @param {Object/Array} msg message tobe added
     */
    var _addMessage = function ( msg ) {

        var key_obj  = {};
        for( var i=0; i<key_id_arr.length; i++ )
          key_obj [ key_id_arr[i] ] = msg[ key_id_arr[i] ];

        if( _is_real_or_special )
            key_obj[ REPORT_NUMBER ] = msg[ REPORT_NUMBER ];
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

            //if( val == undefined  || typeof val  !== "number" )
            //    val = 0;

            if (oo[ key ] === undefined)
                oo[ key ]  = val;
            else
                oo[ key ] += val;
        }

        //set
        for (var j=0; j<key_set_arr.length; j++){
            var key = key_set_arr[ j ];
            var val = msg[ key ];

            if( val !== undefined )
                oo[ key ] = val;
        }


        
        //init
        for( var j=0; j<key_init_arr.length; j++ ){
            var key = key_init_arr[ j ];
            var val = msg[ key ];

            //init for the data in a period: minute, hour, day, month,
            //if( _period_to_update_name !== "special"){

                if( oo[ key ] == undefined )
                    oo[ key ] = val;
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


var DataCache = function( mongodb, collection_name_prefix, $key_ids, $inc_ids, $set_ids, $init_ids, retain_period ){
    "use strict";
    var self = this;

    var option = {
        database: mongodb,
        collection_name: collection_name_prefix,
        message_format:{
            key: $key_ids,
            data: {
                $inc : $inc_ids,
                $set : $set_ids,
                $init: $init_ids,
            }
        },
        period: "real"
    }
    this.option = option;

    var is_retain_all = (retain_period != undefined);

    if( is_retain_all ){
        option[ "retain_period" ] = retain_period;
        option[ "period"        ] = "special";
    }

    var _cache_real   = new Cache( option );

    if( is_retain_all !== true ){

        option.period = "minute";
        var _cache_minute = new Cache( option );

        option.period = "hour";
        var _cache_hour   = new Cache( option );

        option.period = "day";
        var _cache_day    = new Cache( option );

    }

    this.havingMessage = false;

    this.addMessage = function( msg ){
        self.havingMessage = true;
        _cache_real.addMessage( msg, function( arr_1 ){
            if( is_retain_all === true || arr_1.length == 0) return;

            _cache_minute.addArray( arr_1, function( arr_2){
                if( arr_2.length === 0) return;
                _cache_hour.addArray( arr_2, function( arr_3 ){
                    if( arr_2.length === 0) return;
                    _cache_day.addArray( arr_3 );
                })
            } )
        } );
        };

    this.addArray = function( arr ){
        self.havingMessage = true;
        _cache_real.addArray( arr, function( arr_1 ){
            if( is_retain_all === true ) return;

            _cache_minute.addArray( arr_1, function( arr_2){
                _cache_hour.addArray( arr_2, function( arr_3 ){
                    _cache_day.addArray( arr_3 );
                })
            } )
        } );
    };

    this.flushDataToDatabase = function( cb ){
        if( !self.havingMessage || is_retain_all === true ) {
            if( cb ) cb();
            return;
        }

        self.havingMessage = false;

        _cache_real.flushDataToDatabase( function(err, arr){
          if( err ) return cb( err );
          _cache_minute.addArray( arr );

          _cache_minute.flushDataToDatabase( function(err1, arr1){
            if( err1 ) return cb( err1 );
            _cache_hour.addArray( arr1 );

            _cache_hour.flushDataToDatabase( function(err2, arr2){
              if( err2 ) return cb( err2 );
              _cache_day.addArray( arr2 );
              _cache_day.flushDataToDatabase( cb );
            });
          });
        });
    };

    this.flushCaches = function( level, cb ){
        cb = cb || function(){};

        //flush immediately
        if( is_retain_all === true )
            return _cache_real.flushDataToDatabase( cb );


        if( level == "real" || level == "minute" || level == "hour" || level == "day"){
          _cache_real.flushDataToDatabase( function(err, arr){
            if( err ) return cb( err );
            _cache_minute.addArray( arr );

            if( level == "minute" || level == "hour" || level == "day"){
                _cache_minute.flushDataToDatabase( function( err1, arr1){
                  if( err1 ) return cb( err1 );
                  _cache_hour.addArray( arr1 );

                  if( level == "hour" || level == "day"){
                      _cache_hour.flushDataToDatabase( function( err2, arr2 ){
                          if( err2 ) return cb( err2 );

                          _cache_day.addArray( arr2 );
                          if( level == "day")
                              _cache_day.flushDataToDatabase( cb );
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
        _cache_real.clear();
        if( _cache_minute )
            _cache_minute.clear();
        if( _cache_hour )
            _cache_hour.clear();
        if( _cache_day )
            _cache_day.clear();
    }
}

module.exports = DataCache;
