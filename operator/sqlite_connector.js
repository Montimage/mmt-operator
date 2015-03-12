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

var columns = "format INTEGER, proto INTEGER, source TEXT, path TEXT, time INTEGER, " +
		"flowcount INTEGER, active_flowcount INTEGER, app TEXT, " +
		"bytecount INTEGER, payloadcount INTEGER, packetcount INTEGER";
var createTrafficStatsTable = "CREATE TABLE IF NOT EXISTS traffic (" + columns + ")"; 
var createTrafficMinStatsTable = "CREATE TABLE IF NOT EXISTS traffic_min ("  + columns + ")";
var createTrafficHourStatsTable = "CREATE TABLE IF NOT EXISTS traffic_hour ("  + columns + ")";
var createUniqueIndexMinStats = "CREATE UNIQUE INDEX IF NOT EXISTS stats_min_index ON traffic_min(format, time, proto, path)";
var createUniqueIndexHourStats = "CREATE UNIQUE INDEX IF NOT EXISTS stats_hour_index ON traffic_hour(format, time, proto, path)";

function prepareDB ( options ) {
  db.run( createTrafficStatsTable );
  db.run( createTrafficMinStatsTable );
  db.run( createTrafficHourStatsTable );
  db.run( createUniqueIndexMinStats );
  db.run( createUniqueIndexHourStats );
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

/**  TODO:
 * - Insert flow stas
 * - Insert Web stats
 * - Insert SSL stats
 * - Insert RTP stats
 **/

function addProtocolStats( msg ) {
	if (msg.format != 99)
		return;
  var stmt = db.prepare("INSERT INTO traffic VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run( msg.format, msg.probe, msg.source, msg.path, msg.time, 
		  msg.flowcount, msg.active_flowcount, msg.app, msg.bytecount, msg.payloadcount, msg.packetcount);
  stmt.finalize();

  updateInsertHistory( msg, "traffic_min", "minute" );
  updateInsertHistory( msg, "traffic_hour", "hour" );
};

/**  TODO:
 * - Retrieve flow stats
 * - Retreive Web stats
 * - Retrieve SSL stats
 * - Retreive RTP stats
 **/
function getProtocolStats( options, callback ){
	var sqlStr = "SELECT * from " + options.collection + " WHERE (format == 99 AND time >= " + options.time + ") ";
  db.all(sqlStr, function( err, doc ) {
    if (err) callback ( 'InternalError' + err + ": " + sqlStr);
    var data = [];
    for(i in doc) {
      var record = dataAdaptor.reverseFormatReportItem( doc[i] );
      data.push(record);
    } 
    callback (null, { metadata: {numberOfEntries: data.length}, data: data } );
  });
}

prepareDB();

module.exports = { addProtocolStats: addProtocolStats, getProtocolStats: getProtocolStats };
