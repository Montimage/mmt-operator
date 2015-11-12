var moment      = require('moment');
var dataAdaptor = require('./dataAdaptor.js');
var config      = require("../config.json");

var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;


var MongoConnector = function (opts) {
    this.mdb = null;

    if (opts == undefined)
        opts = {};

    opts.connectString = opts.connectString || 'mongodb://127.0.0.1:27017/MMT';

    var self = this;

    MongoClient.connect(opts.connectString, function (err, db) {
        if (err) throw err;
        self.mdb = db;
        console.log("Connected to Database");
    });

    self.insertUpdateDB = function (collection, key, val) {
        if (self.mdb == null) return;
        //update record, insert it if not exists
        self.mdb.collection(collection).update(key, val, {
            upsert: true
        }, function (err) {
            if (err) throw err;
            //console.log("Record updated");
        });
    };

    var getKeyData = function( message ){
        var key = {}, data = {};
        
        
        if (message.format === 100) { //TODO: replace with definition
            key = {
                format  : message.format,
                probe   : message.probe,
                source  : message.source,
                path    : message.path,
                mac_src : message.mac_src,
                mac_dest: message.mac_dest
            };
            data = {
                '$set': {
                    active_flowcount: message.active_flowcount,
                    app: message.app
                },
                '$inc': {
                    bytecount   : message.bytecount,
                    payloadcount: message.payloadcount,
                    packetcount : message.packetcount,
                    dl_data     : message.dl_data,
                    ul_data     : message.ul_data,
                    dl_packets  : message.dl_packets,
                    ul_packets  : message.ul_packets,
                    ul_payload  : message.ul_payload,
                    dl_payload  : message.dl_payload
                }
            };
        } else {
            key = {
                format      : message.format,
                probe       : message.probe,
                source      : message.source,
                path        : message.path,
                server_addr : message.server_addr,
                client_addr : message.client_addr,
                app         : message.app
                
            };

            if (message.format === 0) {
                data = {
                    '$inc': {
                        dl_data     : message.dl_data,
                        ul_data     : message.ul_data,
                        dl_packets  : message.dl_packets,
                        ul_packets  : message.ul_packets,
                        count: 1
                    }
                }

            } else if (message.format === 1) { //TODO: replace with definition
                data = {
                    '$inc': {
                        response_time       : message.response_time,
                        transactions_count  : message.transactions_count,
                        interaction_time    : message.interaction_time,
                        count: 1
                    }
                };

            } else if (message.format === 3) { //TODO: replace with definition
                data = {
                    '$inc': {
                        packet_loss             : message.packet_loss,
                        packet_loss_burstiness  : message.packet_loss_burstiness,
                        jitter                  : message.jitter,
                        count                   : 1
                    }
                };

            }
        }
        
        key.time = moment(message.time).startOf('minute').valueOf();
        
        return {key: key, data: data};

    }
    
    self.updateHistoricalStats = function (message) {
        // For Protocol stats, update minutes and hours stats
        var obj = getKeyData( message );
        var data = obj.data,
            key  = obj.key;
        
        if( key == undefined || key == {} )
            return;
        
        if (message.format === 100) { //TODO: replace with definition
            
            self.insertUpdateDB("traffic_min", key, data);

            key.time = moment(message.time).startOf('hour').valueOf();
            self.insertUpdateDB("traffic_hour", key, data);

            key.time = moment(message.time).startOf('day').valueOf();
            self.insertUpdateDB("traffic_day", key, data);
            
            return;
        }
           

        
        self.insertUpdateDB("traffic_min", key, data);

        key.time = moment(message.time).startOf('hour').valueOf();
        self.insertUpdateDB("traffic_hour", key, data);

        key.time = moment(message.time).startOf('day').valueOf();
        self.insertUpdateDB("traffic_day", key, data);
    };

    /**
     * Stock a report to database
     * @param {[[Type]]} message [[Description]]
     */
    self.addProtocolStats = function (message) {
        if (self.mdb == null) return;
        
        //add message to cache
        self.cache.add( message );
        
        //if cache is huge, flush it to database
        if( self.cache.getLength() >= config.database_buffer_size ){
            self.flushCacheToDatabase();
            self.cache.clear();
        }
    };

    self.flushCacheToDatabase = function(){

        self.mdb.collection( "traffic" ).insert( self.cache.data , function (err, records) {
            if ( err ) return;
            var data = self.cache.getData();
            var total = 0;
            for( var i in data ){
                var msg = data[i];
                //self.updateHistoricalStats( msg );
                total ++;
            }
            console.log( ">>>>>>>>> flush " + total +" records in the cache to database >>>>>>>>>");
        });
    }

    /**
     * [[Description]]
     * @param {Object}   options  [[Description]]
     * @param {[[Type]]} callback [[Description]]
     */
    self.getProtocolStats = function (options, callback) {
        console.log( options );
        
        var start_ts =  (new Date()).getTime();
        
        var cursor = self.mdb.collection(options.collection).find({
            format: { $in : options.format },
            "time": {
                '$gte': options.time.begin,
                '$lte': options.time.end
            }
        });

        cursor.toArray( function (err, doc) {
            if (err) {
                callback('InternalError');
                return;
            }
            
            var end_ts = (new Date()).getTime();
            var ts = end_ts - start_ts;
            
            console.log( "\n got " + doc.length + " records, took " + ts + " ms\n");
            
            if (options.raw) {
                var data = [];
                for (i in doc) {
                    var record = dataAdaptor.reverseFormatReportItem(doc[i]);
                    data.push(record);
                }
                
                callback(null, data);
            } else {
                callback(null, doc);
            }

        });
    };

    /**
     * Get timestamp of the last report having some predefined format
     * @param {Array} formats [[Description]]
     * @param {Callback} cb      [[Description]]
     */
    self.getLastTime = function (formats, cb) {
        if (self.mdb == null) return;
        self.mdb.collection("traffic").find({format: {$in: formats}}).sort({
            "_id": -1
        }).limit(1).toArray(function (err, doc) {
            if (err) {
                cb(err);
                return;
            }
            if (Array.isArray(doc) && doc.length > 0)
                cb(null, doc[0].time, doc[0].format);
            else
                cb(null, (new Date()).getTime(), 0);
        });
    };
    
    
    /**
    * 
    */
    this.cache = {
        data: [],
        add: function( msg ){
            this.data.push( msg );
            return this.data;
        },
        clear: function(){
            this.data = [];
        },
        getLength: function(){
            return this.data.length ;
        },
        getData: function(){
            var obj = {} ;
            for( var i in this.data ){
                var msg = this.data[i];
                var o   = getKeyData( msg );
                var key = o.key;
                var data= o.data;
                
                var txt = JSON.stringify( key );
                
                if( obj[ txt ] == undefined ){
                    obj[ txt ] = {};
                    for( var j in key )
                        obj[ txt ][ j ] = key[ j ];
                }
                
                var oo = obj[ txt ];
                
                //increase
                for( var j in data['$inc'] )
                    if( oo[j] == undefined)
                        oo[ j ] = data['$inc'][ j ];
                    else                
                        oo[ j ] += data['$inc'][ j ];
                //set
                for( var j in data['$set'] )
                    oo[ j ] = data['$set'][ j ];
                
                //console.log( oo );
            }
//            console.log( obj );
            return obj;
        }
    };
    
};

module.exports = MongoConnector;