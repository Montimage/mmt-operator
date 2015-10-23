var mmtAdaptor = require('../libs/dataAdaptor');

var router = function (io, redis) {

    io.sockets.on('connection', function (client) {
        var sub = redis.createClient();

        //sub.psubscribe("*flow.report");

        sub.psubscribe("*.stat");

        sub.on("pmessage", function (pattern, channel, message) {
            message = JSON.parse(message);
            var msg = mmtAdaptor.formatReportItem(message);
            client.emit('stats', msg);

            message[3] = message[3] * 1000;
            
            //For test only
            message[11] = Math.round( Math.random() * message[8] );
            message[12] = Math.round( Math.random() * message[9] );
            message[13] = Math.round( Math.random() * message[10] );
            message[14] = message[8] - message[11];
            message[15] = message[9] - message[12];
            message[16] = message[10] - message[13];
            //
            
            client.emit('stats_raw', message);
        });

        client.on("message", function (msg) {

        });

        client.on('disconnect', function () {
            sub.end();
        });
    });
};

module.exports = router;