var mmtAdaptor = require('../libs/dataAdaptor');
var config     = require('../config.json');

var router = function (io, redis) {

    io.sockets.on('connection', function (client) {
        var sub = redis.createClient();
        var sub_security = redis.createClient();
        
        //sub.psubscribe("*flow.report");

        sub_security.subscribe("security.report");
        sub.subscribe("protocol.flow.stat");

        sub.on("message", function ( channel, message) {
            var msg = JSON.parse(message);
            
            if( msg[0] != mmtAdaptor.CsvFormat.STATS_FORMAT )
                return;
            if( mmtAdaptor.setDirectionProtocolStat( msg, config.mac_gateway ) == null)
                return;

            msg[3] = msg[3] * 1000;
            //console.log( channel );
            client.emit(channel, msg);
        });

        sub_security.on("message", function ( channel, message) {
            var msg = JSON.parse(message);

            msg[3] = msg[3] * 1000;
            console.log( channel + " : " + message );
            client.emit(channel, msg);
        });
        
        client.on("message", function (msg) {

        });

        client.on('disconnect', function () {
            sub.end();
            sub_security.end();
        });
        
        /*
        var verdict = require('../test/results.json');
        var len = verdict.length;
        var index = 0;
        var arr_verdict = ["detected", "not_detected", "respected", "not_respected", "unknown"];
        setInterval( function(){
            if( index >= len )
                index = 0;
            var v = verdict[ index ];
            v[ 4 ] = Math.round(Math.random() * 9);
            v[ 5 ] = arr_verdict[ Math.round(Math.random() * 3) ];
            client.emit( "security.report", v );
        }, 1000 );
        */
    });
};

module.exports = router;