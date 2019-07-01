'use strict';

const fs   = require('fs');
const path = require('path');

const ENOENT  = 0;
const FILE    = 1;
const FOLDER  = 2;
const UNKNOWN = 3;

/**
 * Check whether a dir is existing
 * @param dir
 * @returns
 */
function exists (dir) {
   return new Promise( (resolve, reject ) => {
      try {
         var stat = fs.statSync(dir);
         if( stat.isFile() )
            return resolve( FILE );
         else if( stat.isDirectory() )
            return resolve( FOLDER );
         else
            return resolve( UNKNOWN );
      }
      catch (e) {
         //file/folder does not exist
         if (e.code === 'ENOENT') {
            return resolve( ENOENT );
         }

         reject( e );
      }
   });
}

/**
 * Remove a dir that is either a folder or a file
 * @param dir
 * @returns a promise
 * - resolve( dir )
 * - reject( error )
 * 
 */
function rm( dir ){
   return new Promise( (resolve, reject) => {
      exists( dir )
      .then( (type) => {
         switch( type ){
         case FILE:
            return rmFile( dir ).then( resolve, reject );
         case FOLDER:
            return rmFolder( dir ).then( resolve, reject );
         case ENOENT:
            return resolve( dir );
         default:
            return reject( type );
         }
      });
   });
}

function rmFile( dir ){
   return new Promise( (resolve, reject ) => {
      try{
         fs.unlink( dir, (error ) => {
            if( error )
               return reject( error );
            resolve( dir );
         });
      }catch( e ){
         reject( e );
      }
   });
}

function rmEmptyFolder( dir ){
   return new Promise( (resolve, reject ) => {
      try{
         fs.rmdir( dir, (error ) => {
            if( error )
               return reject( error );
            resolve( dir );
         });
      }catch( e ){
         reject( e );
      }
   });
}


function rmFolder( dir ){
   return new Promise( (resolve, reject ) => {
      try{
         const files = fs.readdirSync( dir );
         
         //get array of promises that remove children of dir
         const promiseArr = files.map( file => {
            file = path.join( dir, file ); //get full path
            return rm( file );
         });
         
         //waiting for all promises are resolved
         Promise.all( promiseArr )
            .then( () => rmEmptyFolder( dir ) )
            .catch( reject );
         
      }catch( e ){
         reject( e );
      }
   });
}

module.exports = {
   ENOENT   : ENOENT,
   FILE     : FILE,
   FOLDER   : FOLDER,
   UNKNOWN  : UNKNOWN,
   exists   : exists,
   rmFile   : rmFile,
   rmFolder : rmFolder,
   rm       : rm
};
