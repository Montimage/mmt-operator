var mmtAdaptor = require('../libs/dataAdaptor');

var router = function (db, redis) {
    var report_client = redis.createClient();

    report_client.subscribe("protocol.stat");
    report_client.subscribe("radius.report");
    report_client.subscribe("microflows.report");
    report_client.subscribe("flow.report");
    report_client.subscribe("web.flow.report");
    report_client.subscribe("ssl.flow.report");
    report_client.subscribe("rtp.flow.report");

    report_client.on('message', function (channel, message) {
        console.log(message);
        message = mmtAdaptor.formatReportItem(JSON.parse(message));
        //this is for test purpose only: to create two different probeID
        //message.probe += Math.round(Math.random()); //==> either 0 or 1
        //console.log( message );
        db.addProtocolStats(message, function (err, msg) {});
    });
};

module.exports = router;