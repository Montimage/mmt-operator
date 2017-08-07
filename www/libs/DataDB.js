var moment         = require('moment');
var dataAdaptor    = require('./dataAdaptor.js');
var Window         = require("./Window.js");
var AppList        = require("./AppList.js");
var ipLib          = require("ip");
var config         = require("./config.js");
//var ip2loc      = require("");

var DataCache   = require("./Cache.js");
var MongoClient = require('mongodb').MongoClient,
format          = require('util').format;

var MongoConnector = function () {
	const self = this;

	self.mdb = null;
	self.db_name = config.databaseName;

	self.onReadyCallback = [];
	self.onReady = function( cb ){
		self.onReadyCallback.push( cb );
	}

	const host = config.database_server.host;
	const port = config.database_server.port;

	const connectString = 'mongodb://' + host + ":" + port + "/" + self.db_name;

	var no_1_packet_reports = 0;

	MongoClient.connect( connectString, function (err, db) {
		if (err){
			console.error("Cannot connect to Database " + connectString );
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


	self.probeStatus = {
			data: {
				//this contains a list of status of probes:
				//id           : probe id
				//start        : starting moment of probe
				//last_update  : last updated of probe
				//report_number: report_number of the firt message (at the starting moment)
			},
			reset: function( probe_id ){
				self.probeStatus.data[ probe_id ] = undefined;
			},
			resetAll: function(){
				self.probeStatus.data = {};
				self.probeStatus.time = {start: 0, last_update: 0};
			},
			//this contains timestamp of all probes
			time:{
				start      : 0,
				last_update: 0
			},
			set: function( msg ){
				var id          = msg[ PROBE_ID ],
				report_number = msg[ REPORT_NUMBER],
				last_update   = msg[ TIMESTAMP ];

				if( self.probeStatus.data[ id ] === undefined ){
					console.log( "First message comming from probe " + id + " at " + (new Date(last_update)).toLocaleString() );
					//there are no report_number in report 200
					if( isNaN( report_number ))
						report_number = 0;
					self.probeStatus.data[id] = {
							_id            : id + "-" + last_update,//_id using by mongoDB
							id             : id, //probe Id
							start          : last_update,
							report_number  : report_number,
							last_update    : 0
					};
				}

				if( self.probeStatus.time.start === 0 )
					self.probeStatus.time.start = last_update;
				if( self.probeStatus.time.last_update < last_update )
					self.probeStatus.time.last_update = last_update;

				var probe = self.probeStatus.data[ id ];
				//no need to update the past
				if( probe.last_update >= last_update ) return;


				probe.last_update = last_update;

				//update to mongoDB
				self.mdb.collection("probe_status").update( {_id: probe._id}, probe, {upsert: true});
			},
			get: function( period, callback ){
				self.mdb.collection("probe_status").find({
					$or : [
						{start: {$lte : period.begin}, last_update: { $gte: period.begin}},
						{start: {$gte : period.begin}, last_update: { $lte: period.end}},
						{start: {$lte : period.end}  , last_update: { $gte: period.end}},
						]
				}).toArray( callback );
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

	//this const is used in the function just after to avoid re-calculation
	const _2TIMES_PROBE_STATS_PERIOD_IN_MS = 2*config.probe_stats_period_in_ms;
	//this function ajusts timestamp of a message based on its sequence number
	var update_packet_timestamp = function( msg ){
		var ts       = msg[ TIMESTAMP ];
		var probe_id = msg[ PROBE_ID ];
		var probe    = self.probeStatus.data[ probe_id ];

		//I received reports from a probe before its starting
		//or starting message is sent after reports
		if( probe === undefined ){
			self.probeStatus.set( msg );
			return;
		}

		if( config.is_probe_analysis_mode_offline )
			return;

		var new_ts = probe.start + (msg[ REPORT_NUMBER ] - probe.report_number) * config.probe_stats_period_in_ms;

		//console.log( new_ts + "-" + ts + "=" + (new_ts - ts) );
		//probe is restarted
		if( ts > new_ts + _2TIMES_PROBE_STATS_PERIOD_IN_MS ){
			console.warn("mmt-probe is frozen " + (new Date(ts)).toLocaleString() );//first message
			//new running period
			self.probeStatus.reset( probe_id );
			self.probeStatus.set( msg );
			return;
		}else if( ts < new_ts - _2TIMES_PROBE_STATS_PERIOD_IN_MS ){
			console.warn("mmt-probe is restarted " + (new Date(ts)).toLocaleString() );//first message
			//new running period
			self.probeStatus.reset( probe_id );
			self.probeStatus.set( msg );
			return;
		}

		msg[ TIMESTAMP ]         = new_ts;
		msg[ COL.ORG_TIMESTAMP ] = ts;

		//update status of probe ==> it is alive
		self.probeStatus.set( msg );
	};

	const DEFAULT_PORT = {
			//proto : port
			153: 80, //HTTP
			341: 443, //SSL
	}

	var get_port = function( msg ){
		var val = DEFAULT_PORT[ msg[ COL.APP_ID ] ];

		if( msg[ COL.PORT_SRC ] === val || msg[ COL.PORT_DEST ] === val )
			return val;
		if( msg[ COL.IP_SRC_INIT_CONNECTION] )
			//remote_port
			return msg[ COL.PORT_DEST ];
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


	function flat_app_path( str ){
		if( str == undefined )
			return [];

		var arr = [ {path: str, app: dataAdaptor.getAppIdFromPath( str )} ];
		do{
			str = dataAdaptor.getParentPath( str );
			if( str === "." )
				//we reach root
				return arr;
			arr.push( {path: str, app: dataAdaptor.getAppIdFromPath( str )} );
		} while( true );
		return arr;
	}
	self.lastPacketTimestamp = 0;

	/**
	 * Stock a report in database
	 * @param {[[Type]]} message [[Description]]
	 */
//	self.dbCache = [];
	self.addProtocolStats = function (message) {
		if (self.mdb === null) return;
		
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
					if( query[ key ] == undefined)
						query[ key ] = obj[ key ];
					else{
						//old_query may contain 2 $match
						//==> merge them
						for( var j in obj[key] )
							query[ key ][ j ] = obj[ key ][ j ];
					}
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

		if(config.probe_analysis_mode == "online"){
			//if online analysis ==> lastime is the current time of operator machine
			var time = (new Date()).getTime();
			time -= config.probe_stats_period * 1000;
			cb( null, time );
			return;
		}


		if (self.lastPacketTimestamp > 0) {
			cb(null, self.lastPacketTimestamp);
			return;
		}

		self.getLastTimestampOfCollection( "data_session_real", function( time ){
			self.lastPacketTimestamp = time;
			if( time > 0 )
				return cb(null, time );

			//for NDN
			self.getLastTimestampOfCollection( "data_ndn_real", function( time ){
				self.lastPacketTimestamp = time;
				if( time > 0 )
					return cb(null, time );
				self.lastPacketTimestamp = (new Date()).getTime();
				cb( null, self.lastPacketTimestamp);
			})
		})
	};


	self.getLastTimestampOfCollection = function( collection_name, callback ){
		self.mdb.collection( collection_name ).find({}).sort({
			"3": -1 //timestamp
		}).limit(1).toArray(function (err, doc) {
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
			self.lastPacketTimestamp = 0;

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
