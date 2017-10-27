/**
 * 
 */
const CONST   = require("../libs/constant.js");
const http    = require('http');
const https   = require('https');
const URL     = require('url');
const express = require('express');
const router  = express.Router();

"use strict"

router.all("/", function( req, res, next ){
   const url     = req.query["url"];
   const headers = req.headers;

   if( url == undefined )
      return res.status( CONST.http.INTERNAL_ERROR_CODE ).end( "Internal Server Error: Need " + url );

   const urlObj = URL.parse( url );
   
   delete( headers.host );
   delete( headers.cookie );
   
   const options = {
         // host to forward to
         host:     urlObj.hostname,
         path:     urlObj.path,
         protocol: urlObj.protocol,
         
         // request method
         method : req.method,
         headers: headers
   };
   
   switch( options.protocol ){
      case "http:":
         client = http;
         options.port = (urlObj.port == undefined ? 80:urlObj.port);
         break;
      case "https:":
         client = https;
         options.port = (urlObj.port == undefined ? 443:urlObj.port);
         break;
      default:
         return res.status( CONST.http.INTERNAL_ERROR_CODE ).end( "Internal Server Error: does not support " + options.protocol );
   };
   
   //console.log( options );
   
   var creq = client.request(options, function(cres) {
      //add a marked header
      cres.headers["X-Source-Via"] = "mmt-http-proxy";
      
      res.writeHead( cres.statusCode, cres.headers );
      // set encoding
      //cres.setEncoding('utf8');

      // wait for data
      cres.on('data', function(chunk){
         res.write(chunk, "binary");
      });

      cres.on('close', function(){
         // closed, let's end client request as well 
         //res.writeHead(cres.statusCode);
         res.end();
      });

      cres.on('end', function(){
         // finished, let's finish client request as well 
         //res.writeHead(cres.statusCode);
         res.end();
      });

   }).on('error', function(e) {
      // we got an error, return 500 error to client and log error
      console.error(e.message);
      res.status( CONST.http.INTERNAL_ERROR_CODE ).end( e.message );
   });

   creq.end();

});

module.exports = router;