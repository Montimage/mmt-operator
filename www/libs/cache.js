var config  = require("../config.json");

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
    var TIMESTAMP               = 3; //index of timestamp

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
            console.log(">>>>>>> flushed " + data.length + " records to [" + _collection_name + "]" );

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
        msg    = JSON.parse(JSON.stringify( msg ));

        var ts = msg[ TIMESTAMP ];
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
        if( arr != null && arr.length > 0 )
            _this.data = _this.data.concat( arr );

        if( _this.data.length === 0 ) return ;

        //get time of the last element in the array
        var last = _this.data[ _this.data.length - 1 ];
        var ts   = last[ TIMESTAMP ];

        //need messages arrive in time order???
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

        var copyObject = function( obj, key ){
            var new_obj = {};
            for( var i in key )
                new_obj[ key[i] ] = obj[ key[i] ];
            return new_obj;
        }

        //
        var key_id  = option.message_format.key;
        var data_id = option.message_format.data;

        var obj = {};
        for (var i in _this.data) {
            var msg  = _this.data[i];

            var key_obj  = copyObject( msg, key_id );

            if( _period_to_update_name === "real" || _period_to_update_name === "special")
                key_obj[ TIMESTAMP ] = msg[ TIMESTAMP ];
            else
                key_obj[ TIMESTAMP ] = moment( msg[ TIMESTAMP ] ).startOf( _period_to_update_name ).valueOf();

            var txt = JSON.stringify( key_obj );

            if (obj[txt] == undefined) {
                obj[txt] = key_obj;
            }

            var oo = obj[txt];

            //increase
            for (var j in data_id['$inc']){
                var key = data_id['$inc'][ j ];
                if( typeof key == "object"){
                  //check if the condition is ok
                  if( ! compare( msg, key ) )
                    continue;
                  key = key.key;
                }

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
                if( typeof key == "object"){
                  //check if the condition is ok
                  if( ! compare( msg, key ) )
                    continue;
                  key = key.key;
                }

                if( msg[key] != undefined )
                    oo[ key ] = msg[ key ];
            }

            //init
            for( var j in data_id["$init"] ){
                var key = data_id["$init"][ j ];
                if( typeof key == "object"){
                  //check if the condition is ok
                  if( ! compare( msg, key ) )
                    continue;
                  key = key.key;
                }

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

        var arr = _cache_real.flushDataToDatabase();

        _cache_minute.addArray( arr );
        arr = _cache_minute.flushDataToDatabase();

        _cache_hour.addArray( arr );
        arr = _cache_hour.flushDataToDatabase();

        _cache_day.addArray( arr );
        _cache_day.flushDataToDatabase();

        if( cb ) cb();
    };

    this.flushCaches = function( level ){
        //flush immediately
        if( is_retain_all === true )
            return _cache_real.flushDataToDatabase();


        var arr = [];
        if( level == "real" || level == "minute" || level == "hour" || level == "day"){
                arr = _cache_real.flushDataToDatabase();
                _cache_minute.addArray( arr );
        }
        if( level == "minute" || level == "hour" || level == "day"){
                arr = _cache_minute.flushDataToDatabase();
                _cache_hour.addArray( arr );
        }
        if( level == "hour" || level == "day"){
                arr = _cache_hour.flushDataToDatabase();
                _cache_day.addArray( arr );
        }
        if( level == "day"){
                _cache_day.flushDataToDatabase();
        }

        return arr;
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

    setInterval( function(){
        self.flushCaches( "real" );
    }, 30*1000 );//each 30 seconds
}

module.exports = DataCache;
