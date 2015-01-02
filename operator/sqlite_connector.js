var sqlite3 = require('sqlite3').verbose();
var moment = require('moment');
var db = new sqlite3.Database('./mmt.db');

var createTrafficStatsTable = "CREATE TABLE IF NOT EXISTS traffic (format INTEGER, ts INTEGER, proto INTEGER, path TEXT, scount INTEGER, ascount INTEGER, data INTEGER, payload INTEGER, packets INTEGER)";
var createTrafficMinStatsTable = "CREATE TABLE IF NOT EXISTS traffic_min (format INTEGER, ts INTEGER, proto INTEGER, path TEXT, scount INTEGER, ascount INTEGER, data INTEGER, payload INTEGER, packets INTEGER)";
var createTrafficHourStatsTable = "CREATE TABLE IF NOT EXISTS traffic_hour (format INTEGER, ts INTEGER, proto INTEGER, path TEXT, scount INTEGER, ascount INTEGER, data INTEGER, payload INTEGER, packets INTEGER)";
var createUniqueIndexMinStats = "CREATE UNIQUE INDEX IF NOT EXISTS stats_min_index ON traffic_min(format, ts, proto, path)";
var createUniqueIndexHourStats = "CREATE UNIQUE INDEX IF NOT EXISTS stats_hour_index ON traffic_hour(format, ts, proto, path)";

function prepareDB ( options ) {
  db.run( createTrafficStatsTable );
  db.run( createTrafficMinStatsTable );
  db.run( createTrafficHourStatsTable );
  db.run( createUniqueIndexMinStats );
  db.run( createUniqueIndexHourStats );
};

function updateInsertHistory(msg, table, period) {
  var stmt = db.prepare("INSERT OR REPLACE INTO " + table + " (format, ts, proto, path, scount, ascount, data, payload, packets) "
    + " VALUES (?1, ?2, ?3, ?4, ?5, ?6 "
    + ", COALESCE( (SELECT data FROM " + table + " WHERE (format = ?1 AND ts = ?2 AND proto = ?3 AND path = ?4) ) + ?7, ?7) "
    + ", COALESCE( (SELECT payload FROM " + table + " WHERE (format = ?1 AND ts = ?2 AND proto = ?3 AND path = ?4) ) + ?8, ?8) "
    + ", COALESCE( (SELECT packets FROM " + table + " WHERE (format = ?1 AND ts = ?2 AND proto = ?3 AND path = ?4) ) + ?9, ?9) ) ");
  stmt.run(msg.event.format, moment(msg.event.ts).startOf(period).valueOf(), msg.event.proto, msg.event.path, msg.event.scount, msg.event.ascount, msg.event.data, msg.event.payload, msg.event.packets);
  stmt.finalize();
}

function addProtocolStats( msg ) {
  var stmt = db.prepare("INSERT INTO traffic VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run( msg.event.format, msg.event.ts, msg.event.proto, msg.event.path, msg.event.scount, msg.event.ascount, msg.event.data, msg.event.payload, msg.event.packets);
  stmt.finalize();

  updateInsertHistory( msg, "traffic_min", "minute" );
  updateInsertHistory( msg, "traffic_hour", "hour" );
};

function getProtocolStats( options, callback ){
  db.all("SELECT * from " + options.collection + " WHERE (format == 99 AND ts >= " + options.ts + ") ", function( err, doc ) {
    if (err) callback ( 'InternalError' );
    var data = [];
    for(i in doc) {
      var record = [doc[i].format, doc[i].ts, doc[i].proto, doc[i].path, doc[i].scount, doc[i].ascount, doc[i].data, doc[i].payload, doc[i].packets];
      data.push(record);
    } 
    callback (null, { metadata: {numberOfEntries: data.length}, data: data } );
  });
}

prepareDB();

module.exports = { addProtocolStats: addProtocolStats, getProtocolStats: getProtocolStats };
