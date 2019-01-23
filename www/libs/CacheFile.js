const hash    = require('object-hash');
const fs      = require('fs');
const zlib    = require('zlib');

function CacheFile( obj ){
   //get id from the obj
   const objectID      = hash( obj );
   const cacheFileName = "/tmp/mmt-operator-" + objectID + ".cache.zip";
   
   return {
      getID : function(){
         return objectID;
      },
      getFileName: function(){
         return cacheFileName; 
      },
      hasData: function(){
         return fs.existsSync( cacheFileName );
      },
      getDataFromCache: function( cb ){
         if( typeof( cb ) !== "function" )
            cb = console.log;
         
         fs.readFile( cacheFileName, 'utf8', function( err, data ){
            if( err )
               return cb( err, null );
            
            //convert data string to buffer
            const buffer = Buffer.from( data, 'base64' ); 
            
            zlib.unzip( buffer, function(err2, data2){
               if( err2 )
                  return cb( err2 );
               
               try{
                  cb( null, JSON.parse( data2 ) );
               }catch( err3 ){
                  cb( err3 );
               }
            });
         });
      },
      saveDataToCache: function( data ){
         data = JSON.stringify( data );
         
         zlib.deflate( data, function(err, buffer ){
            if( err )
               return;
            
            fs.writeFile( cacheFileName, buffer.toString('base64'), 'utf8', function(err3, ret3){
               if( err3 )
                  console.error("Cannot save data in cache " + cacheFileName, err3 );
               else
                  console.info("Save data in cache " + cacheFileName );
            });   
         });
      }
   }
}


module.exports = CacheFile;