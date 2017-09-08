//"use strict"

const request = require('request');
var count = 0;

function getUrlResponseTime( publisher, url, component_id, metric ){
	//console.log( "check availability of ", component_id, metric );
	const options = {timeout: 2000}; //in milliseconds

	if( url.indexOf("http://") != 0 )
	   url = "http://" + url;
	
	request(url, options, function (error, response, body) {
		const start_time = new Date();
		const avail = (!error && response.statusCode == 200) ? 1: 0;
		//TODO: disable this
		//avail = Math.round(Math.random());
		const msg = "50,"+component_id+",\"eth0\","+ ((new Date()).getTime() / 1000 ) +"," + (count ++) + "," +avail +", 1";
		//console.info( msg );
		// last element from array is for active check count
		publisher.publish("metrics.avail", msg);
	});
}

function checkAvailability( publisher, dbconnector ){
   //console.log("active checking ...");
	//get a list of applications defined in metrics collections
	dbconnector._queryDB("metrics", "find", [], function( err, apps){
		if( err )
			return console.error( err );
		var checked = {};
		
		//console.info("active checking ...");
		
		//for each application
		for( var i in apps ){
			var app = apps[i];
			if( app == null )
				continue;
			
			
			
			//get availability metric of the app
			var activeMetric = undefined;
			for( var k in app.metrics ){
				if( app.metrics[k].name === "availability" ){
					activeMetric = app.metrics[k];
					break;
				}
			}
			
			//this app has not availability metric
			if( activeMetric == undefined )
				continue;
			
			//for each component in the app
			for( var j in app.components ){
				var com = app.components[j];
				
				//component has no URL
				if( com.url == undefined )
				   continue;
				
				//this url has been checked
				if( checked[ com.url ] )
					continue;
				
				if( app.selectedMetric == undefined )
				   continue;
				
				//mark its as checked
				checked[ com.url ] = true;

				var selectedMetric = app.selectedMetric[ com.id ];
				//no selected metrics
				if( selectedMetric == undefined )
					continue;
				
				//console.log( com.id , selectedMetric[ activeMetric.id ] );
				//compoent has not availability metric or the metric is disabled
				if( selectedMetric[ activeMetric.id ] == undefined 
						|| selectedMetric[ activeMetric.id ].enable === false )
					continue;
				
				
				
				getUrlResponseTime( publisher, com.url, com.id, selectedMetric[ activeMetric.id ] );
			}
		}

	}, false );
}

function start( pub_sub, dbconnector ){
	//donot check if redis/kafka is not using
	if( pub_sub == undefined ){
	   console.error("This works only for kafka/redis bus");
	   process.exit( 1 );
		return;
	}
	
	dbconnector.onReady( function(){
		var publisher;
		if( pub_sub )
			publisher = pub_sub.createClient("producer", "musa-active-checker" );
		else
			publisher = {
				publish : function( channel, msg ){
					console.log(channel, msg );
				}
		}
		setInterval( checkAvailability, 
				_mmt.config.sla.active_check_period * 1000, //each 5 seconds
				publisher, dbconnector )
	});
}

function reset(){

}

var obj = {
		start: start,
		reset: reset
};

module.exports = obj;
