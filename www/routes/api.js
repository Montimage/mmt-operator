var express = require('express');
var router = express.Router();

router.get('/*', function (req, res, next) {
    var dbconnector = router.dbconnector;
    
    var PERIOD = {
        MINUTE: "minute",
        HOUR: "hour",
        DAY: "day",
        WEEK: "week",
        MONTH: "month"
    };

    var getOptionsByPeriod = function (period) {
        var retval = {
            collection: 'traffic',
            time: 5* 60 * 1000
        };
        if (period === PERIOD.HOUR) {
            retval = {
                collection: 'traffic_min',
                time: (60  + 1) * 60* 1000 //+1 min => as the last minute is not reported as it is being processed
            };
        } else if (period === PERIOD.DAY) {
            retval = {
                collection: 'traffic_min',
                time: (24 * 60 + 1) * 60 * 1000// +1min
            };
        } else if (period === PERIOD.WEEK) {
            retval = {
                collection: 'traffic_hour',
                time: (7 * 24 + 1) * 3600 * 1000// +1h
            };
        } else if (period === PERIOD.MONTH) {
            retval = {
                collection: 'traffic_day',
                time: (30 + 1) * 24 * 3600 * 1000//+1day
            };
        }
        return retval;
    }

    var getOptionsByPeriod2 = function (period) {
        var retval = {
            collection: 'traffic_min',
            time: {begin : period.begin, end: period.end}
        };
        
        var interval = period.end - period.begin;
        if( interval == 0)
            retval.time.end += 24*60*60*1000; 
        else if ( interval < 7*24*60*60*1000 ) 
            retval.collection = 'traffic_hour';
        else
            retval.collection = 'traffic_day';
        return retval;
    }

    var period = req.query.period || PERIOD.MINUTE;
    if( period.indexOf("begin") > -1 && period.indexOf("end") > -1 )
        period = JSON.parse( period );
    
	var options;
    if( period.begin != undefined && period.end != undefined)
        options = getOptionsByPeriod2(period) ;
    else
        options = getOptionsByPeriod(period);

	//default values
	options.format = [];
	options.raw    = true;
	options.probe  = [];
	options.source = [];
	options.proto  = [];
    options.period = period;
    options.isReload = false;
    
    
	if (req.query.format instanceof Array)
        req.query.format.forEach( function (e){
		    options.format.push( parseInt( e ) );
        });
	else if (req.query.format )
        options.format.push( parseInt(req.query.format) );
    
	if (req.query.raw)
		options.raw = (req.query.raw === 'true');
	
	if (req.query.probe instanceof Array){
		req.query.probe.forEach( function (e){
			options.probe.push (parseInt(e));
		});
	}
	
	if (req.query.source instanceof Array){
		req.query.source.forEach( function (e){
			options.source.push ("'" + e  + "'") ; //TODO avoid sql injection here
		});
	}
	if( req.query.proto instanceof Array)
        req.query.proto.forEach( function( e){
            options.proto.push( e );
        });
    if (req.query.isReload)
		options.isReload = (req.query.isReload === 'true');

    var queryDate = function( op ){
        dbconnector.getProtocolStats(op, function(err, data) {
			if (err) {
				return next(err);
			}
            
            //if( data.length === 0 || data === undefined )
            //    data = createZeroMessage();
            
			//this allow a req coming from a different domain
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Content-Type", "application/json");
			res.send(data);
		});
    }

    if( options.time.begin != undefined )
        queryDate( options );
    else
        dbconnector.getLastTime(function(err, time){
	    	if( err )
		    	return next(err);
		
    		console.log("lastime: " + time + " " + (new Date(time)).toLocaleDateString() );
        
            var inteval = options.time;
		    options.time = {begin: time - inteval, end: time };
         
            queryDate( options );
	});
});

module.exports = router;