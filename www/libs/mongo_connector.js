var moment = require('moment');
var dataAdaptor = require('./dataAdaptor.js');

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

    self.updateHistoricalStats = function (message) {
        // For Protocol stats, update minutes and hours stats
        if (message.format === 100) { //TODO: replace with definition
            self.insertUpdateDB("traffic_min", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                path: message.path,
                time: moment(message.time).startOf('minute').valueOf()
            }, {
                '$set': {
                    flowcount: message.flowcount,
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
            });

            self.insertUpdateDB("traffic_hour", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                path: message.path,
                time: moment(message.time).startOf('hour').valueOf()
            }, {
                '$set': {
                    flowcount: message.flowcount,
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
            });

            self.insertUpdateDB("traffic_day", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                path: message.path,
                time: moment(message.time).startOf('day').valueOf()
            }, {
                '$set': {
                    flowcount: message.flowcount,
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
            });
        } else if (message.format === 0) {
            self.insertUpdateDB("traffic_min", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('minute').valueOf()
            }, {
                '$inc': {
                    dl_data: message.dl_data,
                    ul_data: message.ul_data,
                    dl_packets: message.dl_packets,
                    ul_packets: message.ul_packets,
                    count: 1
                }
            });

            self.insertUpdateDB("traffic_hour", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('hour').valueOf()
            }, {
                '$inc': {
                    dl_data: message.dl_data,
                    ul_data: message.ul_data,
                    dl_packets: message.dl_packets,
                    ul_packets: message.ul_packets,
                    count: 1
                }
            });
            self.insertUpdateDB("traffic_day", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('day').valueOf()
            }, {
                '$inc': {
                    dl_data: message.dl_data,
                    ul_data: message.ul_data,
                    dl_packets: message.dl_packets,
                    ul_packets: message.ul_packets,
                    count: 1
                }
            });
        } else if (message.format === 1) { //TODO: replace with definition
            self.insertUpdateDB("traffic_min", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('minute').valueOf()
            }, {
                '$inc': {
                    response_time: message.response_time,
                    transactions_count: message.transactions_count,
                    interaction_time: message.interaction_time,
                    count: 1
                }
            });

            self.insertUpdateDB("traffic_hour", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('hour').valueOf()
            }, {
                '$inc': {
                    response_time: message.response_time,
                    transactions_count: message.transactions_count,
                    interaction_time: message.interaction_time,
                    count: 1
                }
            });

            self.insertUpdateDB("traffic_day", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('day').valueOf()
            }, {
                '$inc': {
                    response_time: message.response_time,
                    transactions_count: message.transactions_count,
                    interaction_time: message.interaction_time,
                    count: 1
                }
            });
        } else if (message.format === 3) { //TODO: replace with definition
            self.insertUpdateDB("traffic_min", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('minute').valueOf()
            }, {
                '$inc': {
                    packet_loss: message.packet_loss,
                    packet_loss_burstiness: message.packet_loss_burstiness,
                    jitter: message.jitter,
                    count: 1
                }
            });

            self.insertUpdateDB("traffic_hour", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('hour').valueOf()
            }, {
                '$inc': {
                    packet_loss: message.packet_loss,
                    packet_loss_burstiness: message.packet_loss_burstiness,
                    jitter: message.jitter,
                    count: 1
                }
            });

            self.insertUpdateDB("traffic_day", {
                format: message.format,
                probe: message.probe,
                source: message.source,
                time: moment(message.time).startOf('day').valueOf()
            }, {
                '$inc': {
                    packet_loss: message.packet_loss,
                    packet_loss_burstiness: message.packet_loss_burstiness,
                    jitter: message.jitter,
                    count: 1
                }
            });
        }
    };

    self.addProtocolStats = function (message) {
        if (self.mdb == null) return;
        self.mdb.collection("traffic").insert(message, function (err, records) {
            if (err) return;
            self.updateHistoricalStats(message);
        });
    };

    self.getProtocolStats = function (options, callback) {
        self.mdb.collection(options.collection).find({
            format: options.format,
            "time": {
                '$gte': options.time.begin,
                '$lte': options.time.end
            }
        }).sort({
            time: 1
        }).toArray(function (err, doc) {
            if (err) {
                callback('InternalError');
                return;
            }
            console.log(" got " + doc.length + " records");
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

    self.getLastTime = function (cb, err_cb) {
        if (self.mdb == null) return;
        self.mdb.collection("traffic").find().sort({
            "time": -1
        }).limit(1).toArray(function (err, doc) {
            if (err) {
                cb(err);
                return;
            }
            if (Array.isArray(doc) && doc.length > 0)
                cb(null, doc[0].time);
            else
                cb(null, (new Date()).getTime());
        });
    };
};

module.exports = MongoConnector;