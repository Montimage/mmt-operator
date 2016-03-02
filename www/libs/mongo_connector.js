var moment      = require('moment');
var dataAdaptor = require('./dataAdaptor.js');
var Window      = require("./window.js");
var AppList     = require("./app-list.js");
var ipLib       = require("ip");

var DataCache   = require("./cache.js");
var MongoClient = require('mongodb').MongoClient,
    format      = require('util').format;

var MongoConnector = function (opts) {
    this.mdb = null;

    if (opts == undefined)
        opts = {};

    opts.connectString = opts.connectString || 'mongodb://127.0.0.1:27017/MMT';

    var self = this;
    var COL = dataAdaptor.StatsColumnId;
    var NDN = dataAdaptor.NdnColumnId;
    var FORMAT_ID = 0, PROBE_ID = 1, SOURCE_ID = 2, TIMESTAMP = 3;
    var FLOW_SESSION_INIT_DATA = {};//init data of each session
    
    //all columns of HTTP => they cover all columns of SSL,RTP et FTP
    var init_session_set = [];
    for( var i=0; i<10; i++) init_session_set.push( COL.PORT_SRC + i + 1 );
        init_session_set.push( COL.START_TIME );
    
    MongoClient.connect(opts.connectString, function (err, db) {
        if (err) throw err;
        self.mdb       = db;
        self.appList   = new AppList( db );
        self.startTime = (new Date()).getTime();
        
        self.operatorStatus.set("start");
        
        
        self.dataCache = {
            
            total: new DataCache(db, "data_total", [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID], 
                                 [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME, COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT], []),
            
            //this contain an app (E.IP.TCP.HTTP ) and its parents (E, E.IP, E.IP.TCP)
            app: new DataCache(db, "data_app", 
                               [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.SESSION_ID, COL.APP_PATH, COL.APP_ID],
                               //inc
                               [COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME]),
            
            session: new DataCache(db, "data_session", 
                                   //key
                               [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.SESSION_ID,  COL.IP_SRC],
                                   //inc
                               [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, 
                                COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME],
                                   //set
                               [COL.APP_ID, COL.APP_PATH, COL.MAC_SRC, COL.MAC_DEST, COL.PORT_SRC, COL.PORT_DEST, COL.IP_SRC, COL.IP_DEST],
                                  //init
                               init_session_set
                                  ),
            
            mac: new DataCache(db, "data_mac", [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.MAC_SRC],
                               [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME, COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME], [], [COL.START_TIME], 5*60*1000),
         
            ndn: new DataCache(db, "data_ndn", [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID,
                                                NDN.MAC_SRC, NDN.NAME],
                               //inc
                              [NDN.NB_INTEREST_PACKET,  NDN.DATA_VOLUME_INTEREST, NDN.NDN_VOLUME_INTEREST, NDN.NB_DATA_PACKET,  NDN.DATA_VOLUME_DATA, NDN.NDN_VOLUME_DATA],
                              //set
                              [NDN.IS_OVER_TCP, NDN.MAC_DEST, NDN.IP_SRC, NDN.IP_DEST, NDN.PORT_SRC, NDN.PORT_DEST, NDN.DATA_FRESHNESS_PERIOD, NDN.INTEREST_LIFETIME]),
            
        }

        console.log("Connected to Database");
    });

    self.probeStatus = {
        set: function( last_update ){
            if( self.startProbeTime == undefined ){
                //useful when no element in collection "probe_status"
                self.startProbeTime = last_update;
                self.mdb.collection("probe_status").find({}).sort({"start": -1}).toArray( function( err, arr){
                    if( err || arr.length == 0 )
                        return;
                    
                    self.startProbeTime = arr[0].start;
                    var start           = self.startProbeTime;
                
                    self.mdb.collection("probe_status").update( {start: start}, {last_update: last_update});
                } );
                
                return;
            }
            
            var start = self.startProbeTime;
            
            self.mdb.collection("probe_status").update( {start: start}, {start: start, last_update: last_update}, {upsert: true});
        },
        get: function( period, callback ){
            self.mdb.collection("probe_status").find(
                //TODO: not need to get all history of probe
                //{start: {$gte : period.begin}, last_update: { $lte: period.end}}
            ).toArray( callback );
        }
    };

    self.operatorStatus = {
        set: function( status ){
            var date = (new Date()).getTime();
            self.mdb.collection("operator_status").insert({time: date, status: status});
        },
        get: function( period, callback ){
            self.mdb.collection("operator_status").find({time: {$gte : period.begin, $lte: period.end}}).toArray( callback );
        }
    };
    self.lastPacketTimestamp = 0;
    
    self.splitDomainName = function( domain_name ){
        //192.168.0.7
        if( ipLib.isV4Format( domain_name) || ipLib.isV6Format( domain_name) )
            return domain_name;
        
        //"p01-btmmdns.icloud.com."
        var index = domain_name.lastIndexOf(".");
        if( index > -1 )
            domain_name = domain_name.substr(0, index );
        
        index = domain_name.lastIndexOf(".");
        if( index > -1 )
            domain_name = domain_name.substr(index + 1);
        
        return domain_name;
    };

    var update_packet_timestamp = function( ts ){
        if( self.lastPacketTimestamp < ts )
            self.lastPacketTimestamp = ts;
    };
    
    var update_proto_name = function( msg ){
        //An app is reported as a protocol
        if( dataAdaptor.ParentProtocol.indexOf( msg[ COL.APP_ID   ]  ) > -1 ){
            var format_type = msg[ 24 ];
            var app_name    = "unknown";
            //do not know
            if( format_type === 0 && msg[ 27 ] != undefined  && msg[ 27 ]){
                app_name = self.splitDomainName( msg[ 27 ] );
            }
            //HTTP hostname
            else if( format_type === 1 && msg[ 30 ] != undefined  && msg[ 30 ] != ""){
                app_name = self.splitDomainName( msg[ 30 ] );
            }
            //SSL hostname
            else if( format_type === 2 && msg[ 27 ] != undefined  && msg[ 27 ] != ""){
                app_name = self.splitDomainName( msg[ 27 ] );
            }
            //
            else if( msg[ COL.PORT_DEST ] != undefined )
                //server_port
                app_name = msg[ COL.PORT_DEST ];

            if( app_name == 0 )
                console.log( msg );

            app_name = msg[ COL.APP_ID ] + ":" + app_name;

            msg[ COL.APP_ID   ]  =       self.appList.upsert( app_name ) ;
            msg[ COL.APP_PATH ] += "." + msg[ COL.APP_ID   ];
        }else
            msg[ COL.APP_ID   ] = msg[ COL.APP_ID   ];
    }
    
    /**
     * Stock a report to database
     * @param {[[Type]]} message [[Description]]
     */
    self.addProtocolStats = function (message) {
        if (self.mdb == null) return;

        var msg = dataAdaptor.formatReportItem(message);
        var msg2;
        var ts = msg[ TIMESTAMP ];
        if( self.startProbeTime == undefined )
            self.startProbeTime = ts;
        
        
        var format = msg[ FORMAT_ID ];
        
        if ( format === 100 || format === 99 ){
            
            //group msg by each period
            var mod = Math.ceil( (ts - self.startProbeTime) / (self.config.probe_stats_period * 1000) );
            msg[ TIMESTAMP ] = self.startProbeTime + mod * ( self.config.probe_stats_period * 1000 );

            update_packet_timestamp( msg[ TIMESTAMP ] );
            
            self.dataCache.total.addMessage(   msg );
            
            if( format === 100 ){
                //save init data of one session
                var session_id = msg[ COL.SESSION_ID ];
                if( FLOW_SESSION_INIT_DATA[ session_id ] === undefined )
                    FLOW_SESSION_INIT_DATA[ session_id ] = msg;
                else
                    for( var i in init_session_set ){
                        var key    = init_session_set[ i ];
                        msg[ key ] = FLOW_SESSION_INIT_DATA[ session_id ][ key ];
                    }

                update_proto_name( msg );
                
                self.dataCache.session.addMessage( msg );
                self.dataCache.mac.addMessage(     msg );
                
                //add traffic for the other side (src <--> dest )
                msg2 = JSON.parse( JSON.stringify( msg ) ); //clone
                msg2 = dataAdaptor.inverseStatDirection( msg2 );
                //only if it is local
                //as the message is swapped: msg2.COL.IP_SRC == msg.COL.IP_DEST
                if( dataAdaptor.isLocalIP( msg2[ COL.IP_SRC ] )){
                    self.dataCache.session.addMessage(  msg2 );
                }

                self.dataCache.mac.addMessage( msg2 );
                
            }
            
            
            //add traffic for each app in the app_path
            msg2 = msg;
            var arr = [];
            do{
                arr.push( msg2 );
                
                index = msg2[ COL.APP_PATH ].lastIndexOf(".");
                if( index === -1 ) break; //root
                //clone
                msg2                  = JSON.parse(JSON.stringify( msg2 )); //clone
                msg2[ COL.APP_PATH ]  = msg2[ COL.APP_PATH ].substr( 0, index  );
                index                 = msg2[ COL.APP_PATH ].lastIndexOf(".");
                msg2[ COL.APP_ID   ]  = msg2[ COL.APP_PATH ].substr( index + 1 );
            }
            while( true );
            self.dataCache.app.addArray( arr );
            

        }else if (format === 0 || format == 1 || format == 2){
            update_packet_timestamp( ts );
            //delete data when a session is expired
            var session_id = msg[ 4 ];
            if( FLOW_SESSION_INIT_DATA[ session_id ] !== undefined ){
                delete FLOW_SESSION_INIT_DATA[ session_id ];
                //console.log( "deleted session " + session_id );
            }
            else{
                console.log( "unknown session " + session_id );
            }
        }
            
        if ( format === dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT || format === dataAdaptor.CsvFormat.BA_PROFILE_FORMAT) {
            update_packet_timestamp( ts );
            self.mdb.collection("behaviour").insert(msg, function (err, records) {
                if (err) console.error(err.stack);
            });
            return;
        }
        
        if ( format === dataAdaptor.CsvFormat.SECURITY_FORMAT) {
            update_packet_timestamp( ts );
            self.mdb.collection("security").insert(msg, function (err, records) {
                if (err) console.error(err.stack);
            });
            return;
        }
        
        if ( format === dataAdaptor.CsvFormat.LICENSE) {
            if( self.startProbeTime == undefined  || self.startProbeTime < ts){
                self.startProbeTime = ts;
                console.log("The last runing probe is " + (new Date( self.startProbeTime )));
                
                self.probeStatus.set( ts );
            }
            return;
        }
        
        
        if( format === dataAdaptor.CsvFormat.DUMMY_FORMAT ){
            self.probeStatus.set( ts );
        }
        
        
        //NDN protocol
        if( format === 625){
            update_packet_timestamp( ts );
            self.dataCache.ndn.addMessage( msg );
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

        options.query = {};
        options.query[ TIMESTAMP ] = {
                '$gte': options.time.begin,
                '$lte': options.time.end
        };
        options.query[ FORMAT_ID ] = {$in: options.format };
            

        var find_in_specific_table = false;
        
        if (options.format.indexOf(dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT) >= 0 || options.format.indexOf(dataAdaptor.CsvFormat.BA_PROFILE_FORMAT) >= 0 ) {
            options.collection     = "behaviour";
            find_in_specific_table = true;
        }
        else if (options.format.indexOf(dataAdaptor.CsvFormat.SECURITY_FORMAT) >= 0 ) {
            if( options.userData.type === "evasion" ){
                options.query[ dataAdaptor.SecurityColumnId.TYPE  ] = "evasion";
            }else
                options.query[ dataAdaptor.SecurityColumnId.TYPE  ] = { "$ne" : "evasion" };
            options.collection     = "security";
            find_in_specific_table = true;
        }
        
        if( find_in_specific_table ){
            self.queryDB(options.collection, "find", options.query, callback, options.raw);
            return;
        }
        
        if( options.period_groupby == "real") {
            self.getCurrentProtocolStats(options, callback);
            return;
        }
        
        
        if (options.id !== undefined ) {
            self.flushCache(function () {
                self.getCurrentProtocolStats(options, callback);
            });
            return;
        }
        
        callback(null, ["tobe implemented"]);
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
        var groupby = { "_id": "$" + total.group_by }; //"$path",

        [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach( function(el, index ){
            groupby[ el ] = { "$sum" : "$" + el };
        });
    
        self.queryDB(options.collection,
            "aggregate", [
                {"$match": options.query},
                {"$group": groupby} ],
            function (err, doc) {
                if (err) {
                    callback(err);
                    return;
                }

                doc.sort(function (a, b) {
                    return b[ COL.DATA_VOLUME ] - a[ COL.DATA_VOLUME ];
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

        if (options.id !== "") {
            if (["link.protocol", "dpi"].indexOf(options.id) > -1)
                options.collection = "data_app_" + options.period_groupby;
            else if (["link.traffic"].indexOf(options.id) > -1)
                options.collection = "data_total_" + options.period_groupby;
            else if (["link.nodes"].indexOf(options.id) > -1)
                options.collection = "data_mac";
            else if (["network.user", "network.profile", "network.destination", "network.detail"].indexOf(options.id) > -1)
                options.collection = "data_session_" + options.period_groupby;
            else if( options.id === "chart.license")
                options.collection = "license";
            else if (["ndn.name", "ndn.mac", "ndn.detail"].indexOf(options.id) > -1){
                options.collection = "data_ndn_" + options.period_groupby;
                if( options.userData && options.userData.mac != undefined )
                    options.query[ dataAdaptor.NdnColumnId.MAC_SRC  ] = options.userData.mac;
                if( options.userData && options.userData.name != undefined )
                    options.query[ dataAdaptor.NdnColumnId.NAME  ] = decodeURI( options.userData.name );
            }else {
                console.error("Not yet implemented for " + options.id);
                callback(null, ["Not yet implemented"]);
                return;
            }

            if (options.id === "link.protocol") {
                //get total data of each app
                self.queryTop( options, {
                    group_by        : COL.APP_PATH,
                    size            : 8,
                    filter          : function( id ){
                        if( id == null )
                            return false;
                        if( id === "99" )//ethernet: total
                            return true;
                        //maxi 3
                        if( dataAdaptor.getAppLevelFromPath( id ) > 4 )
                            return false;
                        
                        var app  = dataAdaptor.getAppIdFromPath( id ) ;
                        if( app < 0 )//an app being child of a protocol is not classified but we know its port
                            return true; 
                        //add only protocol, not application
                        if( dataAdaptor.PureProtocol.indexOf( app ) > -1 )
                            return true;
                        return false;
                    },
                }, callback );
                return;
            }
            
            
            if( options.id === "link.nodes" ){
                options.query[ TIMESTAMP ]['$gte'] = (self.startProbeTime == undefined) ? self.startTime : self.startProbeTime;
                
                self.queryDB(options.collection, "find", options.query, callback, options.raw);
                return;
            }

            if (options.id === "network.user") {
                var groupby = { "_id": "$" + COL.IP_SRC };
                [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$sum" : "$" + el };
                });
                [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.TIMESTAMP, COL.IP_SRC, COL.MAC_SRC ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$first" : "$" + el };
                });
                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby}
                    ], callback, options.raw );
                return;
            }
            
            if (options.id === "network.detail") {
                if( options.userData ){
                    if( options.userData.ip )
                        options.query[ COL.IP_SRC ]  = options.userData.ip;
                    if( options.userData.ip_dest )
                        options.query[ COL.IP_DEST ] = options.userData.ip_dest;
                    if( options.userData.app_id ){
                        options.query[ COL.APP_ID ]  = parseInt( options.userData.app_id );
                    }
                }
                
                //id of group_by
                var groupby = { "_id": "$" + COL.SESSION_ID };
                //sumup
                [ COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$sum" : "$" + el };
                });
                //init
                [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.START_TIME ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$first" : "$" + el };
                });
                var start = COL.IP_SRC;
                for( var i=start; i< start + 18; i++){
                    groupby[ i ] = {"$first": "$" + i};
                }
                
                //last
                [ COL.TIMESTAMP, COL.APP_PATH, COL.APP_ID].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$last" : "$" + el };
                });
                
                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby}
                    ], callback, options.raw );
                return;
            }
            
            if (options.id === "network.profile") {
                if( options.userData ){
                    if( options.userData.ip )
                        options.query[ COL.IP_SRC ] = options.userData.ip;
                }
                //id of group_by
                var groupby = { "_id": "$" + COL.APP_PATH };
                //sumup
                [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$sum" : "$" + el };
                });
                //init
                [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.TIMESTAMP, COL.APP_PATH, COL.APP_ID ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$first" : "$" + el };
                });
                
                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby}
                    ], callback, options.raw );
                return;
            }
            
            if (options.id === "network.destination") {
                if( options.userData ){
                    if( options.userData.ip )
                        options.query[ COL.IP_SRC ] = options.userData.ip;
                }
                
                var groupby = { "_id": "$" + COL.IP_DEST };
                [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$sum" : "$" + el };
                });
                [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.START_TIME, COL.IP_DEST ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$first" : "$" + el };
                });
                groupby[ COL.TIMESTAMP ] = {"$last" : "$" + COL.TIMESTAMP };
                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby}
                    ], callback, options.raw );
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
        if (self.mdb == null){
            cb("Error: database does not exist");
            return;
        } 
        
        if( self.config.probe_analysis_mode == "online"){
            //if online analysis ==> lastime is the current time of operator machine
            var time = (new Date()).getTime();
            time -= self.config.probe_stats_period * 1000;
            cb( null, time );
            return;
        }


        if (self.lastPacketTimestamp > 0) {
            cb(null, self.lastPacketTimestamp);
            return;
        }

        self.mdb.collection("data_total_real").find({}).sort({
            "3": -1 //timestamp
        }).limit(1).toArray(function (err, doc) {
            if (err) {
                console.err( err );
                self.lastPacketTimestamp = (new Date()).getTime();
            } else if (Array.isArray(doc) && doc.length > 0)
                self.lastPacketTimestamp = doc[0][3];


            //as this is in offline mode => do not need to (- self.config.probe_stats_period * 1000)
            //=> get the reports imediately whe they are availables
            cb(null, self.lastPacketTimestamp ) ;
        });
    };


    self.emptyDatabase = function (cb) {
        self.appList.clear();
        for( var i in self.dataCache )
            self.dataCache[i].clear();
        
        self.mdb.dropDatabase(function (err, doc) {
            self.lastPacketTimestamp = 0;

            console.log("drop database!");
            //empty also mmt-bandwidth
            MongoClient.connect('mongodb://' + self.config.database_server + ':27017/mmt-bandwidth', function (err, db) {
                if (!err)
                    db.dropDatabase(function (err, doc) {
                        cb(err);
                    });
            });

        });
    };
    
    
    self.close = function( cb ){
        self.operatorStatus.set("shutdown");
        self.flushCache( cb );
    }
};

module.exports = MongoConnector;