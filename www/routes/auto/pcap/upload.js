var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");
var exec    = require('child_process').exec;
var path    = require('path');
var multer  = require('multer');
var script  = require('../../../libs/exec-script.js');
const CacheFile = require("../../../libs/CacheFile.js");

const SCRIPT = "/opt/mmt/probe/bin/probe";

//start replaying a pcap file
router.post("/new", function( req, res, next ){
	const ret = script.status( SCRIPT );
	if( ret.isRunning )
		return res.status(500).send('Another pcap file is being analyzed');

	//handle SLA files uploading
	multer({ dest: '/tmp/' }).single("pcap-file")( req, res, function( err ){
		if( err )
			return res.status(500).send('Cannot copy pcap file');

		//file being uploaded
		const file  = req.file;
		const target = '/tmp/mmt-upload-file.pcap';
		
		//crate a copy of uploaded file
		//target will be created or overwritten by default.
		fs.copyFile( file.path, target, (err) =>{
			if( err )
				return res.status(500).send('Cannot copy pcap file');
			
			//delete uploaded file
			fs.unlink( file.path, function(){
				console.log("Deleted file " + file.path );
			})
			
			//empty database
			router._objRef.dbconnector.emptyDatabase(
				function(){
					//empty cache
					CacheFile.clean( function(){
						//exect mmt-probe to analyze pcap
						const arguments = ['-t', target];
						const ret = script.exec( SCRIPT, arguments, {cwd: path.dirname(target)} );
						if( ret )
							res.send( ret );
						else
							res.status(500).send("Cannot analyze pcap file");
					})
				}
			);
		})
	});
	

});

//stop analyzing a pcap file
router.post("/stop", function( req, res, next ){
	const ret = script.stop( SCRIPT );
	res.send( ret );
});

//get status of a pcap file being analyzed
router.get("/status", function( req, res, next ){
	const ret = script.status( SCRIPT );
	res.send( ret );
});


module.exports = router;