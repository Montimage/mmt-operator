
const express   = require('express');
const router    = express.Router();
const fs        = require('fs');
const path      = require('path');

const config    = require("../libs/config.js");
const CacheFile = require("../libs/CacheFile.js");
const constant  = require("../libs/constant.js");



//all middlewares are in restful folder
const PROCESSORS = {};
const restfulDir = `${__dirname}/restful`;

fs.readdirSync( restfulDir ).forEach(filename => {
   const file = path.parse( filename );
   if( file.ext.toLowerCase() === '.js' )
      PROCESSORS[ file.name.toLowerCase() ] = require( path.join( restfulDir, filename ));
});


/**
 * Check permission beforehand
 */
router.use( function( req, res, next){
   //check session loggedin
   if (req.session.loggedin == undefined) {
      res.status(403).send("Permision Denided");
      return;
   }
   next();
});

function sendResponse( res, error, data ){
   res.setHeader("Content-Type", "application/json");
   
   if( error ){
      res.status( 500 ).send( error.message ); //interntl error
      //console.error( error );
      return;
   }
   
   res.send({
      data : data == undefined ? []: data,
      now  : (new Date()).getTime()
   });
};



function getPeriod(start, end){
   const PERIOD = constant.period;
   
   const interval = end - start;
   if( interval < 0 )
      throw new Error("Period is incorrect: start > end");
   
   if( interval < 60*60*1000 )
      return PERIOD.REAL;
   else if( interval < 24*60*60*1000 )
      return PERIOD.MINUTE;
   else if( interval < 7*24*3600*1000 )
      return PERIOD.HOUR;
   else
      return PERIOD.DAY;
}

function getQuery( str ){
   if( typeof( str ) === 'object' )
      return str;
   
   if( str == undefined )
      return {};
      
   try{
      return JSON.parse( str );
   }catch( ex ){
      throw new Error( "query is incorrect: " + ex.message );
   }
}

/*

The HTTP operations available are:
- GET (retrieve an index of resources or an individual resource)
- POST (create a resource or generally provide data)
- PUT (create or replace a resource)
- PATCH (update/modify a resource)
- DELETE (remove a resource)
*/



router.get( '/:collection/:start/:end', function (req, res, next) {
   try{
      const collection  = req.params.collection.toLowerCase();
      const startTime   = parseInt( req.params.start );
      const endTime     = parseInt( req.params.end );
      const dbconnector = router.dbconnector;
      const query       = getQuery( req.query );
      const period      = getPeriod( startTime, endTime );
      
      const proc = PROCESSORS[ collection ];
      if( proc ) //found a middleware
         return proc( startTime, endTime, period, query, dbconnector, (err, data) => sendResponse( res, err, data) );
      else
         return sendResponse( res, new Error("Unsupported") );      
   }catch( ex ){
      return sendResponse( res, ex );
   }
});


module.exports = router;
