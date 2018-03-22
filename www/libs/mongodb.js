const mongodb = require('mongodb');
const config  = require('./config');

if( mongodb.MongoClient == undefined )
   throw new Error("MongoDB is not correctly implemented");

//override MongoClient.connect
mongodb.MongoClient._connect = mongodb.MongoClient.connect;
mongodb.MongoClient.connect = function( dbName, callback ){
   const connectString = 'mongodb://' + config.database_server.host 
   + ":" + config.database_server.port + "/" + dbName;
   
   this._connect( connectString, {
      
      autoReconnect: true,     // Reconnect on error.
      
      //TODO: to check as these 2 parameters do not work
      reconnectTries:  3000, // Server attempt to reconnect #times
      reconnectInterval: 5000, // Server will wait # milliseconds between retries.
      
      bufferMaxEntries: 0, //Sets a cap on how many operations the driver will buffer up before giving up on getting a working connection
   },
   function( err, client ){
      if( err )
         throw err;
      const db = client.db( dbName );
      db.admin().serverStatus(function(err, info) {
          //console.info("MongoDB version " + info.version );
          const arr = info.version.split(".");
          const version = {
                major : parseInt( arr[0] ),
                minor : parseInt( arr[1] ),
                build : parseInt( arr[2] ),
          }
          if( version.major != 3 || version.minor != 6 ){
             console.error("Current MongoDB version is "+ info.version +". MMT-Operator needs MongoDB version 3.6.x");
             
             process.exit();
          }
      })
      
      callback( null,  db);
   });
};

//override aggregate
mongodb.Collection.prototype._aggregate = mongodb.Collection.prototype.aggregate;
mongodb.Collection.prototype.aggregate = function( query, options, cb ){
   //add some options
   var newOptions = options;
   if( typeof( newOptions ) == "function" ){
      newOptions = {};
      cb = options;
   }
   
   //enable cursor
   newOptions.cursor = {};
   
   var cursor =  this._aggregate( query, newOptions );
   
   if( typeof( cb ) == "function" ){
      if( cursor == undefined )
         cb();
      else
         cursor.toArray( cb );
   }
   
   return cursor;
}

module.exports = mongodb;