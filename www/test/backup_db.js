var assert = require("assert");

/*
var backup = require("../libs/backup_db_to_ftp");
backup.sync({
    db: "mmt-data-offline",
    host: "localhost",
    port: 27017,
}, {
    host: "192.168.0.196",
    port: 21,
    user: "mmt",
    password: "montimage"
}, function(err) {
    assert.equal(err, null);
});
*/
var DB = require("../libs/data_db");
console.log( (new DB()).db_name );

var backup = require("../libs/backup_db");
backup.backup( function(err, file){
  console.log( err, file);
} );
