var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var _os     = require("os");
var exec    = require('child_process').exec;
var path    = require('path');
var script  = require('../../../libs/exec-script.js');

const MMT_PROBE="/opt/mmt/probe/bin/probe"
/*
As I mentioned during the call, we will need the following for the mid-term review:

For the monitoring policy:
- Monitoring configurations. We could use the MMT plugin that MI developed for ANASTACIA. Please check if it is still valid for the MMT tool.
https://ants-gitlab.inf.um.es/anastacia-framework/security-enablers-provider/-/blob/master/m2l_plugins/mspl_mmt_agent.py 
We have to check because we haven't maintained it since then.

- End-point to enforce the monitoring configurations

For the reactive forwarding policy:
- Forwarding configurations. Type of configuration required, and to create a translator plugin (even if it is only hardcoded).
- End-point to enforce the forwarding configurations.

For the Decision Engine MOCKUP
Notification format that the Decision Engine MOCKUP should receive from the Security Analytics Engine.

*/


//STATUS
router.get("/monitoring", function( req, res, next ){
	const ret = script.status( MMT_PROBE, 'SIGINT' );
	if( ret )
		res.send( {status: "ok", data: ret } );
	else
		res.status(500).send({status: "error"} );
});
//START
router.post("/monitoring", function( req, res, next ){
	//stop old probe
	script.stop( MMT_PROBE );
	const args = [
	 "-i", "lo", 
	 "-Xkafka-output.enable=true",
	 "-Xkafka-output.hostname=10.0.37.5",
	 "-Xkafka-output.port=30031",
	 "-Xkafka-output.topic=mi-reports-k8s",
	 "-Xsession-report.output-channel=kafka",
	 "-Xsession-report.output-channel=kafka",
	];
	const ret = script.exec( MMT_PROBE, args, {} );
	if( ret )
		res.send( {status: "ok", description: "Successfully started MMT-Probe"} );
	else
		res.status(500).send({status: "error", description: "Cannot start MMT-Probe"} );
});

//STOP
router.delete("/monitoring", function( req, res, next ){
	//stop old probe
	script.stop( MMT_PROBE );
	res.send( {status: "ok", description: "Successfully stopped MMT-Probe"} );
});

//UPDATE
router.put("/monitoring", function( req, res, next ){
	//stop old probe
	script.stop( MMT_PROBE );
	//wait for mmt-probe being stoped
	setTimeout(function(){
		const args = [
		 "-i","lo", 
		 "-Xkafka-output.enable=true",
		 "-Xkafka-output.hostname=10.0.37.5",
		 "-Xkafka-output.port=30031",
		 "-Xkafka-output.topic=mi-reports-k8s",
		 "-Xsession-report.output-channel=kafka",
		 "-Xsession-report.output-channel=kafka",
		 "-Xsecurity.enable=true",
		 "-Xsecurity.ignore-remain-flow=true",
		 "-Xsecurity.thread-nb=0",
		 "-Xsecurity.exclude-rules=1-200",
		 "-Xsecurity.output-channel=kafka",
		];
		const ret = script.exec( MMT_PROBE, args, {} );
		if( ret )
			res.send( {status: "ok", description: "Successfully updated MMT-Probe"} );
		else
			res.status(500).send({status: "error", description: "Cannot update MMT-Probe"} );
	}, 500)
});

/*
Need to call kubernetes to redirect traffic
*/
router.post("/reaction/forwarding", function( req, res, next ){
	res.send( {status: "ok"} );
});


module.exports = router;