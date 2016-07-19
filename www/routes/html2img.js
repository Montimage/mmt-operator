/**
 * receive image data from client and return an image to download
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();

router.post('/*', function(req, res, next) {
  if( req.body.data == undefined )
    return res.status(500).send("No data");

  var data = req.body.data;
  data = data.replace('data:image/png;base64,', '');

  var filename = req.query.filename;
  var filesize = data.length;

  //tell the browser to download this
  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader("Content-Length", filesize);
  res.setHeader('Content-type'  , "image/png");
  res.setHeader("Cache-Control" , "private");

  //convert to a buffer and send to client
  var fileContents = new Buffer(data, "base64");
  return res.status(200).send(fileContents);
});

module.exports = router;
