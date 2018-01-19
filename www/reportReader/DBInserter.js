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
MongoClient     = require('mongodb').MongoClient;


module.exports = function( databaseName ){
	const self = this;
	
	//connection string to connect to database
	const connectString = 'mongodb://' + config.database_server.host 
								+ ":" + config.database_server.port 
								+ "/" + databaseName;
	
	/**
	 * The cache to store messages before being able to connect to DB
	 */
	self.cache = [];

	//connect to DB
	MongoClient.connect( connectString, function (err, db) {
		if (err){
			console.error("Cannot connect to Database " + connectString );
			console.logStdout("Cannot connect to Database");
			process.exit( 1 );
		}

		//connect OK
		self.db       = db;
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
			})
			return;
		}
		
		//insert cache if any
		if( self.cache.length > 0 )
			self.cache.length.forEach( function( el ){
				self._insert( el.collection, el.msgArray, el.callback );
			})
			
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
	}
};