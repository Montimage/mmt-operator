var moment = require('moment');
var dataAdaptor = require('./dataAdaptor.js');
var Window = require("./window.js");
var config = require("../config.json");

var DataCache = require("./cache.js");

var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;

//cache size
var MAX_LENGTH = 1000000;

//cache size from config.js
if (config.buffer_socketio.max_length_size)
    MAX_LENGTH = parseInt(config.buffer_socketio.max_length_size);


var MongoConnector = function (opts) {
    this.mdb = null;

    if (opts == undefined)
        opts = {};

    opts.connectString = opts.connectString || 'mongodb://127.0.0.1:27017/MMT';

    var self = this;

    MongoClient.connect(opts.connectString, function (err, db) {
        if (err) throw err;
        self.mdb = db;

        self.dataCache = {
            total: new DataCache(db, "data_total", ["format", "probe", "source"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount"], []),
            mac: new DataCache(db, "data_mac", ["format", "probe", "source", "mac_src"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], [], ["start_time"]),
            ip: new DataCache(db, "data_ip", ["format", "probe", "source", "ip_src"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], [], ["start_time"]),
            app: new DataCache(db, "data_app", ["format", "probe", "source", "path", "app"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], []),
        }

        console.log("Connected to Database");
    });


    self.lastTimestamp = 0;

    /**
     * Stock a report to database
     * @param {[[Type]]} message [[Description]]
     */
    self.addProtocolStats = function (message) {
        if (self.mdb == null) return;

        message = dataAdaptor.formatReportItem(message);

        if (message.format === 100){
            for (var i in self.dataCache)
                self.dataCache[i].addMessage(message);

            //add traffic for the other side
            var msg = dataAdaptor.inverseStatDirection( message );
            if( dataAdaptor.isLocalIP( message.ip_dest )){
                self.dataCache.ip.addMessage( msg );
            }
            self.dataCache.mac.addMessage( msg );
        }

        var ts = message.time;


        self.lastTimestamp = ts;

        self.mdb.collection("traffic").insert(message, function (err, records) {
            if (err) console.error(err.stack);
        });

        if (message.format === dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT || message.format === dataAdaptor.CsvFormat.BA_PROFILE_FORMAT) {

            self.mdb.collection("behaviour").insert(message, function (err, records) {
                if (err) console.error(err.stack);
            });
            return;
        }

    };


    self.flushCache = function (cb) {
        for( var key in self.dataCache ){
            self.dataCache[ key ].flushDataToDatabase();
        }
        
        if (cb) cb();

    };

    //flush caches before quering
    self.getProtocolStats = function (options, callback) {

        if (options.id !== undefined) {
            self.flushCache(function () {
                self.getCurrentProtocolStats(options, callback);
            });
            return;
        }
    };


    // Do a query on database. Action can be "find", "aggregate", ...
    self.queryDB = function (collection, action, query, callback, raw) {
        console.log(action, " on [", collection, "] query : ", JSON.stringify(query));

        var start_ts = (new Date()).getTime();
        var cursor = self.mdb.collection(collection)[action](query);

        cursor.toArray(function (err, doc) {
            if (err) {
                callback(err);
                return;
            }

            var end_ts = (new Date()).getTime();
            var ts = end_ts - start_ts;

            console.log("\n got " + doc.length + " records, took " + ts + " ms");

            if (raw === undefined || raw === true) {
                var data = [];
                for (i in doc) {
                    var record = doc[i];
                    //if( record.last_time )
                    //    record.time = record.last_time;

                    record = dataAdaptor.reverseFormatReportItem(doc[i]);

                    data.push(record);
                }

                ts = (new Date()).getTime() - end_ts;

                console.log("converted " + doc.length + " records, took " + ts + " ms\n");
                callback(null, data);
            } else {
                callback(null, doc);
            }

        });
    }

    self.queryTop = function (options, total, callback) {
            self.queryDB(options.collection,
                "aggregate", [
                    {
                        "$match": options.query
                        },
                    {
                        "$group": {
                            "_id": "$" + total.group_by, //"$path",
                            "bytecount": {
                                "$sum": "$bytecount"
                            },
                            "payloadcount": {
                                "$sum": "$payloadcount"
                            },
                            "packetcount": {
                                "$sum": "$packetcount"
                            },
                            "active_flowcount": {
                                "$sum": "$active_flowcount"
                            }
                        }
                        }
                            ],
                function (err, doc) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    doc.sort(function (a, b) {
                        return b.bytecount - a.bytecount;
                    });
                    var top_list = [];
                    for (var i = 0; i < doc.length; i++) {
                        if (top_list.length > total.size) break;
                        var id = doc[i]._id;

                        if (total.filter(id))
                            top_list.push(id);
                    }

                    var obj = {
                        "bytecount": 0,
                        "payloadcount": 0,
                        "packetcount": 0,
                        "active_flowcount": 0
                    };
                    for (var i = 0; i < doc.length; i++) {
                        for (var key in obj)
                            obj[key] += doc[i][key]
                    }

                    obj.format = 100;
                    obj[ total.group_by ] = total.default_value;

                    options.query[ total.group_by ] = {
                        "$in": top_list
                    };

                    self.queryDB(options.collection, "find", options.query, function (err, arr) {
                        if (err) {
                            callback(err);
                            return;
                        };
                        if( arr.length === 0){
                            callback( null,  [] );
                            return;
                        }
                            
                        var msg = arr[0];
                        if (options.raw) {
                            obj = dataAdaptor.reverseFormatReportItem(obj);
                            obj[1] = msg[1]; //probe
                            obj[2] = msg[2];
                        } else{
                            obj.probe  = msg.probe;
                            obj.source = msg.source
                        }

                        arr.push( obj );
                        callback(null, arr);
                    }, options.raw);
                }, false);
        };
    
        /**
         * [[Description]]
         * @param {Object}   options  [[Description]]
         * @param {[[Type]]} callback [[Description]]
         */
    self.getCurrentProtocolStats = function (options, callback) {

        options.query = {
            format: {
                $in: options.format
            },
            "time": {
                '$gte': options.time.begin,
                '$lte': options.time.end
            }
        };

        if (options.format.indexOf(dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT) >= 0 || options.format.indexOf(dataAdaptor.CsvFormat.BA_PROFILE_FORMAT) >= 0) {

            //options.collection = "behaviour";
        }
        if (options.id !== "") {
            if (["link.protocol", "dpi", "network.profile"].indexOf(options.id) > -1)
                options.collection = "data_app_" + options.period_groupby;
            else if (["link.traffic"].indexOf(options.id) > -1)
                options.collection = "data_total_" + options.period_groupby;
            else if (["link.nodes"].indexOf(options.id) > -1)
                options.collection = "data_mac_" + options.period_groupby;
            else if (["network.user"].indexOf(options.id) > -1)
                options.collection = "data_ip_" + options.period_groupby;
            else {
                console.error("Not yet implemented for " + options.id);
                callback(null, []);
            }

            options.query = {
                "time": {
                    '$gte': options.time.begin
                }
            };

            if (options.id === "link.protocol") {
                //get total data of each app
                self.queryTop( options, {
                    group_by        : "path",
                    default_value   : "99",
                    size            : 8,
                    filter          : function( id ){
                        if( dataAdaptor.getAppLevelFromPath( id ) > 3 )
                            return false;
                        var app  = dataAdaptor.getAppIdFromPath( id ) ;
                        //add only protocol, not application
                        if( dataAdaptor.PureProtocol.indexOf( app ) > -1 )
                            return true;
                        return false;
                    },
                }, callback )
                return;
            }

            if (options.id === "network.user") {
                //get total data of each app
                self.queryTop( options, {
                        group_by        : "ip_src",
                        default_value   : "*",
                        size            : 8,
                        filter          : function( id ){
                            return true;
                        },
                    }, callback )
                    return;
                return;
            }
        }
        
        self.queryDB(options.collection, "find", options.query, callback, options.raw);
    };

    /**
     * Get timestamp of the last report having some predefined format
     * @param {Callback} cb      [[Description]]
     */
    self.getLastTime = function (cb) {
        if (self.mdb == null) return;


        if (self.lastTimestamp > 0) {
            cb(null, self.lastTimestamp);
            return;
        }

        self.mdb.collection("traffic").find({}).sort({
            "_id": -1
        }).limit(1).toArray(function (err, doc) {
            if (err) {
                self.lastTimestamp = (new Date()).getTime();
            } else if (Array.isArray(doc) && doc.length > 0)
                self.lastTimestamp = doc[0].time;

            cb(null, self.lastTimestamp);
        });
    };


    self.emptyDatabase = function (cb) {
        self.mdb.dropDatabase(function (err, doc) {
            console.log("drop database!");
            //empty also mmt-bandwidth
            MongoClient.connect('mongodb://' + config.database_server + ':27017/mmt-bandwidth', function (err, db) {
                if (!err)
                    db.dropDatabase(function (err, doc) {
                        cb(err);
                    });
            });

        });
    };
};

module.exports = MongoConnector;