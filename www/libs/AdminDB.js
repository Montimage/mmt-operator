var MongoClient = require('mongodb').MongoClient;
var config      = require('./config');

function AdminDB() {
    var self     = this;
    self._cache  = {};
    self.db_name = "mmt-admin";

    var host = config.database_server.host;
    var port = config.database_server.port;

    var connectString = "mongodb://"+ host + ":" + port + "/" + self.db_name ;

    self.connectString = connectString;

    this.connect = function (callback) {
        if (self.mdb) {
            callback(null, self.mdb);
            return;
        }
        MongoClient.connect(connectString, function (err, db) {
            if (db)
                self.mdb = db;
            callback(err, db);
        });
    };


    this.getAdmin = function (user_name, callback) {
        self.connect(function (err, db) {
            if (err) {
                callback(err);
                return;
            }

            db.collection("admin").find({
                username: user_name
            }).toArray( callback );
        });
    };

    this.setAdmin = function (user, callback) {
        self.connect(function (err, db) {
            if (err) {
                callback(err);
                return;
            }
            var update = {$set:{}};
            if( user.password != undefined )
                update.$set.password = user.password;

            db.collection("admin").update({
                username: user.username
            }, update, callback);
        });
    };


    this.getLicense = function ( callback ) {
        if( self._cache.license != undefined ){
            callback( null, self._cache.license );
            return;
        }
        self.connect(function (err, db) {
            if (err) {
                callback(err);
                return;
            }

            db.collection("license").find({}).sort({
                "_id": -1 //last inserted
            }).limit(1).toArray( function( err, doc){
                if( err || doc.length != 1){
                    callback( err );
                    return;
                }
                self._cache.license = doc[0];
                callback( null, self._cache.license );
            } );
        });
    };

    this.insertLicense = function ( license, callback ) {
        self._cache.license = license;

        self.connect(function (err, db) {
            if (err) {
                callback(err);
                return;
            }
            db.collection("license").insert(license, callback);
        });
    };
}
module.exports = AdminDB;
