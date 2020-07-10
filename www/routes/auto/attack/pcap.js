var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");
var exec    = require('child_process').exec;
var path    = require('path');
var script  = require('../../../libs/exec-script.js');

const TCPREPLAY = "/usr/local/bin/tcpreplay";

//start replaying a pcap file
router.post("/replay/:filename", function( req, res, next ){
	const filename = req.params.filename;
	const params   = req.body;
	console.log( filename, params );
	
	//change the current directory to the one containing the pcap files
	const cwd = path.join(__dirname, "../../../data/attack/pcap/");
	
	const arguments = [];
	//get array of arguments from object 
	for( let i in params ){
		const val = params[i];
		//when value is false => param does not need to be appeared 
		if( val === "false")
			continue;

		arguments.push( i );
		//when value is true => only the presence of the parameter is enough
		if( val === "true" )
			continue;

		arguments.push( params[i] );
	}
	//the last argument is the pcap file
	arguments.push( filename );
	
	const ret = script.exec( TCPREPLAY, arguments, {cwd: cwd} );
	if( ret )
		res.send( ret );
	else
		res.status(500).send("The process is running");
});

//stop replaying a pcap file
router.post("/stop/:filename", function( req, res, next ){
	const filename = req.params.filename;
	const ret = script.stop( TCPREPLAY );
	res.send( {filename: filename} );
});

//get status of a pcap file being replaying
router.get("/status/:filename", function( req, res, next ){
	//const filename = req.params.filename;
	const ret = script.status( TCPREPLAY );
	console.log( ret )
	res.send( ret );
});


module.exports = router;