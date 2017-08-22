
var express = require('express');
var router  = express.Router();
var path    = require("path");

router.get('/:fileName', function(req, res, next) {
   const fileName = req.params["fileName"];
   try{
      const module   = require( "../libs/shared/" + fileName );

      res.setHeader("Content-Type", "application/json");
      res.send( module.toString() );
   }catch( e ){
      console.error( e );
      res.status( 404 ).send("Not Found");
   }
});

module.exports = router;
