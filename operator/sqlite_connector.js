var sqlite3 = require('sqlite3').verbose();
var moment = require('moment');
var db = new sqlite3.Database('./mmt.sqlite');
var dataAdaptor = require("./dataAdaptor.js");

/**  TODO:
 * - Table for flow stats
 * - Table for Web stats
 * - Table for SSL stats
 * - Table for RTP stats
 **/


//List of columns and their data type in database for each table
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
	  transactions_count: "INTEGER",
	  interaction_time	: "INTEGER",
	  hostname			: "TEXT",
	  mime				: "TEXT",
	  referer			: "TEXT",
	  device_os_id		: "TEXT",
	  cdn				: "INTEGER"
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
	  packet_loss			: "INTEGER",
	  packet_loss_burstiness: "INTEGER",
	  jitter				: "TEXT"
	}
};

//this function joint columns information in "flowColumns" to "http", "ssl" and "rtp"
function _jointColumns(){
	var flowColumns = tables[dataAdaptor.CsvFormat.DEFAULT_APP_FORMAT].columns;
	
	for (var i in [ dataAdaptor.CsvFormat.WEB_APP_FORMAT,
					dataAdaptor.CsvFormat.SSL_APP_FORMAT,
					dataAdaptor.CsvFormat.RTP_APP_FORMAT])
		for (var key in flowColumns)
			tables[i].columns[key] = flowColumns[key];
}

_jointColumns();


//create tables
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

function addProtocolStats( msg ) {
	var tbl   = tables[msg.format]
	//table for this format has not been defined yet
	if (tbl == undefined){
		console.log("Doesnot exist table for msg.format = " + msg.format);
		return;
	}
	
	var cols = [], vals = [];
	for (var key in msg){
		cols.push(key);
		
		if (tbl.columns[key] == "INTEGER")
			vals.push(msg[key]);
		else
			vals.push("'" + msg[key] + "'");
	}
	
	//SQL string
	var sqlstr = "INSERT INTO " + tbl.name + " (" + cols.join() + ") VALUES (" + vals.join() + ")";
	
	//console.log("\n\n Running sql:  " + sqlstr);
	db.run(sqlstr);
};

function _createSQL(options){
	var tblName = tables[options.format].name;
	if (tblName == undefined){
		throw new Error("Table for 'options.format = " + options.format + "' does not exist");
	}
	
	var sqlStr = "SELECT * from " + tblName + " WHERE (time >= " + options.time + ")";
	
	var time = "time";
	if (options.collection == "traffic_min"){
		time = "(strftime('%s', strftime('%Y-%m-%d %H:%M:00', datetime(time/1000, 'unixepoch'))) * 1000)";
	}else if (options.collection == "traffic_hour"){
		time = "(strftime('%s', strftime('%Y-%m-%d %H:00:00', datetime(time/1000, 'unixepoch'))) * 1000)";
	}else	//traffic
		return sqlStr;
	
	switch (options.format){
	case dataAdaptor.CsvFormat.STATS_FORMAT:
		sqlStr = "SELECT format, probe, source, path, " + 
					  time + "              AS time," +
					" MAX(flowcount)        AS flowcount," +
					" MAX(active_flowcount) AS active_flowcount," +
					" app," +
					" SUM(bytecount)        AS bytecount," +
					" SUM(payloadcount)     AS pyaloadcount," +
					" SUM(packetcount)      AS packetcount" +
					" FROM " + tblName +
					" WHERE time >= " + options.time +
					" GROUP BY format, probe, source, path," + time;
		break;
	case dataAdaptor.CsvFormat.WEB_APP_FORMAT:		//http
		sqlStr = "SELECT format, probe, source, " +
					time + 				"    AS time, " +
					" SUM(response_time)     AS response_time," +
					" SUM(transactions_count) AS transactions_count," +
					" SUM(interaction_time)  AS interaction_time" +
					" FROM " + tblName +
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
					" GROUP BY format, probe, source," + time;
		break;
	}	
	
	return sqlStr;
}

/** 
 * Get statistic of traffic (data from traffic table)
 **/
function getProtocolStats(options, callback) {
	var sqlStr = _createSQL(options);
	//console.log("\n Executing SQL: " + sqlStr);
	db.all(sqlStr, function(err, doc) {
		if (err){
			callback('InternalError: ' + err );
			return;
		}
		var data = [];
		for (i in doc) {
			var record = dataAdaptor.reverseFormatReportItem(doc[i]);
			data.push(record);
		}
		callback(null, {
			metadata : {
				numberOfEntries : data.length
			},
			data : data
		});
	});
}


/**
 * get statistic of flow (data from flow_http, flow_ssl or flow_rtp)
 * @param options
 * @param callback will be called when data are available
 */
function getFlowStats( options, callback ){

	var sqlStr = _createSQL(options);
	//console.log("\nExecuting SQL : " + sqlStr);
	db.all(sqlStr, function( err, doc ) {
		if (err) {
			callback ( 'InternalError' + err );
			return;
		}
		var data = [];
		for(i in doc) {
			if (options.raw)
				data.push (doc[i]);
			else
				data.push(dataAdaptor.reverseFormatReportItem( doc[i] ));
		}
		//console.log(data.length);
		callback (null, data);
	});
}

module.exports = { addProtocolStats: addProtocolStats, getProtocolStats: getProtocolStats, getFlowStats: getFlowStats };
