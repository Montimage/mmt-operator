var moment = require('moment');
var dataAdaptor = require('./dataAdaptor.js');
var config = require("../config.json");

var MongoClient = require('mongodb').MongoClient,
    format = require('util').format;

var Cache = function (period) {
    this.data = [];
    this.add = function (msg) {
        this.data.push(msg);
    };

    this.addArray = function (arr) {
        this.data = this.data.concat(arr);
    }
    this.clear = function () {
        this.data = [];
    };
    this.getLength = function () {
        return this.data.length;
    };
    this.getData = function () {
        /**
         * [[Description]]
         * @param   {Object}   message  [[Description]]
         * @returns {Object}   [[Description]]
         */
        var getKeyData = function (message) {
            var key = {},
                data = {};


            if (message.format === 100) { //TODO: replace with definition
                key = {
                    format: message.format,
                    probe: message.probe,
                    source: message.source,
                    path: message.path,
                    mac_src: message.mac_src,
                    mac_dest: message.mac_dest
                };
                data = {
                    '$set': {
                        active_flowcount: message.active_flowcount,
                        app: message.app
                    },
                    '$inc': {
                        bytecount: message.bytecount,
                        payloadcount: message.payloadcount,
                        packetcount: message.packetcount,
                        dl_data: message.dl_data,
                        ul_data: message.ul_data,
                        dl_packets: message.dl_packets,
                        ul_packets: message.ul_packets,
                        ul_payload: message.ul_payload,
                        dl_payload: message.dl_payload
                    }
                };
            } if( message.format == 10){
                key = {
                    format: message.format,
                    probe: message.probe,
                    source: message.source,
                    property: message.property,
                    type: message.type,
                    verdict: message.verdict
                };
                data = {
                    '$inc' :{
                       verdict: 1,
                       count: 1
                    },
                    '$set' :{
                        time: message.time
                    }
                }
            } else {
                key = {
                    format: message.format,
                    probe: message.probe,
                    source: message.source,
                    path: message.path,
                    server_addr: message.server_addr,
                    client_addr: message.client_addr,
                    app: message.app
                };

                if (message.format === 0) {
                    data = {
                        '$inc': {
                            dl_data: message.dl_data,
                            ul_data: message.ul_data,
                            dl_packets: message.dl_packets,
                            ul_packets: message.ul_packets,
                            count: 1
                        }
                    }

                } else if (message.format === 1) { //TODO: replace with definition
                    data = {
                        '$inc': {
                            response_time: message.response_time,
                            transactions_count: message.transactions_count,
                            interaction_time: message.interaction_time,
                            count: 1
                        }
                    };

                } else if (message.format === 3) { //TODO: replace with definition
                    data = {
                        '$inc': {
                            packet_loss: message.packet_loss,
                            packet_loss_burstiness: message.packet_loss_burstiness,
                            jitter: message.jitter,
                            count: 1
                        }
                    };

                }
            }

            key.time = moment(message.time).startOf(period).valueOf();
            return {
                key: key,
                data: data
            };
        };

        var obj = {};
        for (var i in this.data) {
            var msg = this.data[i];
            var o = getKeyData(msg);
            var key = o.key;
            var data = o.data;

            var txt = JSON.stringify(key);

            if (obj[txt] == undefined) {
                obj[txt] = {};
                for (var j in key)
                    obj[txt][j] = key[j];
            }

            var oo = obj[txt];

            //increase
            for (var j in data['$inc'])
                if (oo[j] == undefined)
                    oo[j] = data['$inc'][j];
                else
                    oo[j] += data['$inc'][j];
                //set
            for (var j in data['$set'])
                oo[j] = data['$set'][j];

            //console.log( oo );
        }
        var arr = [];
        for (var i in obj)
            arr.push(obj[i]);
        return arr;
    };
};

