const hash    = require('object-hash');
const fs      = require('fs');
const zlib    = require('zlib');
const path    = require('path');
const config  = require('./config');


//clean cache folder


//remove oldest files to maintain its limitations of number of files and size
function standalizeCacheFolder( reservedSize, cb ){
   const dir = config.query_cache.folder;
   fs.readdir( dir, function( err, files ){
      if(err)
         return cb( err );
      
      const stats = [];
      let totalSize = 0; //total size of the files in dir
      
      //for each file in the directory
      files.forEach( function( file ){
         file = path.join( dir, file );
         const stat = fs.statSync( file );
         
         totalSize += stat.size;
         
         stats.push({
            file: file,
            size: stat.size,
            time: stat.atimeMs//last access time
         });
      });
      
      //under control
      if( (files.length   <= config.query_cache.files) 
            && (totalSize <= config.query_cache.bytes - reservedSize ))
         return cb();
      
      //sort the files by increasing the access time
      stats.sort( function( a, b ){
         return a.time - b.time;
      });
      
      //remove oldest files to maintain config.query_cache.files
      let rmFiles = 0; //number of files being removed
      let rmBytes = 0; //number of bytes being removed
      while( rmFiles < stats.length 
            && !((stats.length - rmFiles <= config.query_cache.files) 
              && (totalSize  - rmBytes <= config.query_cache.bytes - reservedSize ))){
         
         try{
            fs.unlinkSync( stats[rmFiles].file );
            
            rmBytes += stats[rmFiles].size;
            rmFiles ++;
            
         }catch( err2 ){
            console.error( err2 );
         }
         
      }
      
      cb();
      
   });
}

function CacheFile( obj ){
   if( config.query_cache.enable && !fs.existsSync( config.query_cache.folder) ){
      try{
         fs.mkdirSync( config.query_cache.folder, {recursive: true} );
      }catch( err ){
         console.error("Cannot create folder ["+ config.query_cache.folder +"]: ", err );
         //when we cannot create a folder to contain cache => we need to disable the cache
         config.query_cache.enable = false;
      }
   }
   
   //get id from the obj
   const objectID      = hash( obj );
   const cacheFileName = path.join(  config.query_cache.folder, "mmt-operator-" + objectID + ".cache.zip");
   
   return {
      getID : function(){
         return objectID;
      },
      getFileName: function(){
         return cacheFileName; 
      },
      hasData: function(){
         if( ! config.query_cache.enable )
            return false;
         return fs.existsSync( cacheFileName );
      },
      getDataFromCache: function( cb ){
         if( ! config.query_cache.enable )
            return false;
         
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
         if( ! config.query_cache.enable )
            return false;
         
         data = JSON.stringify( data );
         
         //zip data to save space
         zlib.deflate( data, function(err, buffer ){
            if( err )
               return;
            
            const fileContent = buffer.toString('base64');
            const fileSize    = fileContent.length;
            
            
            standalizeCacheFolder( fileSize, function( err2 ){
               if( err2 )
                  return console.error( err2 );
               
               //write cache
               fs.writeFile( cacheFileName, fileContent, 'utf8', function(err3, ret3){
                  if( err3 )
                     console.error("Cannot save data in cache " + cacheFileName, err3 );
                  else
                     console.info("Save data in cache " + cacheFileName );
               });
            });
         });
      }
   };
}



CacheFile.clean = function( cb ){
   const dir = config.query_cache.folder;
   const f   = require('./filePromise');
   if( !cb )
      cb = function(){};
      
   console.log("Clean " + dir );
   
   f.rm( dir )
   .then( function(){ cb() }  )
   .catch( function(e){ throw e; })     
         
   
}

module.exports = CacheFile;