/**
 * Insert Messages to Database 
 */

"use strict";

const BULK_INSERT_THRESHOLD = 20000;


//mongodb option when deleting records
//http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#insertMany
const WRITE_CONCERN = {
	w: 0, //Requests no acknowledgement of the write operation
	
	//requests no acknowledgement from MongoDB that the write operation has been written to the journal.
	//j: true, //false: to ignore

	//Do not serialize functions that are defined on any object
	serializeFunctions : false,
	//Force server to assign _id values instead of driver.
	forceServerObjectId: true,
	//Allow driver to bypass schema validation in MongoDB 3.2 or higher.
	bypassDocumentValidation: true,
	//If true, when an insert fails, don't execute the remaining writes. 
	//If false, continue with remaining inserts when one fails.
	ordered: false
};


const config    = require("../libs/config"),
dataAdaptor     = require('../libs/dataAdaptor'),
tools           = require("../libs/tools"),
MongoClient     = require('../libs/mongodb').MongoClient;


module.exports = function( databaseName ){
   if( databaseName == undefined )
      databaseName = config.databaseName;
   
	const self = this;
	self.onReady = function( cb ){
		self._onReady = cb;
	};
	/**
	 * The cache to store messages before being able to connect to DB
	 */
	self.cache = [];

	//connect to DB
	MongoClient.connect( databaseName, function (err, db) {
		if (err){
			console.error("Cannot connect to Database " + databaseName );
			console.logStdout("Cannot connect to Database");
			process.abort();
		}

		//connect OK
		self.db = db;

		if( typeof(self._onReady) === "function" )
			self._onReady( db );
	});
	
	/**
	 * Insert array of messages to DB
	 */
	self.add = function( collection, msgArray, callback ){
		/*
		//insert directly messages to db
		//if connection is ready and msgArray.length > a threshold
		if( self.db != undefined && msgArray.length >= BULK_INSERT_THRESHOLD )
			return self._insert( collection, msgArray, callback );
		*/	
		
		//we are wating for connection to DB
		//=> put msg to cache
		if( self.db == undefined ){
			self.cache.push({
				collection: collection,
				msgArray  : msgArray,
				callback  : callback
			});
			return;
		}
		
		//insert cache if any
		if( self.cache.length > 0 ){
			self.cache.forEach( function( el ){
				self._insert( el.collection, el.msgArray, el.callback );
			});
			//clear the cache
			self.cache.length = 0;
		}
			
		//insert directly messages to db
		self._insert( collection, msgArray, callback );
	};
	
	/**
	 * Insert directly to DB
	 */
	self._insert = function( collectionName, msgArray, callback ){
	   //_TODO: remove the 3 following lines
	   /*
	   if( callback ) 
	      callback(null, {});
	   return;
	   //*/
	   
		self.db.collection( collectionName ).insertMany( msgArray, 
				//insertion options
				WRITE_CONCERN,
				callback );
	};
	
	

   self.set = function( collection, id, data, callback ){
      //we are wating for connection to DB
      //=> put msg to cache
      if( self.db == undefined ){
         if( self._setCache == undefined )
            self._setCache = {};
         
         self._setCache[collection + "-" + id ] = {
               collection: collection,
               id        : id,
               data      : data,
               callback  : callback
         };
         
         return;
      }
      
      if( self._setCache != null ){
         for( var i in self._setCache ){
            const m = self._setCache[i];
            self._set( m.collection, m.id, m.data, m.callback );
			}
			//clear the cache
			self._setCache = {};
		}
      self._set( collection, id, data, callback );
   };
   
   self._set = function( collection, id, data, callback ){
      data._id = id;
      self.db.collection( collection ).updateOne(
            {_id   : id},          //filter
            {$set  : data},        //data
            {upsert: true },       //insert if does not exist
            callback );
   };
   
   
   /**
    * Update data having a given id of a collection
    */
   self.update = function( collection, id, update, options, callback ){
      
      if( self.db === undefined ){
         if( callback )
            callback( new Error("Database is undefined") );
         else
            console.error( "Database is undefined");
         return;
      }
      
      self.db.collection( collection ).updateOne( {_id: id}, update, options, callback );
   };
};