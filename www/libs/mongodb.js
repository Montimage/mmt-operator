const mongodb = require('mongodb');
const config  = require('./config');

if( mongodb.MongoClient == undefined )
   throw new Error("MongoDB is not correctly implemented");

//override MongoClient.connect
mongodb.MongoClient._connect = mongodb.MongoClient.connect;

mongodb.MongoClient.connect = function(dbName, callback) {
	const connectString = 'mongodb://' + config.database_server.host
		+ ":" + config.database_server.port + "/" + dbName;

	const client = new mongodb.MongoClient(connectString, {
		//useNewUrlParser: true, // Determines whether or not to use the new url parser
		//autoReconnect:     true,  // Reconnect on error.
		//reconnectTries:    3000,  // Server attempt to reconnect #times
		//reconnectInterval: 5000,  // Server will wait # milliseconds between retries.

		//bufferMaxEntries: 0, //Sets a cap on how many operations the driver will buffer up before giving up on getting a working connection
	});

	client._connect()
		.then( function(client) {
			const db = client.db(dbName);
			db.admin().serverStatus(function(err, info) {
				//console.info("MongoDB version " + info.version );
				const arr = info.version.split(".");
				const version = {
					major: parseInt(arr[0]),
					minor: parseInt(arr[1]),
					build: parseInt(arr[2]),
				};
				const versionNo = version.major * 100 + version.minor * 10 + version.build;

				if (versionNo < (3 * 100 + 6 * 10)) {
					console.error("Current MongoDB version is " + info.version + ". MMT-Operator needs MongoDB version 3.6.x");

					process.abort();
				}
			});
			//
			patchDeprecatedMethods(db);
			callback(null, db);
		})
		.catch( function(err) {
			console.error("Error when connecting to MongoDB. Retry in 10 seconds." + err.message);
			setTimeout(mongodb.MongoClient.connect, 10 * 1000, dbName, callback);
		})
};

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
				callback?.(null, result);
				return result;
			} catch (err) {
				callback?.(err);
				//throw err;
			}
		};
	}

	// Legacy update()
	if (!collection.update) {
		collection.update = async function(filter, update, options, callback) {
			try {
				const result = (options?.multi || false)
					? await this.updateMany(filter, update, options)
					: await this.updateOne(filter, update, options);
				callback?.(null, result);
				return result;
			} catch (err) {
				callback?.(err);
				//throw err;
			}
		};
	}

	// Legacy remove()
	if (!collection.remove) {
		collection.remove = async function(filter, options, callback) {
			try {
				const result = (options?.justOne || false)
					? await this.deleteOne(filter, options)
					: await this.deleteMany(filter, options);
				callback?.(null, result);
				return result;
			} catch (err) {
				callback?.(err);
				//throw err;
			}
		};
	}

	// Optional: legacy count (use countDocuments)
	if (!collection.count) {
		collection.count = async function(query, options, callback) {
			try {
				const result = await this.countDocuments(query, options);
				callback?.(null, result);
				return result;
			} catch (err) {
				callback?.(err);
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

  cursor[meth] = function (maybeCallback) {
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
		
		patchLegacyCollectionMethods( collection );
		patchLegacyAggregate( collection );
		patchLegacyFindMethod( collection );
		
		return collection;
	}
}

module.exports = mongodb;