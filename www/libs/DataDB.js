var moment         = require('moment');
var dataAdaptor    = require('./dataAdaptor.js');
var Window         = require("./Window.js");
var AppList        = require("./AppList.js");
var ipLib          = require("ip");
var config         = require("./config.js");
const CONST        = require("./constant.js");
//var ip2loc      = require("");

var MongoClient = require('./mongodb').MongoClient,
format          = require('util').format;

const COL      = dataAdaptor.StatsColumnId;

const FORMAT_ID = COL.FORMAT_ID,
PROBE_ID      = COL.PROBE_ID,
SOURCE_ID     = COL.SOURCE_ID,
TIMESTAMP     = COL.TIMESTAMP,
REPORT_NUMBER = COL.REPORT_NUMBER;

var MongoConnector = function () {
	const self = this;

	self.mdb = null;

	self.onReadyCallback = [];
	self.onReady = function( cb ){
	   if( self.mdb )
	      return cb( self );
	   
		self.onReadyCallback.push( cb );
	}

	MongoClient.connect( config.databaseName, function (err, db) {
		if (err){
			console.error("Cannot connect to Database " );
			console.logStdout("Cannot connect to Database");
			process.exit( 1 );
		}
		
		self.mdb       = db;
		self.appList   = new AppList( db );
		self.startTime = (new Date()).getTime();

		self.operatorStatus.set("start");

		for( var i in self.onReadyCallback ){
			self.onReadyCallback[i]( self );
		}
	});

	
	//get status of mmt-probe
	self.probeStatus = {
			get: function( period, callback ){
				const match = {};
				match[ TIMESTAMP ] = {$gte : period.begin, $lte: period.end };
				const group = { _id : {}};
				group._id[ TIMESTAMP ] = '$' + TIMESTAMP;
				group._id[ PROBE_ID  ] = '$' + PROBE_ID;
				group._ts              = { '$first' : "$" + TIMESTAMP };

				var label = CONST.period.REAL;
				var interval = ( period.end - period.begin );
				//last hour
				if( interval <= 60*60*1000 )
				   label = CONST.period.REAL;
				//last 24 hours
				else if( interval <= 24*60*60*1000 )
				   label = CONST.period.MINUTE;
				else if( interval <= 7*24*60*60*1000 )
               label = CONST.period.HOUR;
				else
				   label = CONST.period.DAY;
				
				self.mdb.collection("data_total_" + label).aggregate( [{$match: match}, {$group: group}, {$sort: {_ts: 1}}], function( err, arr){
					if( err )
						return callback( err );
					//timestamp of the samples of one probe is saved into an array
					var obj = {};
					for( var i=0; i<arr.length; i++ ){
						var probe_id = arr[i]._id[ PROBE_ID ];
						var ts       = arr[i]._id[ TIMESTAMP ];
						
						if( obj[ probe_id ] == undefined )
							obj[ probe_id ] = [];
						obj[ probe_id ].push( ts );
					}
					callback( null, obj );
				});
			},
			resetAll: function(){
				
			}
	};

	self.operatorStatus = {
			set: function( status ){
				var date = (new Date()).getTime();
				self.mdb.collection("operator_status").insertOne({time: date, status: status});
			},
			get: function( period, callback ){
				self.mdb.collection("operator_status").find({time: {$gte : period.begin, $lte: period.end}}).toArray( callback );
			}
	};

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

	const DEFAULT_PORT = {
			//proto : port
			153: 80, //HTTP
			341: 443, //SSL
	}

	var get_port = function( msg ){
		var val = DEFAULT_PORT[ msg[ COL.APP_ID ] ];

		if( msg[ COL.PORT_SRC ] === val || msg[ COL.PORT_DST ] === val )
			return val;
		if( msg[ COL.IP_SRC_INIT_CONNECTION] )
			//remote_port
			return msg[ COL.PORT_DST ];
		else
			//local port
			return msg[ COL.PORT_SRC ];
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

              switch ( msg[ COL.APP_ID ]) {
                case 354://HTTP

                  break;
                default:

              }
			 */
			app_name = get_port( msg );

			//if( app_name == 0 )
			//    console.log( msg );

			app_name = msg[ COL.APP_ID ] + ":" + app_name;
			//get app_id from app_name
			msg[ COL.APP_ID   ]  = self.appList.upsert( app_name ) ;
			//apdaate app_path
			msg[ COL.APP_PATH ] += "." + msg[ COL.APP_ID   ];
		}
		//else
		//    msg[ COL.APP_ID   ] = msg[ COL.APP_ID   ];
	}


	/**
	 * Stock a report in database
	 * @param {[[Type]]} message [[Description]]
	 */
