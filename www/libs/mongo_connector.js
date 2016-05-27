var moment      = require('moment');
var dataAdaptor = require('./dataAdaptor.js');
var Window      = require("./window.js");
var AppList     = require("./app-list.js");
var ipLib       = require("ip");

// var ip2loc      = require("");

var DataCache   = require("./cache.js");
var MongoClient = require('mongodb').MongoClient,
    format      = require('util').format;

var MongoConnector = function (opts) {
    this.mdb = null;

    if (opts == undefined)
        opts = {};

    opts.connectString = opts.connectString || 'mongodb://127.0.0.1:27017/MMT';

    var self = this;
    var COL  = dataAdaptor.StatsColumnId;
    var HTTP = dataAdaptor.HttpStatsColumnId;
    var NDN  = dataAdaptor.NdnColumnId;
    var FTP  = dataAdaptor.FtpStatsColumnId;

    var FORMAT_ID = 0, PROBE_ID = 1, SOURCE_ID = 2, TIMESTAMP = 3;
    var FLOW_SESSION_INIT_DATA = {};//init data of each session

    //all columns of HTTP => they cover all columns of SSL,RTP et FTP
    var init_session_set = [];
    for( var i = COL.FORMAT_TYPE ; i <= FTP.FILE_NAME; i++){
        //exclude set
        if( [ HTTP.RESPONSE_TIME, HTTP.TRANSACTIONS_COUNT ].indexOf( i ) == -1 )
            init_session_set.push( i );
    }
    init_session_set.push( COL.START_TIME );

    MongoClient.connect(opts.connectString, function (err, db) {
        if (err) throw err;
        self.mdb       = db;
        self.appList   = new AppList( db );
        self.startTime = (new Date()).getTime();

        self.operatorStatus.set("start");
        self.dataCache = {

            total: new DataCache(db, "data_total",
                                 //key
                                 [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID],
                                 //inc
                                 [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME, COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT,
                                 COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
                                 COL.RTT_MAX_CLIENT, COL.RTT_MAX_SERVER,
                                 COL.RTT_MIN_CLIENT, COL.RTT_MIN_SERVER,
                                 HTTP.RESPONSE_TIME, HTTP.TRANSACTIONS_COUNT
                                 ],
                                 []),

            //this contain an app (E.IP.TCP.HTTP ) and its parents (E, E.IP, E.IP.TCP)
            app: new DataCache(db, "data_app",
                               [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.APP_PATH, COL.APP_ID],
                               //inc
                               [COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
                                COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
                                COL.RTT_MAX_CLIENT, COL.RTT_MAX_SERVER,
                                COL.RTT_MIN_CLIENT, COL.RTT_MIN_SERVER,
                                HTTP.RESPONSE_TIME, HTTP.TRANSACTIONS_COUNT]),

            ip: new DataCache(db, "data_ip",
                               [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.IP_SRC,
                               //inc
                               [COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
                                COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
                                COL.RTT_MAX_CLIENT, COL.RTT_MAX_SERVER,
                                COL.RTT_MIN_CLIENT, COL.RTT_MIN_SERVER,
                                HTTP.RESPONSE_TIME, HTTP.TRANSACTIONS_COUNT],
                               //set
                               [COL.MAC_SRC]]),


            session: new DataCache(db, "data_session",
                                   //key
                               [COL.FORMAT_ID, COL.PROBE_ID, COL.SESSION_ID],
                                   //inc
                               [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
                                 COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
                                COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME,
                                 COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER,
                                 COL.RTT_MAX_CLIENT, COL.RTT_MAX_SERVER,
                                 COL.RTT_MIN_CLIENT, COL.RTT_MIN_SERVER,
                                 HTTP.RESPONSE_TIME,
                                 HTTP.TRANSACTIONS_COUNT,
                               ],
                                   //set
                               [COL.APP_ID, COL.APP_PATH, COL.MAC_SRC, COL.MAC_DEST, COL.PORT_SRC, COL.PORT_DEST, COL.IP_SRC, COL.IP_DEST, COL.SRC_LOCATION, COL.DST_LOCATION],
                                  //init
                               init_session_set
                                  ),

            mac: new DataCache(db, "data_mac",
                               [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.MAC_SRC],
                               [COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PACKET_COUNT, COL.DL_PACKET_COUNT, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME, COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME], [], [COL.START_TIME], 5*60*1000),

            ndn: new DataCache(db, "data_ndn", [COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID,
                                                NDN.MAC_SRC, NDN.NAME],
                               //inc
                              [NDN.NB_INTEREST_PACKET,  NDN.DATA_VOLUME_INTEREST, NDN.NDN_VOLUME_INTEREST, NDN.NB_DATA_PACKET,  NDN.DATA_VOLUME_DATA, NDN.NDN_VOLUME_DATA],
                              //set
                              [NDN.IS_OVER_TCP, NDN.MAC_DEST, NDN.IP_SRC, NDN.IP_DEST, NDN.PORT_SRC, NDN.PORT_DEST, NDN.DATA_FRESHNESS_PERIOD, NDN.INTEREST_LIFETIME,21,22,23]),

        };

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
        if( self.lastPacketTimestamp < ts ){
            self.lastPacketTimestamp = ts;
            //update status of probe ==> it is alive
            self.probeStatus.set( ts );
        }
    };

    var update_proto_name = function( msg ){
        //An app is reported as a protocol
        if( dataAdaptor.ParentProtocol.indexOf( msg[ COL.APP_ID   ]  ) > -1 ){
            var format_type = msg[ COL.FORMAT_TYPE ];
            var app_name    = "unknown";
            /*
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
            else
                */
                if( msg[ COL.PORT_DEST ] != undefined )

                //server_port
                app_name = msg[ COL.PORT_DEST ];

            //if( app_name == 0 )
            //    console.log( msg );

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
            msg[ COL.ACTIVE_FLOWS ] = 1;//one msg is a report of a session

            //as 2 threads may produce a same session_ID for 2 different sessions
            //this ensures that session_id is unique
            msg[ COL.SESSION_ID   ] = msg[ COL.SESSION_ID ] + "-" + msg[ COL.THREAD_NUMBER ];

            //group msg by each period
            var mod = Math.ceil( (ts - self.startProbeTime) / (self.config.probe_stats_period * 1000) );
            msg[ TIMESTAMP ] = self.startProbeTime + mod * ( self.config.probe_stats_period * 1000 );

            update_packet_timestamp( msg[ TIMESTAMP ] );

            if( format === 100 ){
              //HTTP
              if( msg[ COL.FORMAT_TYPE ] == 1 ){
                  //each HTTP report is a unique session (1 request - 1 resp if it has)
                  msg[ COL.SESSION_ID ] = msg[ COL.SESSION_ID ] + "-" + msg[ HTTP.REQUEST_ID ];
                  if( msg[ HTTP.FRAGMENTATION ] == 0 ){
                    msg[ COL.ACTIVE_FLOWS ] = 0;
                  }
              }
            }

            self.dataCache.total.addMessage(   msg );

            //session
            if( format === 100 ){

                //save init data of one session
                /*
                var session_id = msg[ COL.SESSION_ID ];
                //if init session or timeout
                if( FLOW_SESSION_INIT_DATA[ session_id ] === undefined ||  ts - FLOW_SESSION_INIT_DATA[ session_id ][ TIMESTAMP ] > 1000*60*60 )
                    FLOW_SESSION_INIT_DATA[ session_id ] = msg;
                else{
                    //update timestamp
                    FLOW_SESSION_INIT_DATA[ session_id ][ TIMESTAMP ] = ts;
                    for( var i in init_session_set ){
                        var key = init_session_set[ i ];
                        var val = FLOW_SESSION_INIT_DATA[ session_id ][ key ];
                        if( val != undefined )
                            msg[ key ] = val;
                    }
                }
                */

                update_proto_name( msg );
                //each session
                self.dataCache.session.addMessage( msg );
                //for each MAC SRC
                self.dataCache.mac.addMessage(     msg );
                //for each IP src
                self.dataCache.ip.addMessage(      msg );

                //add traffic for the other side (src <--> dest )
                msg2 = JSON.parse( JSON.stringify( msg ) ); //clone
                msg2 = dataAdaptor.inverseStatDirection( msg2 );
                //we must not increase number of active flows
                msg2[ COL.ACTIVE_FLOWS ] = 0;
                msg2[ HTTP.TRANSACTIONS_COUNT ] = 0;
                msg2[ HTTP.RESPONSE_TIME ] = 0;
                //change session_id of this clone message
                msg2[ COL.SESSION_ID ] = "-" + msg2[ COL.SESSION_ID ];
                //only if it is local
                //as the message is swapped: msg2.COL.IP_SRC == msg.COL.IP_DEST
                if( dataAdaptor.isLocalIP( msg2[ COL.IP_SRC ] )){
                    self.dataCache.session.addMessage(  msg2 );
                    //for each ip dest
                    self.dataCache.ip.addMessage(  msg2 );
                }

                //for eac mac dest
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

         if ( format === dataAdaptor.CsvFormat.OTT_QOS) {
            update_packet_timestamp( ts );
            self.mdb.collection("ott_qos").insert(msg, function (err, records) {
                if (err) console.error(err.stack);
            });
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
        if( self.mdb )
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
        if( options.format.length > 1 )
          options.query[ FORMAT_ID ] = {$in: options.format };
        else
          options.query[ FORMAT_ID ] = options.format[0];

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

        /*if( options.period_groupby == "real") {
            self.getCurrentProtocolStats(options, callback);
            return;
        }
        */

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
        console.log(action, " on [", collection, "] query : ", JSON.stringify(query) );

        //flush caches to DB before query
        for( var i in self.dataCache ){
            var cache = self.dataCache[ i ];
            if( collection.indexOf( cache.option.collection_name ) == 0 ){
              //data_total_real => real
              cache.flushCaches( collection.split("_")[2] );
              break;//only one collection concernts to this query
            }
        }

        var start_ts = (new Date()).getTime();
        var cursor   = {};
        if( action == "aggregate" )
          cursor = self.mdb.collection(collection).aggregate(query);
        //query of "find" uses the format of "aggreate": $match, $project, $limit, $sort
        else if ( action == "find" ){

          //older: query is a $match expression
          if( query.constructor !== Array)
            query = [{$match: query}];
          //end older

          var old_query = query;
          query = {};
          for( var i in old_query ){
            var obj = old_query[i];//{$match: {}}
            for( var key in obj )
              query[ key ] = obj[ key ];
          }

          if( query.$limit == undefined || query.$limit > 5000 )
            query.$limit = 5000;

          if( query.$project )
            cursor = self.mdb.collection(collection).find( query.$match, query.$project );
          else
            cursor = self.mdb.collection(collection).find( query.$match);
          cursor = cursor.limit( query.$limit );

          if( query.$sort )
            cursor = cursor.sort( query.$sort );
        }


        cursor.toArray(function (err, doc) {
            if (err) {
                callback(err);
                return;
            }

            var end_ts = (new Date()).getTime();
            var ts     = end_ts - start_ts;

            console.log("got " + doc.length + " records, took " + ts + " ms");

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

                console.log("converted " + doc.length + " records, took " + ts + " ms");
                callback(null, data);
            } else {
                callback(null, doc);
            }
        });
    }

    self.queryTop = function (options, total, callback) {
        var groupby = { "_id": "$" + total.group_by }; //"$path",

        //, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS
        [ COL.DATA_VOLUME ].forEach( function(el, index ){
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


                self.queryDB(options.collection, "find", options.query, callback, options.raw, options.projection);
            }, false);
    };

        /**
         * [[Description]]
         * @param {Object}   options  [[Description]]
         * @param {[[Type]]} callback [[Description]]
         */
    self.getCurrentProtocolStats = function (options, callback) {
        if (options.id !== "") {

            if (["link.protocol", "dpi.app", "dpi.detail"].indexOf(options.id) > -1){
                options.collection = "data_app_" + options.period_groupby;
            }else if (["link.traffic"].indexOf(options.id) > -1)
                options.collection = "data_total_" + options.period_groupby;
            else if (["link.nodes"].indexOf(options.id) > -1)
                options.collection = "data_mac";
            else if (["network.user"].indexOf(options.id) > -1)
                options.collection = "data_ip_" + options.period_groupby;
            else if (["network.country"].indexOf(options.id) > -1)
                options.collection = "data_session_" + options.period_groupby;
            else if (["network.profile","network.detail", "network.destination",  "app.detail", "app.list"].indexOf(options.id) > -1)
                options.collection = "data_session_" + options.period_groupby;
            else if( options.id === "chart.license")
                options.collection = "license";
            else if (["ndn.name", "ndn.mac", "ndn.detail"].indexOf(options.id) > -1){
                options.collection = "data_ndn_" + options.period_groupby;
                if( options.userData && options.userData.mac != undefined )
                    options.query[ dataAdaptor.NdnColumnId.MAC_SRC  ] = options.userData.mac;
                if( options.userData && options.userData.name != undefined )
                    options.query[ dataAdaptor.NdnColumnId.NAME  ] = decodeURI( options.userData.name );
            }
            else if (["app.responsetime"].indexOf( options.id ) > - 1){
                //when we need detail of one app
                if( options.userData && options.userData.app_id && options.userData.app_id != 0 ){
                    options.collection          = "data_app_" + options.period_groupby;
                    options.query[ COL.APP_ID ] = parseInt( options.userData.app_id );
                }else
                    options.collection = "data_total_" + options.period_groupby;
            }
            else {
                console.error("Not yet implemented for " + options.id);
                callback(null, ["Not yet implemented"]);
                return;
            }



            //projection
            if (["link.protocol", "dpi.app", "dpi.detail"].indexOf(options.id) > -1){
                options.projection = {};
                [0,1,2,3, COL.APP_PATH, COL.APP_ID, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ] .forEach(
                    function (el, index){ options.projection[ el ] = 1; }
                );
            }

            if (options.id === "link.protocol") {
                //get total data of each app
                self.queryTop( options, {
                    group_by        : COL.APP_PATH,
                    size            : 12,
                    filter          : function( path ){
                        if( path == null )
                            return false;
                        if( path === "99" )//ethernet: total
                            return true;
                        //maxi 3
                        if( dataAdaptor.getAppLevelFromPath( path ) > 4 )
                            return false;

                        var app  = dataAdaptor.getAppIdFromPath( path ) ;
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
                if( self.config.probe_analysis_mode == "online"){
                    options.query[ TIMESTAMP ]['$gte'] = (self.startProbeTime == undefined) ? self.startTime : self.startProbeTime;
                    self.queryDB(options.collection, "find", options.query, callback, options.raw);
                    return;
                }
                //offline: last packet timestamp
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

                //desc
                var sort = {}; sort[ COL.PAYLOAD_VOLUME ] = -1;

                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby},
                    {"$sort" : sort},
                    {"$limit": 500}
                    ], callback, options.raw );
                return;
            }

            if ( options.id === "dpi.detail") {
                if( options.userData ){
                    if( options.userData.app_path ){

                        if( Array.isArray( options.userData.app_path )){
                          if( options.userData.app_path.length > 1 )
                            options.query[ COL.APP_PATH ]  = {'$in' : options.userData.app_path};
                          else
                            options.query[ COL.APP_PATH ]  = options.userData.app_path[ 0 ];
                        }else
                            options.query[ COL.APP_PATH ]  = options.userData.app_path;

                        self.queryDB( options.collection, "find", options.query, callback, options.raw );
                        return;
                    }
                }
                callback(null, "need app_path");
            }

            if (options.id === "network.detail" || options.id === "app.detail" ) {
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
                [ COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME, COL.UL_PAYLOAD_VOLUME, COL.DL_PAYLOAD_VOLUME,
                   COL.ACTIVE_FLOWS, COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$sum" : "$" + el };
                });
                //init
                [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.START_TIME ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$first" : "$" + el };
                });
                var start = COL.IP_SRC;
                for( var i=start; i<= FTP.FILE_NAME; i++){
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

            if (options.id === "network.profile" || options.id === "app.list" || options.id === "dpi.app") {
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

                //desc
                var sort = {}; sort[ COL.PAYLOAD_VOLUME ] = -1;
                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby},
                    {"$sort" : sort},
                    {"$limit": 5000}
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

                //desc
                var sort = {}; sort[ COL.PAYLOAD_VOLUME ] = -1;

                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby},
                    {"$sort" : sort},
                    {"$limit": 5000}
                    ], callback, options.raw );
                return;
            }

            if (options.id === "network.country"){
                var groupby = { "_id": "$" + COL.SRC_LOCATION };
                [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$sum" : "$" + el };
                });
                // [ COL.SRC_LOCATION, COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.TIMESTAMP, COL.IP_SRC, COL.MAC_SRC ].forEach(
                [ COL.SRC_LOCATION, COL.SOURCE_ID, COL.TIMESTAMP, COL.IP_SRC, COL.MAC_SRC ].forEach(
                    function(el, index ){
                        groupby[ el ] = { "$first" : "$" + el };
                });

                //desc
                var sort = {}; sort[ COL.SRC_LOCATION ] = -1;

                self.queryDB(options.collection,
                "aggregate", [
                    {"$match": options.query},
                    {"$group": groupby},
                    {"$sort" : sort},
                    {"$limit": 500}
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

        if( options.id  == "ndn.name" ){
                               //inc
             var groupby = { "_id": {name: "$" + NDN.NAME, probe: "$" + COL.PROBE_ID } };
            [NDN.NB_INTEREST_PACKET,  NDN.DATA_VOLUME_INTEREST, NDN.NDN_VOLUME_INTEREST, NDN.NB_DATA_PACKET,  NDN.DATA_VOLUME_DATA, NDN.NDN_VOLUME_DATA ].forEach(
                function(el, index ){
                    groupby[ el ] = { "$sum" : "$" + el };
            });
            [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, NDN.NAME ].forEach(
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

        if( options.id  == "ndn.mac" ){
                               //inc
             var groupby = { "_id": {name: "$" + NDN.MAC_SRC, probe: "$" + COL.PROBE_ID } };
            [NDN.NB_INTEREST_PACKET,  NDN.DATA_VOLUME_INTEREST, NDN.NDN_VOLUME_INTEREST, NDN.NB_DATA_PACKET,  NDN.DATA_VOLUME_DATA, NDN.NDN_VOLUME_DATA ].forEach(
                function(el, index ){
                    groupby[ el ] = { "$sum" : "$" + el };
            });
            [ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, NDN.MAC_SRC ].forEach(
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
                else
                    cb( err );
            });

        });
    };


    self.close = function( cb ){
        self.operatorStatus.set("shutdown");
        self.flushCache( cb );
    }
};

module.exports = MongoConnector;
