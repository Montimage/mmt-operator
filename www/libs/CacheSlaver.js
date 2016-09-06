const Cache   = require("../libs/Cache")
, MongoClient = require('mongodb').MongoClient;

const INIT=1, ADD_MESSAGE = 2, FLUSH_TO_DB = 3, FLUSH_CACHE = 4;
var cache, mongodb;

function init( arr ){
}
function add( arr ){
}
function flush_to_db( cb ){
   if( cache )
      cache.flushDataToDatabase( cb );
}
function flush_cache( level, cb ){
   if( cache )
      cache.flushCache( level, cb );
}


process.on("message", function( arr, cb ) {
   switch ( arr[0] ){
      case INIT:
         init( arr );
         break;
      case ADD_MESSAGE:
         add( arr );
         break;
      case FLUSH_TO_DB:
         flush_to_db( cb );
         break;
      case FLUSH_CACHE:
         flush_cache( arr[1], cb );
         break;
   }
});


var forever = function(){
   setTimeout( forever, 1000 );
};
forever();
