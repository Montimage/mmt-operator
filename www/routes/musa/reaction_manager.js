const CONSTANT = require("../../libs/constant.js");

const config      = require("../../libs/config");
const constant    = require("../../libs/constant.js");
const dataAdaptor = require('../../libs/dataAdaptor');


//const METRIC_COL  = dataAdaptor.StatsColumnId;

//interval allowing to select the alerts to be checked
let CHECK_AVG_INTERVAL_MILISECOND = 60*1000; //1 minute


//col id of element in metric_alert collection
const METRIC_COL = {
		TIMESTAMP: 0, 
		APP_ID: 1, 
		COM_ID: 2, 
		METRIC_NAME: 3, 
		TYPE: 4, 
		PRIORITY: 5, 
		THRESHOLD: 6, 
		VALUE: 7,
		OTHER_INFO: 8
}

const TIMESTAMP = {
	start: 0, 
	end  : 0
}

//global variable for this module
var dbconnector = {};
var publisher   = {};
const REACTORS  = {};

function _getIPs( metric_alert_or_violation ){
	const impactIPs = [];
	const metricName = metric_alert_or_violation[ METRIC_COL.METRIC_NAME ];
	
	const otherInfo = metric_alert_or_violation[ METRIC_COL.OTHER_INFO];
	try{
		switch( metricName ){
			case "attack.DDoS":
				impactIPs.push( JSON.parse( otherInfo ).ip )
			break;
		}
	} catch( e ){
		console.error( e );
	}
	
	return impactIPs;
}

//raise message on a special channel of pub-sub
// + save message to DB
function _raiseMessage( action_name, msg, metric_alert_or_violation ){
	const action = REACTORS[ action_name ];
	if( action == undefined )
		return console.error("Reaction [" + action_name + "] is not supported");

	if( publisher.publish ){
		const publishMsg = {};
		//moment of publishing this message
		publishMsg.ts = (new Date()).getTime();
		//name of action
		publishMsg.action = action_name;
		//metric that triggers this action
		publishMsg.metric = {
			"ts"  : metric_alert_or_violation[ METRIC_COL.TIMESTAMP ],
			"name": metric_alert_or_violation[ METRIC_COL.METRIC_NAME ],
			"type": metric_alert_or_violation[ METRIC_COL.TYPE ]
		}
		
		publishMsg.impact_ips = _getIPs( metric_alert_or_violation );
		
		publisher.publish( action.channel_name, JSON.stringify( publishMsg ) );
	}


	const obj = {};
	for( const i in msg )
		obj[i] = msg[i];
	
	//add reaction at the end of message
	obj[ msg.length ] = JSON.stringify( metric_alert_or_violation );
	
	console.log(JSON.stringify(obj))
	
	dbconnector._updateDB( "metrics_reactions", "insert", obj, function( err, data ){
		if( err )
			return console.error( err );
		//console.log( data );
	});
}


//Check on reaction on DB
function _checkReaction( reaction ){
	console.log("checking SLA reaction: " + JSON.stringify( reaction ));
	/*
	reaction = {
				"app_id": "xxx",
				"comp_id":"30",
				"conditions":{"incident":["alert","violation"]},
				"actions":["down_5min"],
				"priority":"MEDIUM",
				"note":"Recommendation: when having incident (alert or violation) then perform \"down_5min\" action",
				"enable":true,
				"id":"0886f1dd-6424-4f52-8ad1-ff4547c5a301"
			}
	*/
	
    const $match = {};
    $match[ METRIC_COL.TIMESTAMP ] = {"$gte": TIMESTAMP.start, "$lt": TIMESTAMP.end};
    if( reaction.app_id )
       $match[ METRIC_COL.APP_ID ]    = reaction.app_id;
    if( reaction.comp_id )
       $match[ METRIC_COL.COM_ID ]    = reaction.comp_id;

    $match[ "$and" ]        = [];  //conditions
    
    for( var cond in reaction.conditions ){
    		var obj = {};
    		obj[ METRIC_COL.METRIC_NAME ] = cond;
    		obj[ METRIC_COL.TYPE ]      = {"$in" : reaction.conditions[ cond ] }; //["alert", "violation"]
    		$match["$and"].push( obj );
    }
    
	console.log("$match: ", JSON.stringify($match));
	dbconnector._queryDB( "metrics_alerts", "aggregate", [
		{"$match"  : $match},
	], function( err, result){
		if( err )
			return console.error( err );
		if( result.length  == 0 ) 
			return;
		//result = [ { _id: 30, avail_count: 4, check_count: 7 } ]
		result = result[0];
		
		for( var i=0; i<reaction.actions.length; i++ )
			_raiseMessage( reaction.actions[i], 
				[
					1002,                   //0. format id
					reaction.app_id || 1,   //1. probe id
					"iOper",                //2. src
					(new Date()).getTime(), //3. timestamp
					"" + reaction.comp_id,  //4. component ID
					"" + reaction.id,       //5. reaction ID
					reaction.actions[i],    //6. action name
					reaction.note],         //7. reaction note
					result);
		
		//console.log( result );
	}, false);
	//console.log( "check availability" );
}

function perform_check(){
	//get a list of applications defined in metrics collections
	dbconnector._queryDB("metrics", "find", [], function( err, apps){
		if( err )
			return console.error( err );
		var checked = {};

		//for each application
		for( var i in apps ){
			var app = apps[i];
			if( app == null )
				continue;

			//for each component in the app
			for( var react_id in app.selectedReaction ){
				var reaction =  app.selectedReaction[ react_id ];
				
				//this reaction is disabled
				if( reaction.enable !== true )
					continue;

				//this reaction has been checked
				if( checked[ react_id ] )
					continue;
				
				//mark its as checked
				checked[ react_id ] = true;
				
				//check each reaction
				reaction.id     = react_id;
				reaction.app_id = app.id;
				_checkReaction( reaction );
				
			}
		}
		TIMESTAMP.start = TIMESTAMP.end;
		TIMESTAMP.end   = (new Date()).getTime();
	}, false );
}


function start( pub_sub, _dbconnector ){
	if( ! config.sla )
		return console.log("Not found SLA in config");

	if (config.sla.reaction_check_period < 10){
		console.log("Set reaction_check_period = 10 seconds");
		config.sla.reaction_check_period = 10
	}

	console.log("Start SLA reaction checking engine");

	//donot check if redis/kafka is not using
	//if( pub_sub == undefined ){
	//	console.error("No pub-sub is defined");
	//	return;
	//}
	for( const react in config.sla.actions )
		REACTORS[react] = config.sla.actions[ react ];

	//when db is ready
	_dbconnector.onReady( function(){
		dbconnector = _dbconnector;
		if( pub_sub )
			publisher = pub_sub.createClient();

		
		CHECK_AVG_INTERVAL_MILISECOND = config.sla.reaction_check_period * 1000; //each X seconds
		console.log("start SLA reaction checking each " + config.sla.reaction_check_period + " seconds");
      //at the begining, we check in the period [now-X, now]
		const now = (new Date()).getTime(); //millisecond
		TIMESTAMP.start = now - CHECK_AVG_INTERVAL_MILISECOND;
		TIMESTAMP.end   = now;
		setInterval(perform_check, CHECK_AVG_INTERVAL_MILISECOND);
	});
}

function reset(){

}

var obj = {
		start: start,
		reset: reset
};

module.exports = obj;