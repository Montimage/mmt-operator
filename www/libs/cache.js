"use strict";

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
    var _period_to_update_value = 0;
    var _retain_period          = -1;
    var _collection_name        = option.collection_name + "_" + option.period;
    var _this                   = this;
    var _mdb                    = option.database;
    var _lastUpdateTime         = 0;
    var _period_to_update_name  = option.period;
    
    if( _period_to_update_name == "real" ){
        _period_to_update_value = 0;         //update immediately
        _retain_period         = 5*60*1000; //retain data of the last 5 minutes
    }else if( _period_to_update_name == "minute" ){
        _period_to_update_value = 60*1000;        //update each minute
        _retain_period         = 24*60*60*1000;   //retain data of the last day
    }else if( _period_to_update_name == "hour" ){
        _period_to_update_value = 60*60*1000;     //update each hour
        _retain_period         = 7*24*60*60*1000; //retain data of the last week
    }else if( _period_to_update_name == "day" ){
        _period_to_update_value = 24*60*60*1000;  //update each day
        _retain_period         = -1;              //retain all data
    }
    
    this.data = [];
    
    this.removeOldDataFromDatabase = function( ts, cb ){
        //retain all
        if( _retain_period === -1 ){
            if( cb != null ) cb(null, 0);
            return;
        }
        ts -= _retain_period;
        
        _mdb.collection( _collection_name ).deleteMany({
           time:{ "$lt" :  ts } 
        }, function( err, result){
            
            if( _period_to_update_name !== "real")
                console.log("<<<<< deleted " + result.deletedCount + " records in [" + _collection_name + "] older than " + (new Date(ts)));
            
            if( cb != null ) cb( err, result.deletedCount );
        });
    }
    
    this.flushDataToDatabase = function( cb ){
        var data = _getData();
        _this.clear();
        
        if( data.length === 0 ){
            if( cb ) cb( null, 0 );
            return data;
        }
        
        _mdb.collection( _collection_name ).insert( data, function( err, result){
            if( _period_to_update_name !== "real")
                console.log(">>>>>>> flushed " + data.length + " records to [" + _collection_name + "]" );
            if( cb ) cb( err, result );
        } );
        
        return data;
    }
    
    this.addMessage = function ( msg, cb ) {
        msg    = JSON.parse(JSON.stringify( msg ));
        var ts = msg.time;
        
        _this.data.push( msg );
        
        //need messages arrive in time order
        if( ts - _lastUpdateTime > _period_to_update_value ){
            var data = [];
            if( _lastUpdateTime !== 0 ){
                 data = _this.flushDataToDatabase();
            }
            _this.removeOldDataFromDatabase( ts );
            
            _lastUpdateTime = ts;
            if( cb != null ) cb( data );
        }
    };
    
    this.addArray = function (arr, cb ) {
        if( arr != null && arr.length > 0 )
            _this.data = _this.data.concat( arr );
        
        if( _this.data.length === 0 ) return ;
        
        //get time of the last element in the array
        var last = _this.data[ _this.data.length - 1 ];
        if( last == null )
            console.log( _this.data );
        var ts   = last.time;
        
        //need messages arrive in time order
        if( ts - _lastUpdateTime > _period_to_update_value ){
            var data = [];
            if( _lastUpdateTime !== 0 )
                data = _this.flushDataToDatabase();
            
            _lastUpdateTime = ts;      
            
            if( cb != null ) cb( data );
            
            _this.removeOldDataFromDatabase( ts );
        }
    }
    
    this.clear = function () {
        this.data = [];
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
            
            if( _period_to_update_name === "real" )
                key_obj.time = msg.time;
            else
                key_obj.time = moment( msg.time ).startOf( _period_to_update_name ).valueOf();
            
            var txt = JSON.stringify( key_obj );
            
            if (obj[txt] == undefined) {
                obj[txt] = {};
                for (var j in key_obj){
                    obj[txt][j] = key_obj[j];
                }
            }

            var oo = obj[txt];

            //increase
            for (var j in data_id['$inc']){
                var key = data_id['$inc'][ j ];
                
                if (oo[ key ] == undefined)
                    oo[ key ]  = msg[  key ];
                else
                    oo[ key ] += msg[ key ];
            }
            
            //set
            for (var j in data_id['$set']){
                var key = data_id['$set'][ j ];
                if( msg[key] != undefined )
                    oo[j] = msg[ key ];
            }
            
            //init
            for( var j in data_id["$init"] ){
                var key = data_id["$init"][ j ];
                var val = msg[ key ];
                if( oo[ key ] === undefined && val != undefined )
                    oo[ key ] = val;
            }
            
            //console.log( oo );
        }
        
        var arr = [];
        for (var i in obj)
            arr.push(obj[i]);
        
        if( _period_to_update_name !== "real")
            console.log( "[" + _period_to_update_name + "] compress " + _this.data.length +  " records ===> " + arr.length);
        
        return arr;
    };
};


var DataCache = function( mongodb, collection_name_prefix, $key_ids, $inc_ids, $set_ids, $init_ids ){
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
    var _cache_real   = new Cache( option );
    
    option.period = "minute";
    var _cache_minute = new Cache( option );
    
    option.period = "hour";
    var _cache_hour   = new Cache( option );
    
    option.period = "day";
    var _cache_day    = new Cache( option );
    
    
    this.addMessage = function( msg ){
        _cache_real.addMessage( msg, function( arr_1 ){
            _cache_minute.addArray( arr_1, function( arr_2){
                _cache_hour.addArray( arr_2, function( arr_3 ){
                    _cache_day.addArray( arr_3 );
                })
            } )
        } );
    };
    
    this.addArray = function( arr ){
        _cache_real.addArray( arr, function( arr_1 ){
            _cache_minute.addArray( arr_1, function( arr_2){
                _cache_hour.addArray( arr_2, function( arr_3 ){
                    _cache_day.addArray( arr_3 );
                })
            } )
        } );
    };
    
    this.flushDataToDatabase = function(){
        var arr = _cache_minute.flushDataToDatabase();
        _cache_hour.addArray( arr );
        arr = _cache_hour.flushDataToDatabase();
        _cache_day.addArray( arr );
        _cache_day.flushDataToDatabase();
    }
}

module.exports = DataCache;