var MongoConnector = function (opts) {
    this.mdb = null;

    if (opts == undefined)
        opts = {};

    opts.connectString = opts.connectString || 'mongodb://127.0.0.1:27017/MMT';

    var self = this;

    var cache = {
        minute: new Cache("minute"),
        hour: new Cache("hour"),
        day: new Cache("day")
    }


    //use to delete old data from "traffic" and "traffic_time" collections
    var lastDeletedTime = {
        traffic: {
            ts: null,
            period: 5*60*1000    //delete data older than 5 min
        },
        traffic_min: {
            ts: null,
            period: 60*60*1000    //delete data older than 60 min
        }
    }

    MongoClient.connect(opts.connectString, function (err, db) {
        if (err) throw err;
        self.mdb = db;
        console.log("Connected to Database");
    });


    self.lastTimestamps = {};

    /**
     * Stock a report to database
     * @param {[[Type]]} message [[Description]]
     */
    self.addProtocolStats = function (message) {
        if (self.mdb == null) return;

        var ts = message.time;
        
        self.lastTimestamps[message.format] = ts;

        self.mdb.collection("traffic").insert( message , function (err, records) {
            if (err) console.log( err );
        });


        //add message to cache
        cache.minute.add(message);

        if (cache.minute.lastUpdateTime === undefined)
            cache.minute.lastUpdateTime = ts;

        //if cache is in minute ==> UPDATE Minute
        else if (ts - cache.minute.lastUpdateTime >= 60 * 1000) {

            var data = cache.minute.getData();
            self.mdb.collection("traffic_min").insert(data, function (err, records) {
                if (err) console.log( err );
                console.log(">>>>>>> flush " + data.length + " records to traffic_min");
            });
            cache.minute.lastUpdateTime = ts;
            cache.minute.clear();

            cache.hour.addArray(data);

            // Update Hour
            if (cache.hour.lastUpdateTime === undefined)
                cache.hour.lastUpdateTime = ts;
            else if (ts - cache.hour.lastUpdateTime >= 60 * 60 * 1000) {

                //update traffic hour
                data = cache.hour.getData();
                self.mdb.collection("traffic_hour").insert(data, function (err, records) {
                    if (err) console.log( err );
                    console.log(">>>>>>> flush " + data.length + " records to traffic_hour");
                });
                cache.hour.lastUpdateTime = ts;
                cache.hour.clear();

                cache.day.addArray(data);

                //Update Day
                if (cache.day.lastUpdateTime === undefined)
                    cache.day.lastUpdateTime = ts;
                else if (ts - cache.day.lastUpdateTime >= 24 * 60 * 60 * 1000) {
                    data = cache.day.getData();
                    self.mdb.collection("traffic_day").insert(data, function (err, records) {
                        if (err) console.log( err );
                        console.log(">>>>>>> flush " + data.length + " records to traffic_day");
                    });

                    cache.day.lastUpdateTime = ts;
                    cache.day.clear();
                }

            }

        }
        
        //delete Trafic        
        for (var i in lastDeletedTime ){
            var last = lastDeletedTime[i];

            if( last.ts == undefined )
                last.ts = ts;
            else if( ts - last.ts >= last.period ){
                
                //Delete old data in traffic. Retain only data from the last hour
                self.mdb.collection( i ).deleteMany({
                    time: {
                        "$lt": last.ts
                    }
                },
                function (err, result) {
                    if (err) throw err;
                    console.log("<<<<< delete records in traffic older than " + (new Date(last.ts)).toLocaleTimeString() );
                });
                
                last.ts = ts;
            }
        }
    };


    /**
     * [[Description]]
     * @param {Object}   options  [[Description]]
     * @param {[[Type]]} callback [[Description]]
     */
    self.getProtocolStats = function (options, callback) {
        console.log(options);

        var start_ts = (new Date()).getTime();

        var cursor = self.mdb.collection(options.collection).find({
            format: {
                $in: options.format
            },
            "time": {
                '$gte': options.time.begin,
                '$lte': options.time.end
            }
        });

        cursor.toArray(function (err, doc) {
            if (err) {
                callback('InternalError');
                return;
            }

            var end_ts = (new Date()).getTime();
            var ts = end_ts - start_ts;

            console.log("\n got " + doc.length + " records, took " + ts + " ms\n");

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

        for (var i in formats) {
            var fo = formats[i];
            if (self.lastTimestamps[fo]) {
                cb(null, self.lastTimestamps[fo]);
                return;
            }
        }

        self.mdb.collection("traffic").find({
            format: {
                $in: formats
            }
        }).sort({
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
};

module.exports = MongoConnector;