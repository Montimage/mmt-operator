const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const xml2js  = require('xml2js');
const fs      = require("fs");

const HttpException = require("../libs/HttpException");

const parser = new xml2js.Parser();

//status of current upload sla
router._data = {}

//upload SLA files
router.post("/upload/:id", function(req, res, next) {
  const upload = multer({ dest: '/tmp/' }).array('filename', 12);
  const status = router._data[ req.params.id ] = {progress: 0, message:""};
  //error handle
  upload( req, res, function( err ){
    if( err ){
      status.progress = 100;
      status.error = true;
      return status.message  = "Error while uploading SLA files: " + err.message;
    }

    const files = req.files;

    status.error = false;
    status.progress = 30;
    status.message  = "Uploaded " + files.length + " SLA files";

    var sla_arr = [];
    //waiting for 1 second before parsing SLA file
    //this gives times to show a message above on web browser
    setTimeout( function(){
      for( var i=0; i<files.length; i++ ){
        var file = files[i];
        //read file's content
        fs.readFile( file.path, {
          encoding: 'utf8'
        }, function (err, data) {
          if( err ){
            return console.error( err );
          }
          //parse file content as json
          parser.parseString(data, function (err, result) {
            if( err )
              return status.error  = "Error while parsing file " + file.originalname + ": " + err;
            sla_arr.push( result );
            if( sla_arr.length == files.length ){
              status.message  = "Parsed " + files.length + " SLA files";
              status.progress = 60;

              setTimeout( function(){


              var count = extract_metrics( sla_arr );

              status.message  = "Extracted "+ count +" metrics from SLA files";
              status.progress = 100;
            },2000)
            }
          });
        });
      }
    }, 1000);

    res.status(204).end()
  })
});

function extract_metrics( sla ){
  return 100;
}

router.get("/upload/:id", function( req, res, next ){
  const id     = req.params.id;
  const status = router._data[ id ];

  if( id == undefined || status === undefined )
    return res.status(400).send("Not found");

  res.setHeader("Content-Type", "application/json");
  res.send( status );
});
module.exports = router;
