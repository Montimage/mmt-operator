var assert = require("assert");


var manager = require("../libs/manager_db");

/*
manager.backup({
    db: "mmt-data",
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

/*
manager.getFromFtpServer({
  host: "192.168.0.196",
  port: 21,
  user: "mmt",
  password: "montimage"
},"./2G", "/test.gz", function( err ){
  console.log( err || "Done" );
})


*/

/*
manager.restore( "mmt-data-2016-6-16-12-36-57.bak", {
    db: "mmt-data",
    host: "localhost",
    port: 27017,
}, {
    host: "192.168.0.196",
    port: 21,
    user: "mmt",
    password: "montimage"
}, function(err) {
    assert.equal(err, null);
} );

return;
*/

var DB = require("../libs/DataDB");
console.log( (new DB()).db_name );

var backup = require("../libs/backup_db");
/*
backup.backup( function(err, file){
  console.log( JSON.stringify( err ), file);
  return;
} );
*/

backup.restore( 1467033028426, console.error );