//	self.dbCache = [];
	self.addProtocolStats = function (message) {
		if (self.mdb === null) return;
		
	};


	self.flushCache = function (cb) {

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
		else if( options.format.length == 1 )
			options.query[ FORMAT_ID ] = options.format[0];

		if( options.probe.length > 1 )
			options.query[ PROBE_ID ] = {$in: options.probe };
		else if( options.probe.length == 1 )
			options.query[ PROBE_ID ] = options.probe[0];

		var find_in_specific_table = false;

		if (options.format.indexOf(dataAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT) >= 0 || options.format.indexOf(dataAdaptor.CsvFormat.BA_PROFILE_FORMAT) >= 0 ) {
			options.collection     = "behaviour";
			find_in_specific_table = true;
		}
		else if (options.format.indexOf(dataAdaptor.CsvFormat.SECURITY_FORMAT) >= 0 ) {
			if( options.userData ){
				if( options.userData.type === "evasion" ){
					options.query[ dataAdaptor.SecurityColumnId.TYPE  ] = "evasion";
				}else if( options.userData.type === "security" )
					options.query[ dataAdaptor.SecurityColumnId.TYPE  ] = "security";
			}
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

	self.queryDB = function (collection, action, query, callback, raw) {
		var startTime = (new Date()).getTime();
		//override callback to printout debug message
		var _callback = function( err, data ){
			console.log( action, " on [", collection, "]\n query : ", JSON.stringify(query), 
					"\n got " + ( err? "error" : data.length) + " records", 
					"\n using " + ((new Date()).getTime() - startTime) + "ms"  );
			callback( err, data );
		}

		//flush caches to DB before doing query
		for( var i in self.dataCache ){
			var cache = self.dataCache[ i ];
			if( collection.indexOf( cache.option.collection_name ) == 0 ){
				//data_total_real => real
				var arr = collection.split("_");
				var level = arr[ arr.length - 1 ]; //get the last element
				if( ["real", "minute", "hour", "day"].indexOf( level ) > -1 )
					cache.flushCaches( level, function(){
						self._queryDB( collection, action, query, _callback, raw );
					});
				else{ //data_mac, data_detail
					cache.flushCaches( "real", function(){
						self._queryDB( collection, action, query, _callback, raw );
					});
				}
				return;//only one collection concernts to this query
			}
		}

		self._queryDB( collection, action, query, _callback, raw );
	}
	// Do a query on database. Action can be "find", "aggregate", ...
	self._queryDB = function (collection, action, query, callback, raw) {
		var start_ts = (new Date()).getTime();
		var cursor   = {};
		if( action == "aggregate" )
			cursor = self.mdb.collection(collection).aggregate(query, {
		        allowDiskUse: true,
		        cursor: {batchSize: 1000},
		        maxTimeMS: 60e3
			});
		
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
					if( query[ key ] == undefined)
						query[ key ] = obj[ key ];
					else{
						//old_query may contain 2 $match
						//==> merge them
						for( var j in obj[key] )
							query[ key ][ j ] = obj[ key ][ j ];
					}
			}

			if( query.$limit == undefined )
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

			if( doc.length == 0 )
				return callback( null, [] );

			if (raw === undefined || raw === true) {
				var data = [];
				for ( var i=0; i<doc.length; i++ ) {
					var record;// = doc[i];
					//if( record.last_time )
						//    record.time = record.last_time;

					record = dataAdaptor.reverseFormatReportItem(doc[i]);
					data.push(record);
				}

				callback(null, data);
			} else {
				callback(null, doc);
			}
		});
	}

	self._updateDB = function (collection, action, query, callback, options) {
		self.mdb.collection( collection )[action]( query, options, callback );
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

			if (["link.protocol", "dpi.app", "dpi.detail","network.profile","app.list"].indexOf(options.id) > -1){
				options.collection = "data_app_" + options.period_groupby;
			}else if (["link.traffic"].indexOf(options.id) > -1)
				options.collection = "data_total_" + options.period_groupby;
			else if (["link.nodes"].indexOf(options.id) > -1)
				options.collection = "data_mac";
			else if (["network.user"].indexOf(options.id) > -1)
				options.collection = "data_ip_" + options.period_groupby;
			else if (["network.country"].indexOf(options.id) > -1)
				options.collection = "data_location_" + options.period_groupby;
			else if (["network.ip","network.detail", "network.destination",  "app.detail"].indexOf(options.id) > -1)
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

				self.queryDB(options.collection,
						"aggregate", [
							{"$match": options.query},
							{"$group": groupby},
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
						options.query[ COL.IP_DST ] = options.userData.ip_dest;
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

			if (options.id === "network.ip" || options.id === "network.profile" || options.id === "app.list" || options.id === "dpi.app") {
				if( options.userData ){
					if( options.userData.ip )
						options.query[ COL.IP_SRC ] = options.userData.ip;
				}
				if(options.id === "network.profile" || options.id === "app.list")
					//get only the reports that was generated by mmt-probe (not by mmt-operator)
					options.query.isGen = false;

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

				var groupby = { "_id": "$" + COL.IP_DST };
				[ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach(
						function(el, index ){
							groupby[ el ] = { "$sum" : "$" + el };
						});
				[ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.START_TIME, COL.IP_DST ].forEach(
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
				var groupby = { "_id": "$" + COL.DST_LOCATION };
				[ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.PAYLOAD_VOLUME, COL.ACTIVE_FLOWS ].forEach(
						function(el, index ){
							groupby[ el ] = { "$sum" : "$" + el };
						});
				// [ COL.SRC_LOCATION, COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, COL.TIMESTAMP, COL.IP_SRC, COL.MAC_SRC ].forEach(
				[ COL.SRC_LOCATION, COL.DST_LOCATION, COL.SOURCE_ID, COL.TIMESTAMP ].forEach(
						function(el, index ){
							groupby[ el ] = { "$first" : "$" + el };
						});

				self.queryDB(options.collection,
						"aggregate", [
							{"$match": options.query},
							{"$group": groupby},
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
			var groupby = { "_id": {name: "$" + NDN.QUERY, probe: "$" + COL.PROBE_ID } };
			[NDN.NB_INTEREST_PACKET,  NDN.DATA_VOLUME_INTEREST, NDN.NDN_VOLUME_INTEREST, NDN.NB_DATA_PACKET,  NDN.DATA_VOLUME_DATA, NDN.NDN_VOLUME_DATA ].forEach(
					function(el, index ){
						groupby[ el ] = { "$sum" : "$" + el };
					});
			[ COL.FORMAT_ID, COL.PROBE_ID, COL.SOURCE_ID, NDN.NAME, NDN.QUERY ].forEach(
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
			[ NDN.IFA ].forEach( function( el, index ){
				groupby[ el ] = {"$last" : "$" + el};
			})
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

		if( ! config.is_probe_analysis_mode_offline ){
			//if online analysis ==> lastime is the current time of operator machine
			var time = (new Date()).getTime();
			cb( null, time );
			return;
		}

		self.getLastTimestampOfCollection( "data_total_real", function( time ){
		   console.info( "Last time: %s", new Date( time ) );
			if( time > 0 )
				return cb(null, time );

			//for NDN
			self.getLastTimestampOfCollection( "data_ndn_real", function( time ){
				if( time > 0 )
					return cb(null, time );
				time = (new Date()).getTime();
				cb( null, time);
			})
		})
	};


	self.getLastTimestampOfCollection = function( collection_name, callback ){
	   const $match = {};
	   $match[ COL.DATA_VOLUME ] = {"$gt": 0};
	   
	   const $sort = {};
	   $sort[ TIMESTAMP ] = -1
		self.mdb.collection( collection_name )
      		.find( $match )
      		.sort( $sort)
      		. limit(1)
      		.toArray(function (err, doc) {
      			if (!err && Array.isArray(doc) && doc.length > 0){
      				return callback( doc[0][ TIMESTAMP ] );
      			}
      			//as this is in offline mode => do not need to (- self.config.probe_stats_period * 1000)
      			//=> get the reports imediately whe they are availables
      			callback( 0 ) ;
      		});
	}

	self.emptyDatabase = function (cb) {
		if( self.appList )
			self.appList.clear();
		if( self.probeStatus )
			self.probeStatus.resetAll();

		for( var i in self.dataCache )
			self.dataCache[i].clear();

		self.mdb.dropDatabase(function (err, doc) {
			console.log("drop database!");
			cb( err );
		});
	};


	self.close = function( cb ){
		self.operatorStatus.set("shutdown");
		self.flushCache( cb );
	}
};

module.exports = MongoConnector;
