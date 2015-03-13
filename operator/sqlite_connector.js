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
var tables = {
//traffic : MMTDrop.CsvFormat.STATS_FORMAT
99 : {
	name : "traffic",
    columns : { 
		format 			: "INTEGER", 
		probe 			: "INTEGER", 
		source 			: "TEXT", 
		time 			: "INTEGER",
		
		app 			: "TEXT",
		path			: "TEXT",
		flowcount 		: "INTEGER", 
		active_flowcount: "INTEGER", 
		bytecount 		: "INTEGER", 
		payloadcount 	: "INTEGER", 
		packetcount 	: "INTEGER"
    }
},
//flow : MMTDrop.CsvFormat.DEFAULT_APP_FORMAT
0 : {
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
},
//http : MMTDrop.CsvFormat.WEB_APP_FORMAT
1 : {
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
},
//ssl : MMTDrop.CsvFormat.SSL_APP_FORMAT 
2 : {
 	name : "flow_ssl",
	columns :{
	  server_name		: "TEXT",
	  cdn				: "INTEGER"
	}
},
//rtp : MMTDrop.CsvFormat.RTP_APP_FORMAT 
3 : {
 	name : "flow_rtp",
	columns : {
	  packet_loss			: "INTEGER",
	  packet_loss_burstiness: "INTEGER",
	  jitter				: "TEXT"
	}
}};

//this function joint columns information in "flowColumns" to "http", "ssl" and "rtp"
function _jointColumns(){
	var flowColumns = tables[0].columns;
	
	for (var i=1; i<=3; i++)
		for (var key in flowColumns)
			tables[i].columns[key] = flowColumns[key];
}

_jointColumns();

//create tables
function prepareDB ( options ) {
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
	
};

/**  TODO:
 * - Update flow stats history
 * - Update Web stats history
 * - Update SSL stats history
 * - Update RTP stats history
 **/
function updateInsertHistory(msg, table, period) {
  var stmt = db.prepare("INSERT OR REPLACE INTO " + table 
    + " VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8" //" , ?9, ?10, ?11 "
    + ", COALESCE( (SELECT bytecount    FROM " + table + " WHERE (format = ?1 AND proto = ?2 AND path = ?4 AND time = ?5) ) + ?9, ?9) "
    + ", COALESCE( (SELECT payloadcount FROM " + table + " WHERE (format = ?1 AND proto = ?2 AND path = ?4 AND time = ?5) ) + ?10, ?10) "
    + ", COALESCE( (SELECT packetcount  FROM " + table + " WHERE (format = ?1 AND proto = ?2 AND path = ?4 AND time = ?5) ) + ?11, ?11) ) ");
  
  stmt.run( msg.format, msg.probe, msg.source, msg.path, moment(msg.time).startOf('minute').valueOf(),
		  msg.flowcount, msg.active_flowcount, msg.app, msg.bytecount, msg.payloadcount, msg.packetcount);
  stmt.finalize();
}

/**  TODO: OK
 * - Insert flow stas
 * - Insert Web stats
 * - Insert SSL stats
 * - Insert RTP stats
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
	
	console.log("\n\n Running sql:  " + sqlstr);
	db.run(sqlstr);
};

/**  TODO:
 * - Retrieve flow stats
 * - Retreive Web stats
 * - Retrieve SSL stats
 * - Retreive RTP stats
 **/
function getProtocolStats(options, callback) {
	// why I cannot use : dataAdaptor.CvsFormat.STATS_FORMAT
	var sqlStr = "SELECT * from " + tables[99].name + " WHERE (time >= "
			+ options.time + ") ";
	db.all(sqlStr, function(err, doc) {
		if (err)
			callback('InternalError' + err + ": " + sqlStr);
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


function getFlowStats( options, callback ){
	var sqlStr = "SELECT * from " + tables[options.format].name + " WHERE (time >= " + options.time + ")";
	console.log("\nExecuting SQL : " + sqlStr);
	db.all(sqlStr, function( err, doc ) {
		if (err) callback ( 'InternalError' + err + ": " + sqlStr);
		var data = [];
		for(i in doc) {
			if (options.raw)
				data.push (doc[i]);
			else
				data.push(dataAdaptor.reverseFormatReportItem( doc[i] ));
		} 
		callback (null, data);
	});
}

prepareDB();

module.exports = { addProtocolStats: addProtocolStats, getProtocolStats: getProtocolStats, getFlowStats: getFlowStats };
