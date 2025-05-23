const mongodb = require('mongodb');
const config = require('./config');
const tools  = require("./tools");

if (mongodb.MongoClient == undefined)
	throw new Error("MongoDB is not correctly implemented");

function setDefaultValue(variable, prop, value) {
	if (variable[prop] === undefined)
		variable[prop] = value;
}

function connect(dbName, callback) {

	const connectOptions = config.database_server.connect_options || {};
	// an operation will run until it throws a timeout error
	setDefaultValue( connectOptions, "timeoutMS", 10*1000 );
	//wait to establish a single TCP socket connection to the server before raising an error. 
	setDefaultValue( connectOptions, "connectTimeoutMS", 1000 );
	/** The time in milliseconds to attempt a send or receive on a socket before the attempt times out. */
	setDefaultValue( connectOptions, "socketTimeoutMS", 1000 );
	/** The name of the application that created this MongoClient instance. MongoDB 3.4 and newer will print this value in the server log upon establishing each connection. It is also recorded in the slow query log and profile collections */
	setDefaultValue( connectOptions, "appName", "MMT-Operator-" + tools.getTimestamp() );
	
	//convert to query string
	const connectOptionsArr = [];
	for( key in connectOptions ){
		value = connectOptions[key];
		key = encodeURIComponent(key);
		value = encodeURIComponent( value );
		connectOptionsArr.push(`${key}=${value}`);
	}

	const connectString = 'mongodb://' + config.database_server.host
		+ ":" + config.database_server.port + "/" + dbName + '?' + connectOptionsArr.join("&");

	console.log("Connecting to %s", connectString );
	const client = new mongodb.MongoClient(connectString, {});

	client.connect()
		.then(function(client) {
			console.info("Connected to MongoDB", connectString );

			//attached to the selected database
			const db = client.db(dbName);
			
			//get info about the MongoDB
			db.admin().serverStatus()
			.then(function(info) {
				console.info("Connected to MongoDB version " + info.version );
				const arr = info.version.split(".");
				const version = {
					major: parseInt(arr[0]),
					minor: parseInt(arr[1]),
					build: parseInt(arr[2]),
				};
				const versionNo = version.major * 100 + version.minor * 10 + version.build;

				if (versionNo < (6 * 100 + 0 * 10)) {
					console.error("Current MongoDB version is " + info.version + ". MMT-Operator needs MongoDB version >= 6.x");

					process.abort();
				}
			})
			.catch(function(err){
				console.error("Cannot get MongoDB info", err)
				process.abort();
			});
			//
			patchDeprecatedMethods(db);
			callback(null, db);
		})
		.catch(function(err) {
			//console.error("Error when connecting to MongoDB. Retry in 10 seconds." + err.message);
			//setTimeout(mongodb.MongoClient.connect, 10 * 1000, dbName, callback);

			console.error("Error when connecting to MongoDB.", err.message);
			callback(err, null);
		})
};

function triggerCallback(callback, err, res) {
	if (typeof (callback) == "function"){
		callback(err, res);
		return true
	}
	return false;
}

function patchLegacyCollectionMethods(collection) {
	if (!collection) return;

	// Legacy insert()
	if (!collection.insert) {
		collection.insert = async function(docs, options, callback) {
			try {
				const isArray = Array.isArray(docs);
				const result = isArray
					? await this.insertMany(docs, options)
					: await this.insertOne(docs, options);

				triggerCallback(callback, null, result);
				return result;
			} catch (err) {
				triggerCallback(callback, err);
			}
		};
	}

	// Legacy update()
	if (!collection.update) {
		collection.update = async function(filter, update, options, callback) {
			try {
				otions = options || {};
				
				const result = (options.multi || false)
					? await this.updateMany(filter, update, options)
					: await this.updateOne(filter, update, options);
				triggerCallback(callback, null, result);
				return result;
			} catch (err) {
				triggerCallback(callback, err);
			}
		};
	}

	// Legacy remove()
	if (!collection.remove) {
		collection.remove = async function(filter, options, callback) {
			try {
				otions = options || {};
				
				const result = (options.justOne || false)
					? await this.deleteOne(filter, options)
					: await this.deleteMany(filter, options);
				triggerCallback(callback, null, result);
				return result;
			} catch (err) {
				triggerCallback(callback, err);
			}
		};
	}

	// Optional: legacy count (use countDocuments)
	if (!collection.count) {
		collection.count = async function(query, options, callback) {
			try {
				const result = await this.countDocuments(query, options);
				triggerCallback(callback, null, result);
				return result;
			} catch (err) {
				triggerCallback(callback, err);
				//throw err;
			}
		};
	}
}

function patchCursor(cursor, meth) {
	if (!cursor || typeof cursor[meth] !== 'function') {
		throw new Error('Invalid MongoDB cursor: no function ' + meth);
	}

	const originalMethod = cursor[meth].bind(cursor);

	cursor[meth] = function(maybeCallback) {
		const promise = originalMethod();

		if (typeof maybeCallback === 'function') {
			promise
				.then((docs) => maybeCallback(null, docs))
				.catch((err) => maybeCallback(err));
			return; // mimic legacy behavior
		}

		return promise; // standard promise return
	};

	return cursor;
}


function patchLegacyAggregate(collection) {
	if (!collection || typeof collection.aggregate !== 'function') {
		throw new Error('Invalid collection object');
	}

	const originalAggregate = collection.aggregate.bind(collection);

	collection.aggregate = function(pipeline, optionsOrCallback, maybeCallback) {
		const hasCallback = typeof optionsOrCallback === 'function' || typeof maybeCallback === 'function';

		const options = hasCallback
			? typeof optionsOrCallback === 'object'
				? optionsOrCallback
				: undefined
			: optionsOrCallback;

		const callback = hasCallback
			? typeof maybeCallback === 'function'
				? maybeCallback
				: optionsOrCallback
			: undefined;

		const cursor = originalAggregate(pipeline, options);

		if (callback) {
			cursor.toArray().then(res => callback(null, res)).catch(err => callback(err));
			return; // undefined like legacy callback APIs
		}

		patchCursor(cursor, "toArray");
		return cursor; // modern promise-based behavior
	};
}

function patchLegacyFindMethod(collection) {
	if (!collection || typeof collection.find !== 'function') {
		throw new Error('Invalid MongoDB collection');
	}

	const originalFind = collection.find.bind(collection);

	collection.find = function(query = {}, optionsOrCallback, maybeCallback) {
		let options = {};
		let callback;

		if (typeof optionsOrCallback === 'function') {
			callback = optionsOrCallback;
		} else {
			options = optionsOrCallback || {};
			callback = maybeCallback;
		}

		const cursor = originalFind(query, options);

		if (typeof callback === 'function') {
			cursor.toArray().then(res => callback(null, res)).catch(err => callback(err));
			return; // mimic old behavior
		}
		patchCursor(cursor, "toArray");
		return cursor; // allow chaining: .sort(), .limit(), etc.
	};
}


function patchDeprecatedMethods(db) {
	//remember old collection function
	db._collection = db.collection;

	db.collection = function(collectionName) {
		let collection = db._collection(collectionName);

		patchLegacyCollectionMethods(collection);
		patchLegacyAggregate(collection);
		patchLegacyFindMethod(collection);

		return collection;
	}
}

module.exports = {
	MongoClient : {
		connect: connect
	}
};