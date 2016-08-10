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
    var _lastUpdateTime         = 0;
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
    this.data = [];
    this.getCollectionName = function(){
        return _collection_name;
    };

    this.removeOldDataFromDatabase = function( ts, cb ){
        /*
        //TODO to remove
        if( this.removecount == undefined )
            this.removecount = 1;
        else
            this.removecount ++;
        _retain_period = -1;
        */

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
        var data = _getData();
        _this.clear();

        //TODO to remove
        /*
        if( this.flushcount == undefined ){
            this.flushcount = 1;
            setTimeout( function(){
                console.log("flush %d, remove %d", _this.flushcount, _this.removecount );
            }, 10*1000);
        }else
            this.flushcount ++;
        //data.length = 1;
        */

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

    this.addMessage = function ( msg, cb ) {
        //clone object;
        msg = JSON.parse(JSON.stringify( msg ));

        var ts = msg[ TIMESTAMP ] > ts ? msg[ TIMESTAMP ] : ts;
        _this.data.push( msg );

        //only for ndn offline
        if( _collection_name === "data_ndn_real" ){
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

        //need messages arrive in time order???
        if( ts - _lastUpdateTime > _period_to_update_value || _period_to_update_value == 0 ){
            var data = [];
            if( _lastUpdateTime !== 0  || _period_to_update_value == 0){
                 data = _this.flushDataToDatabase();
            }

            //in realtime update, only delete data each 5 minute
            if( _period_to_update_value == 0 && ts - _lastUpdateTime > 5*60*1000 ){
            	_this.removeOldDataFromDatabase( ts );
            	_lastUpdateTime = ts;
            }else{
            	_this.removeOldDataFromDatabase( ts );
            	_lastUpdateTime = ts;
            }

            if( cb != null ) cb( data );
        }
    };

    this.addArray = function (arr, cb ) {
        if( arr == null || !(arr.length > 0) )
            return;

        var ts = 0;
        arr.forEach( function(el, i ){
          _this.data.push( el );

          //get the latest timestamp
          if( el[ TIMESTAMP ] > ts )
            ts = el[ TIMESTAMP ];
        });

        if( ts - _lastUpdateTime > _period_to_update_value || _period_to_update_value == 0 ){
            var data = [];
            if( _lastUpdateTime !== 0  || _period_to_update_value == 0)
                data = _this.flushDataToDatabase();

            //in realtime update, only delete data each 5 minute
            if( _period_to_update_value == 0 && ts - _lastUpdateTime > 5*60*1000 ){
            	_this.removeOldDataFromDatabase( ts );
            	_lastUpdateTime = ts;
            }else{
            	_this.removeOldDataFromDatabase( ts );
            	_lastUpdateTime = ts;
            }

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

    this.clear = function () {
        this.data = [];
    };

    var compare = function( msg, key ){
      if( key.if.equal )
        return msg[ key.if.col ] === key.if.equal;
      if( key.if.notEqual )
        return msg[ key.if.col ] !== key.if.notEqual;
    };

    var _getData = function () {

        var copyObject = function( obj, keys ){
            var new_obj = {};
            for( var i in keys )
                new_obj[ keys[i] ] = obj[ keys[i] ];
            return new_obj;
        }

        //
        var key_id  = option.message_format.key;
        var data_id = option.message_format.data;
        var now     = (new Date()).getTime();
        var obj = {};
        for (var i=0; i<_this.data.length; i++) {
            var msg  = _this.data[i];

            var key_obj  = copyObject( msg, key_id );

            if( _period_to_update_name === "real" || _period_to_update_name === "special")
                key_obj[ REPORT_NUMBER ] = msg[ REPORT_NUMBER ];
            else //each minute, hour, day, month
                key_obj[ TIMESTAMP ] = moment( msg[ TIMESTAMP ] ).startOf( _period_to_update_name ).valueOf();

            //var txt = JSON.stringify( key_obj );
            var txt = "";
            for( var j in key_obj )
              txt += (key_obj[j] + "_");

            key_obj._id = txt + msg[ TIMESTAMP ] + "-" + now;//+now to avoid duplicate ID after 2 consecutif calls of _getData (this can happen when flushCache is called)

            //first msg in the group identified by key_obj
            if (obj[txt] == undefined)
                obj[txt] = key_obj;

            var oo = obj[txt];
            //ts is the max ts of the reports in its period
            if( _period_to_update_name === "real" || _period_to_update_name === "special"){
              if( oo[ TIMESTAMP ] == undefined ||  oo[ TIMESTAMP ] < msg[ TIMESTAMP ] )
                oo[ TIMESTAMP ] = msg[ TIMESTAMP ];
            }

            //increase
            for (var j in data_id['$inc']){
                var key = data_id['$inc'][ j ];

                var val = msg[ key ];
                if( val == undefined  || typeof val  != "number" )
                    val = 0;

                if (oo[ key ] == undefined)
                    oo[ key ]  = val;
                else
                    oo[ key ] += val;
            }

            //set
            for (var j in data_id['$set']){
                var key = data_id['$set'][ j ];

                if( msg[key] != undefined )
                    oo[ key ] = msg[ key ];
            }

            //init
            for( var j in data_id["$init"] ){
                var key = data_id["$init"][ j ];

                var val = msg[ key ];

                //init for the data in a period: minute, hour, day, month,
                if( _period_to_update_name !== "special"){

                    if( oo[ key ] == undefined && val != undefined )
                        oo[ key ] = val;

                }else{
                    if( _init_data_obj[ txt ] == undefined )
                        _init_data_obj[ txt ] = {};

                    //init for the data in a real
                    if( _init_data_obj[txt][ key ] == undefined )
                        _init_data_obj[txt][ key ] = val;

                    oo[ key ] = _init_data_obj[txt][ key ];

                }
            }

            //console.log( oo );
        }

        var arr = [];
        for (var i in obj)
            arr.push(obj[i]);

        //if( _period_to_update_name !== "real" && _this.data.length > 1)
        if( arr.length > 0 )
            console.log( "[" + _collection_name + "] compress " + _this.data.length +  " records ===> " + arr.length);

        return arr;
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
            if( is_retain_all === true ) return;

            _cache_minute.addArray( arr_1, function( arr_2){
                _cache_hour.addArray( arr_2, function( arr_3 ){
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
