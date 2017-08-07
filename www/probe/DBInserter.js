/**
 * Insert Messages to Database 
 */

"use strict";

const BULK_INSERT_THRESHOLD = 20000;

const config    = require("../libs/config"),
dataAdaptor = require('../libs/dataAdaptor'),
tools       = require("../libs/tools"),
MongoClient = require('mongodb').MongoClient;


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
		
		//insert directly messages to db
		self._insert( collection, msgArray, callback );
		
		//insert cache if any
		if( self.cache.length > 0 )
			self.cache.length.forEach( function( el ){
				self._insert( el.collection, el.msgArray, el.callback );
			})
	};
	
	/**
	 * Insert directly to DB
	 */
	self._insert = function( collectionName, msgArray, callback ){
		self.db.collection( collectionName ).insertMany( msgArray, callback );
		//if( callback ) callback();
	}
};