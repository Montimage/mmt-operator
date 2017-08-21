const CONSTANT = require("../../libs/constant.js");

//interval allowing to select the alerts to be checked
const CHECH_AVG_INTERVAL = 5*60*1000; //1 minute


//col id of element in metric_alert collection
const COL = {
		TIMESTAMP: 0, 
		APP_ID: 1, 
		COM_ID: 2, 
		METRIC_ID: 3, 
		TYPE: 4, 
		PRIORITY: 5, 
		THRESHOLD: 6, 
		VALUE: 7,
}
//global variable for this module
var dbconnector = {};
var publisher   = {};
const REACTORS  = require("../../libs/config.js").sla.actions;


//raise message on a special channel of pub-sub
// + save message to DB
function _raiseMessage( action_name, msg ){
	const reaction = REACTORS[ action_name ];
	if( reaction == undefined )
		return console.error("Reaction [" + action_name + "] is not supported");

	var obj = {};
	for( var i in msg )
		obj[i] = msg[i];
	
	if( publisher.publish )
		publisher.publish( reaction.channel_name, JSON.stringify( msg ) );

	//add reaction at the end of message
	obj[ msg.length ] = reaction;
	
	dbconnector._updateDB( "metrics_reactions", "insert", obj, function( err, data ){
		if( err )
			return console.error( err );
		//console.log( data );
	});
}

//Check on reaction on DB
function _checkReaction( reaction ){
	/*
	reaction = {
				"app_id": "xxx",
				"comp_id":"30",
				"conditions":{"incident":["alert","violate"]},
				"actions":["down_5min"],
				"priority":"MEDIUM",
				"note":"Recommendation: when having incident (alert or violate) then perform \"down_5min\" action",
				"enable":true,
				"id":"0886f1dd-6424-4f52-8ad1-ff4547c5a301"
			}
	*/
	
    const now = (new Date()).getTime();
    const $match = {};
    $match[ COL.TIMESTAMP ] = {"$gte": (now - CHECH_AVG_INTERVAL),"$lt":now };
    $match[ COL.APP_ID ]    = reaction.app_id;
    $match[ COL.COM_ID ]    = reaction.comp_id;
    $match[ "$and" ]        = [];  //conditions
    
    for( var cond in reaction.conditions ){
    		var obj = {};
    		obj[ COL.METRIC_ID ] = cond;
    		obj[ COL.TYPE ]      = {"$in" : reaction.conditions[ cond ] }; //["alert", "violate"]
    		$match["$and"].push( obj );
    }
    
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
			_raiseMessage( reaction.actions[i], [(new Date()).getTime(), reaction.app_id, reaction.comp_id, reaction.id, reaction.actions[i], "xxx"]);
		
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

	}, false );
}


function start( pub_sub, _dbconnector ){
	//donot check if redis/kafka is not using
	if( pub_sub == undefined ){
		console.error("No pub-sub is defined");
		return;
	}

	//when db is ready
	_dbconnector.onReady( function(){
		dbconnector = _dbconnector;
		publisher   = pub_sub.createClient();

		setInterval( perform_check, 
				_mmt.config.sla.reaction_check_period*1000 //each 5 seconds
		);
	});
}

function reset(){

}

var obj = {
		start: start,
		reset: reset
};

module.exports = obj;