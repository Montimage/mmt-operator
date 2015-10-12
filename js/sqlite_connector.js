var sqlite3 = require('sqlite3').verbose();
var moment = require('moment');
var dataAdaptor = require("./dataAdaptor.js");

var sqlite = function( dbname ){
	if( dbname == null )
		dbname = "default";
	
	
	var self = this;
	var db   = new sqlite3.Database('./mmt-data-'+ dbname +'.sqlite');
	
	//	List of columns and their data type in database for each table
	var tables = {};
	tables[dataAdaptor.CsvFormat.STATS_FORMAT] = {
			name : "traffic",
			columns : { 
				format 			: "INTEGER", 
				probe 			: "INTEGER", 
				source 			: "TEXT", 
				time 			: "INTEGER",

				app 			: "INTEGER",
				path			: "TEXT",
				flowcount 		: "INTEGER", 
				active_flowcount: "INTEGER", 
				bytecount 		: "INTEGER", 
				payloadcount 	: "INTEGER", 
				packetcount 	: "INTEGER"
			}
	};
	tables[dataAdaptor.CsvFormat.DEFAULT_APP_FORMAT] = {
			name : "flow",
			columns : {
				format			: "INTEGER",
				probe			: "INTEGER",
				source			: "TEXT",
				time			: "INTEGER",

				fid				: "INTEGER",
				start_time		: "INTEGER",
				ip_version		: "INTEGER",
				server_addr		: "TEXT",
				client_addr		: "TEXT",
				server_port		: "INTEGER",
				client_port		: "INTEGER",
				transport_proto : "INTEGER",
				ul_data			: "INTEGER",
				dl_data			: "INTEGER",
				ul_packets		: "INTEGER",
				dl_packets		: "INTEGER",
				tcp_rtt			: "INTEGER",
				retransmission	: "INTEGER",
				family			: "INTEGER",
				content_class	: "INTEGER",
				path			: "TEXT",
				app				: "INTEGER"
			}
	};
	tables[dataAdaptor.CsvFormat.WEB_APP_FORMAT] = {
			name : "flow_http",
			columns : {
				response_time		: "INTEGER",
				transactions_count  : "INTEGER",
				interaction_time	: "INTEGER",
				hostname			: "TEXT",
				mime				: "TEXT",
				referer			    : "TEXT",
				device_os_id		: "TEXT",
				cdn				    : "INTEGER"
			}
	};
	tables[dataAdaptor.CsvFormat.SSL_APP_FORMAT] = {
			name : "flow_ssl",
			columns :{
				server_name		: "TEXT",
				cdn				: "INTEGER"
			}
	};
	tables[dataAdaptor.CsvFormat.RTP_APP_FORMAT] = {
			name : "flow_rtp",
			columns : {
				packet_loss			  : "INTEGER",
				packet_loss_burstiness: "INTEGER",
				jitter				  : "TEXT"
			}
	};

//	this function joint columns information in "flowColumns" to "http", "ssl" and "rtp"
	function _jointColumns(){
		var flowColumns = tables[dataAdaptor.CsvFormat.DEFAULT_APP_FORMAT].columns;
		var cols = [ dataAdaptor.CsvFormat.WEB_APP_FORMAT,
		                dataAdaptor.CsvFormat.SSL_APP_FORMAT,
		                dataAdaptor.CsvFormat.RTP_APP_FORMAT];
		
		for (var i in cols)
			for (var key in flowColumns)
				tables[i].columns[key] = flowColumns[key];
	}

	_jointColumns();


//	create tables
	function _prepareDB () {
		//run commands in sequence
		db.serialize(function(){
			for (var i in tables){
				var name = tables[i].name;
				var columns = tables[i].columns;

				//get array of column name - data type
				var arr = [];
				for (var key in columns)
					arr.push( key + " " + columns[key] );

				//create SQL string
				sqlstr = "CREATE TABLE IF NOT EXISTS " + name + " (" + arr.join() + ")";
				db.run(sqlstr);
			}
		});
	};

	_prepareDB();


	/**
	 * Insert captured message into DB
	 * Depending on msg.format, the message can be inserted into corresponding table, eg, traffic, flow_http, ...
	 **/

	this.addProtocolStats = function( msg ) {
		var tbl   = tables[msg.format];
		//table for this format has not been defined yet
		if (tbl == undefined){
			console.log("Doesnot exist table for msg.format = " + msg.format);
			return;
		}

		var cols = [], vals = [];
		for (var key in msg){

			if( tbl.columns[key] == undefined)
				break;

			cols.push(key);

			if (tbl.columns[key] == "INTEGER")
				vals.push(msg[key]);
			else if (tbl.columns[key] == "TEXT")
				vals.push("'" + msg[key] + "'");
		}

		//SQL string
		var sqlstr = "INSERT INTO " + tbl.name + " (" + cols.join() + ") VALUES (" + vals.join() + ")";

		//console.log("\n\n Running sql:  " + sqlstr);
		db.run(sqlstr);

		if(  [ dataAdaptor.CsvFormat.WEB_APP_FORMAT,
		       dataAdaptor.CsvFormat.SSL_APP_FORMAT,
		       dataAdaptor.CsvFormat.RTP_APP_FORMAT].indexOf(msg.format) !== -1){
			msg.format = dataAdaptor.CsvFormat.DEFAULT_APP_FORMAT;
			self.addProtocolStats( msg );
		}
	};

	/**
	 * Create a SQL string based on options
	 */
	function _createSQL(options){
		var tblName = tables[options.format].name;
		if (tblName == undefined){
			throw new Error("Table for 'options.format = " + options.format + "' does not exist");
		}

		var where_clause = "time >= " + options.time;

		if ((options.probe instanceof Array) && options.probe.length > 0){
			where_clause += " AND probe IN (" + options.probe.join() + ")";
		}

		if ((options.source instanceof Array) && options.source.length > 0){
			where_clause += " AND source IN ("+ options.source.join(",") +")";
		}

		var sqlStr = "SELECT * from " + tblName + " WHERE " + where_clause ;

		var time = "time";
		if (options.collection == "traffic_min"){
			time = "(strftime('%s', strftime('%Y-%m-%d %H:%M:00', datetime(time/1000, 'unixepoch'))) * 1000)";
		}else if (options.collection == "traffic_hour"){
			time = "(strftime('%s', strftime('%Y-%m-%d %H:00:00', datetime(time/1000, 'unixepoch'))) * 1000)";
		}else if (options.collection == "traffic_day"){
			time = "(strftime('%s', strftime('%Y-%m-%d 00:00:00', datetime(time/1000, 'unixepoch'))) * 1000)";
		}
		else{	//traffic
			console.log("\n" + sqlStr + "\n");
			return sqlStr;
		}


		switch (options.format){
		case dataAdaptor.CsvFormat.STATS_FORMAT:
			sqlStr = "SELECT format, probe, source, path, " + 
			time + "              AS time," +
			" MAX(flowcount)        AS flowcount," +
			" MAX(active_flowcount) AS active_flowcount," +
			" app," +
			" SUM(bytecount)        AS bytecount," +
			" SUM(payloadcount)     AS payloadcount," +
			" SUM(packetcount)      AS packetcount" +
			" FROM " + tblName +
			" WHERE " + where_clause +
			" GROUP BY format, probe, source, path," + time;
			break;
		case dataAdaptor.CsvFormat.WEB_APP_FORMAT:		//http
			sqlStr = "SELECT format, probe, source, " +
			time + 				"    AS time, " +
			" SUM(response_time)     AS response_time," +
			" SUM(transactions_count)AS transactions_count," +
			" SUM(interaction_time)  AS interaction_time" +
			" FROM " + tblName +
			" WHERE " + where_clause +
			" GROUP BY format, probe, source," + time;
			break;
		case dataAdaptor.CsvFormat.SSL_APP_FORMAT:		//ssl
			break;
		case dataAdaptor.CsvFormat.RTP_APP_FORMAT:		//rtp
			sqlStr = "SELECT format, probe, source, " +
			time + 				"         AS time, " +
			" SUM(packet_loss)            AS packet_loss," +
			" SUM(packet_loss_burstiness) AS packet_loss_burstiness," +
			" SUM(jitter)  				  AS jitter" +
			" FROM " + tblName +
			" WHERE " + where_clause +
			" GROUP BY format, probe, source," + time;
			break;
		}	

		console.log("\n" + sqlStr + "\n");
		return sqlStr;
	}

	/**
	 * get statistic data from database 
	 * @param options is an object {format: , time:, collection:, source: , probe: } 
	 * @param callback will be called when data are available
	 */
	this.getProtocolStats = function( options, callback ){

		var sqlStr = _createSQL(options);
		//console.log("\nExecuting SQL : " + sqlStr);
		db.all(sqlStr, function( err, doc ) {
			if (err) {
				callback ( 'InternalError: ' + err );
				return;
			}
			console.log (doc.length + " records");
			if (options.raw){
				var data = [];
				for (var i in doc){
					data.push( dataAdaptor.reverseFormatReportItem( doc[i] ) );
				}
				//console.log(data.length);
				callback (null, data);
			}else
				callback (null, doc);

		});
	};
	
	/**
	 * get the lastime db was updated
	 * When success, cb will be called with a parameter is the time
	 * When fail, err_cb will be called
	 */
	this.getLastTime = function(cb){
		var sqlStr = "SELECT max(time) AS time FROM " + tables[dataAdaptor.CsvFormat.STATS_FORMAT].name;
		db.all(sqlStr, function( err, doc ) {
			if (err) {
				cb ( err );
				return;
			}

			for (var i in doc){
				cb (null, doc[i].time);
				return;
			}
			cb( null, (new Date()).getTime());
		});
	};
	/**
	 * clear database
	 */
	this.cleanDB = function(){
		//delete tables
		db.serialize(function(){
			for (var i in tables){
				var name = tables[i].name;

				console.log(" - delete table: " + name);
				//Delete all data from table
				sqlstr = "DELETE FROM " + name;
				db.run(sqlstr);
			}
		});
	};
};

module.exports = sqlite;
