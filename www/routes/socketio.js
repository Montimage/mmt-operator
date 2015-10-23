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