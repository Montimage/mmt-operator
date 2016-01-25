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

        self.startProbeTime = 0;
        self.mdb.collection("license").find().sort({_id:-1}).limit(1).toArray( function(err, doc){
            if( err ) console.error( err );
            if(doc.length > 0 )
                self.startProbeTime = doc[0].time;
            else
                self.startProbeTime = (new Date()).getTime();
            console.log("The last runing probe is " + (new Date( self.startProbeTime )));
        } )
        
        self.dataCache = {
            total: new DataCache(db, "data_total", ["format", "probe", "source"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount"], []),
            
            mac: new DataCache(db, "data_mac", ["format", "probe", "source", "mac_src"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], [], ["start_time"]),
            
            ip: new DataCache(db, "data_ip", ["format", "probe", "source", "ip_src"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], [], ["start_time"]),
            
            app: new DataCache(db, "data_app", ["format", "probe", "source", "path", "app"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], []),
            
            pure_app: new DataCache(db, "data_pure_app", ["format", "probe", "source", "path", "app"], ["ul_data", "dl_data", "ul_packets", "dl_packets", "ul_payload", "dl_payload", "active_flowcount", "bytecount", "payloadcount", "packetcount"], []),
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

        var msg = dataAdaptor.formatReportItem(message);

        if (msg.format === 100){
            self.dataCache.total.addMessage( msg );
            self.dataCache.mac.addMessage( msg );
            self.dataCache.ip.addMessage( msg );
            
            self.dataCache.pure_app.addMessage( msg );
            
            //add traffic for the other side (src <--> dest )
            var msg2 = dataAdaptor.inverseStatDirection( message );
            msg2     = dataAdaptor.formatReportItem( msg2 );
            //only if it is local
            if( dataAdaptor.isLocalIP( msg2.ip_src )){
                self.dataCache.ip.addMessage( msg2 );
            }
            
            self.dataCache.mac.addMessage( msg2 );
            
            //add traffic for each app in the app_path
            msg2 = msg;
            //
            if( dataAdaptor.ParentProtocol.indexOf( msg2.app  ) > -1 ){
                msg2.app = -1;
                msg2.path += ".-1";
            }
            var arr = [];
            do{
                arr.push( msg2 );
                
                index = msg2.path.lastIndexOf(".");
                if( index === -1 ) break; //root
                msg2       = JSON.parse(JSON.stringify( msg2 ))
                msg2.app   = msg2.path.substr( index + 1 );
                msg2.path  = msg2.path.substr( 0, index );
            }
            while( true );
            self.dataCache.app.addArray( arr );
        }

        var ts = msg.time;


        self.lastTimestamp = ts;

        if (msg.format === dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT || msg.format === dataAdaptor.CsvFormat.BA_PROFILE_FORMAT) {

            self.mdb.collection("behaviour").insert(msg, function (err, records) {
                if (err) console.error(err.stack);
            });
            return;
        }
        
        if (msg.format === dataAdaptor.CsvFormat.LICENSE) {
            self.startProbeTime = msg.time;
            console.log("The last runing probe is " + (new Date( self.startProbeTime )));
            self.mdb.collection("license").insert(msg, function (err, records) {
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
            var ts     = end_ts - start_ts;

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

                    options.query[ total.group_by ] = {
                        "$in": top_list
                    };

                    self.queryDB(options.collection, "find", options.query, callback, options.raw);
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
            if (["link.protocol", "dpi"].indexOf(options.id) > -1)
                options.collection = "data_app_" + options.period_groupby;
            else if (["link.traffic"].indexOf(options.id) > -1)
                options.collection = "data_total_" + options.period_groupby;
            else if (["link.nodes"].indexOf(options.id) > -1)
                options.collection = "data_mac_" + options.period_groupby;
            else if (["network.user"].indexOf(options.id) > -1)
                options.collection = "data_ip_" + options.period_groupby;
            else if( options.id === "chart.license")
                options.collection = "license";
            else if (["network.profile"].indexOf(options.id) > -1)
                options.collection = "data_pure_app_" + options.period_groupby;
            else {
                console.error("Not yet implemented for " + options.id);
                callback(null, ["Not yet implemented"]);
                return;
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
                    size            : 8,
                    filter          : function( id ){
                        if( id === "99" )//ethernet: total
                            return true;
                        if( dataAdaptor.getAppLevelFromPath( id ) > 3 )
                            return false;
                        var app  = dataAdaptor.getAppIdFromPath( id ) ;
                        //add only protocol, not application
                        if( dataAdaptor.PureProtocol.indexOf( app ) > -1 )
                            return true;
                        return false;
                    },
                }, callback );
                return;
            }
            
            
            if( options.id === "link.nodes" ){
                options.query = {
                    "time": {
                        '$gte': self.startProbeTime
                    }
                }
                self.queryDB(options.collection, "find", options.query, callback, options.raw);
                return;
            }

            if (options.id === "network.user") {
                self.queryDB(options.collection,
                "aggregate", [
                    {
                        "$match": options.query
                    },
                    {
                        "$group": {
                            "_id": "$ip_src", //"$path",
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
                            },
                            "format": {
                                "$first": "$format"
                            },
                            "time": {
                                "$first": "$time"
                            },
                            "probe":{
                                "$first" : "$probe"
                            },
                            "source":{
                                "$first" : "$source"
                            },
                            "ip_src":{
                                "$first" : "$ip_src"
                            }
                        }
                    }], callback, options.raw );
                return;
            }
            
            if (options.id === "network.profile") {
                self.queryDB(options.collection,
                "aggregate", [
                    {
                        "$match": options.query
                    },
                    {
                        "$group": {
                            "_id": "$path",
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
                            },
                            "format": {
                                "$first": "$format"
                            },
                            "time": {
                                "$first": "$time"
                            },
                            "probe":{
                                "$first" : "$probe"
                            },
                            "source":{
                                "$first" : "$source"
                            },
                            "path":{
                                "$first" : "$path"
                            },
                            "app":{
                                "$first" : "$app"
                            }
                        }
                    }], function( err, arr ){
                        if( err ){
                            callback( err );
                            return;
                        }
                            
                        callback( err, arr);
                        
                    } , options.raw );
                return;
            }
            
            if(options.id === "chart.license"){
                self.mdb.collection("license").find().sort({_id:-1}).limit(1).toArray( function(err, doc){
                            if( err ) console.error( err );
                            if(doc.length === 0 ){
                                callback( err );
                                return;
                            }
                    
                            var msg = doc[0];
                            if (options.raw === undefined || options.raw === true)
                                msg = dataAdaptor.reverseFormatReportItem( msg );
                            callback(null, [ msg ]);
                        } );
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
            self.lastTimestamp = 0;
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