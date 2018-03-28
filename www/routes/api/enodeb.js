const config  = require("../../libs/config.js");
const tools   = require("../../libs/tools");
const mysql   = require('mysql');

const mysqlConfig = tools.getValue( config, ["modules_config", "enodeb", "mysql_server"]);
if( mysqlConfig == null ){
   console.error("Cannot find configuration of mysql server for eNodeB modules");
   process.exit();
}

const mysqlConnection = mysql.createConnection( mysqlConfig );


const mysqlApi = {
   query: function( sqlString, cb ){
      console.log("mysql query: " + sqlString );
      return mysqlConnection.query( sqlString, function( err, data, fields ){
         cb = cb || function(){};
         if( err ){
            console.error( err );
            return cb( "Cannot connect to mysql server" );
         }
         cb( null, data );
      });
   }
}

module.exports = mysqlApi; 