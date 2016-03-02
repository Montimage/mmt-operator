var MongoClient = require('mongodb').MongoClient;

function AdminDB( connectString ) {
    var self = this;
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
        self.connect(function (err, db) {
            if (err) {
                callback(err);
                return;
            }

            db.collection("license").find({}).sort({
                "_id": -1 //last inserted
            }).limit(1).toArray( callback );
        });
    };
    
    this.insertLicense = function ( license, callback ) {
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