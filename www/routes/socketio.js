var mmtAdaptor = require('../libs/dataAdaptor');
var config     = require('../config.json');

var router = function (io, redis) {

    io.sockets.on('connection', function (client) {
        var sub = redis.createClient();

        //sub.psubscribe("*flow.report");

        sub.subscribe("protocol.flow.stat");

        sub.on("message", function ( channel, message) {
            var msg = JSON.parse(message);
            if( msg[4] != 99 )
                return;
            if( mmtAdaptor.setDirectionProtocolStat( msg, config.mac_server ) == null)
                return;

            msg[3] = msg[3] * 1000;
            
            client.emit('stats_raw', msg);
        });

        client.on("message", function (msg) {

        });

        client.on('disconnect', function () {
            sub.end();
        });
    });
};

module.exports = router;