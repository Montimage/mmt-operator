/**
 * API of mmt-admin db: RESTful for find/aggregate/update/insert data from/to mmt-admin
 */

var express  = require('express');
var router   = express.Router();
var AdminDB  = require("../libs/AdminDB.js");
var dbadmin  = new AdminDB();

var response;
var sendResponse = function( error, data ){
  response.setHeader("Content-Type", "application/json");
  if( error )
    return response.status( 500 ).send( error);

  response.send({
    data : data
  });
};

 function proc_request(req, res, next) {
   response = res;

 	//check session loggedin
 	if (req.session.loggedin == undefined) {
 	  res.status(403).send("Permision Denided");
 	  return;
 	}


 	var collection = req.params.collection
    ,     action = req.params.action;

 	//query database
 	var query = undefined;
 	if ( req.query.query )
 		query = JSON.parse(req.query.query);
 	else if ( req.body )
 		query = req.body;


 	if( ["find", "aggregate"].indexOf(action) != -1 ){
    dbadmin.connect( function(err, db){
      if( err ) return res.status(500).send( err );

      db.collection( collection )[ action ](  query ).toArray( sendResponse );
    });
 		return;
 	}else if( ["update", "insert"].indexOf(action) != -1  ){
    if( query.$data == undefined )
      return response.status( 500 ).send( {message: "Need $data"} );

 		console.log( action + " on collection " + collection + ": " + JSON.stringify(query ) );
 		if( action == "update" ){
      if( query.$match == undefined )
        return response.status( 500 ).send( {message: "Need $match"} );

      dbadmin.connect( function(err, db){
        if( err ) return res.status(500).send( err );

        db.collection( collection ).update(  query.$match, query.$data, query.$options, sendResponse );
      });
 		}else if( action == "insert" ){
      dbadmin.connect( function(err, db){
        if( err ) return res.status(500).send( err );

        db.collection( collection ).insert( query.$data, query.$options, sendResponse );
      });
 		}
  }
  else if (action == "remove"){
    if( query.$match == undefined )
      return response.status( 500 ).send( {message: "Need $match"} );
    dbadmin.connect( function(err, db){
      if( err ) return res.status(500).send( err );
      db.collection( collection ).remove(  query.$match, query.$options, sendResponse );
    });
	}else
    sendResponse( "WTF" );
 }

 router.get('/:collection/:action',  proc_request);
 router.post('/:collection/:action', proc_request);

 module.exports = router;
