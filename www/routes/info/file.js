var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");
var exec    = require('child_process').exec;
var path    = require('path');
var config  = require('../../libs/config.js');


router.get("/list_pcap_dump", function( req, res, next ){
  const dump_folder = config.pcap_dump.folder;

  //not define
  if( config.pcap_dump == undefined || config.pcap_dump.folder == undefined ){
     console.error("config.pcap_dump.folder is not defined");
     res.send([]);
     return;
  }
  
  fs.readdir(dump_folder, function(err, files) {
     if( err ){
        res.send([]);
        console.error( err );
        return ;
     }
     
     const ret = [];
     for (var i=0; i<files.length; i++) {
        var file_name = files[i];

        //need to end with pcap
        if (file_name.match(/\d+_thread_\d+\.pcap$/i) == null)
           continue;
        
        //get file statistic
        var stats = fs.statSync( path.join( dump_folder, file_name ));
        
        var str   = file_name.split("_");
        var thread= parseInt( str[2] );
        var start = str[0];
        start   = parseInt( start );
        

        
        ret.push( {
           start  : start,
           end    : start + config.pcap_dump.interval,
           thread : thread,
           file   : file_name,
           size   : stats.size, //file size in bytes
        });
     }
     res.send( ret );
  });
});

router.get("/get_pcap_dump/:fileName", function( req, res, next ){
   const fileName = req.params.fileName;
   //not define
   if( config.pcap_dump == undefined || config.pcap_dump.folder == undefined || fileName == undefined ){
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("ERROR File does not exist");
      return;
   }
   
   
   const filePath = path.join( config.pcap_dump.folder, fileName);
    
// Check if file specified by the filePath exists 
   fs.exists(filePath, function(exists){
      if (exists) {     
         // Content-type is very interesting part that guarantee that
         // Web browser will handle response in an appropriate manner.
         res.writeHead(200, {
            "Content-Type"       : "application/octet-stream",
            "Content-Disposition": "attachment; filename=" + fileName
         });
         fs.createReadStream(filePath).pipe(res);
      } else {
         res.writeHead(400, {"Content-Type": "text/plain"});
         res.end("ERROR File does not exist");
      }
   });
});

router.get("/extract_pcap_dump/:fileName/:localIP/:remoteIP", function( req, res, next ){
   const fileName = req.params.fileName;
   const localIP  = req.params.localIP;
   const remoteIP = req.params.remoteIP;
   
   //not define
   if( config.pcap_dump == undefined || config.pcap_dump.folder == undefined || fileName == undefined ){
      res.writeHead(400, {"Content-Type": "text/plain"});
      res.end("ERROR File does not exist");
      return;
   }
   
   
   const filePath = path.join( config.pcap_dump.folder, fileName);
    
   //Check if file specified by the filePath exists 
   fs.exists(filePath, function(exists){
      if (exists) {     
         //extract packets concerning localIP and remoteIP
         // the output is on tmpFile
         var tmpFile = "/tmp/__mmt_pcapdump.pcap";
         var command = 'tcpdump -n --dont-verify-checksums -w '+ tmpFile +' -r "' + filePath + '" host '+ localIP +' and ' + remoteIP;
         var tcpdump = exec( command );
         tcpdump.on('exit', function (code ){
            //normally the tmpFile must be exit, unless some problem was happening
            fs.exists( tmpFile, function(exists){
               if (exists) {     
                  //we need to stream output file to res
                  // Content-type is very interesting part that guarantee that
                  // Web browser will handle response in an appropriate manner.
                  res.writeHead(200, {
                     "Content-Type"       : "application/octet-stream",
                     "Content-Disposition": "attachment; filename=" + localIP + "-" + remoteIP + "-" + fileName
                  });
                  fs.createReadStream(tmpFile).pipe(res);
               }else{
                  res.writeHead(400, {"Content-Type": "text/plain"});
                  res.end("ERROR File does not exist");
               }
            });
         });
      } else {
         res.writeHead(400, {"Content-Type": "text/plain"});
         res.end("ERROR File does not exist");
      }
   });
});

module.exports = router