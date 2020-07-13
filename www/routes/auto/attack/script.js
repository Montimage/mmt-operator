var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");
var path    = require('path');
var exec    = require('../../../libs/exec-script.js');
//change the current directory to the one containing the pcap files
const cwd = path.join(__dirname, "../../../data/attack/script/");
	
router.post("/start/:filename", function( req, res, next ){
	const filename = req.params.filename;
	const params   = req.body;
	console.log( filename, params );

	const script = path.join( cwd, filename );
	
	const arguments = [];
	//get array of arguments from object 
	for( let i in params ){
		const val = params[i];
		arguments.push( i ),
		arguments.push( val );
	}
	
	const ret = exec.exec( script, arguments, {cwd: cwd} );
	if( ret )
		res.send( ret );
	else
		res.status(500).send("The process is running");
});

//stop replaying a pcap file
router.post("/stop/:filename", function( req, res, next ){
	const filename = req.params.filename;
	const script = path.join( cwd, filename );
	const ret = exec.stop( script );
	res.send( {filename: filename} );
});

//get status of a pcap file being replaying
router.get("/status/:filename", function( req, res, next ){
	const filename = req.params.filename;
	const script = path.join( cwd, filename );
	const ret = exec.status( script );
	console.log( ret )
	res.send( ret );
});


module.exports = router;