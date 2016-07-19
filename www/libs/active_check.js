var request = require('request');

function getUrlResponseTime(publisher, url, component_id){
  //console.log( "check availability of ", component_id );
	options = {timeout: 120};

	request(url, options, function (error, response, body) {
		var start_time = new Date();
    var avail = (!error && response.statusCode == 200) ? 1: 0;

    publisher.publish("metrics.availability","[50,"+component_id+",\"eth0\","+new Date().getTime() / 1000+","+ avail +"]");

	});
}

var timers = {};

function checkAvailabilityOne(publisher, url, comp_id ){
  //stop older timer
  if( timers[ comp_id ] )
    clearInterval( timers[ comp_id ] );

  //start a new timer
  timers[ comp_id ] = setInterval( function(){
    getUrlResponseTime(publisher, url, comp_id);
  }, 5*1000 );
}


function checkAvailability( redis, dbconnector ){
  var publisher = redis.createClient();
  //
  var comp_arr = [
    {id: "0", url: "http://192.168.0.7"},
    {id: "1", url: "http://192.168.0.2"},
    {id: "2", url: "http://192.168.0.3"}
  ];

  for( var i in comp_arr ){
    var comp = comp_arr[i];
    checkAvailabilityOne( publisher, comp.url, comp.id );
  }
}

function reset(){

}

var obj = {
  start: checkAvailability,
  reset: reset
};

module.exports = obj;
