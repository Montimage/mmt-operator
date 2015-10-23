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
        message = JSON.parse(message);
        
        if (message[0] == 99 && message[4] == 99) {
            message[11] = 4;//Math.round(1 * message[8]);
            message[12] = Math.round(Math.random() * message[9]);
            message[13] = Math.round(Math.random() * message[10]);
            message[14] = message[8] - message[11];
            message[15] = message[9] - message[12];
            message[16] = message[10] - message[13];
            
            console.log(message);
        }
        //

        message = mmtAdaptor.formatReportItem( message );

        //this is for test purpose only: to create two different probeID
        //message.probe += Math.round(Math.random()); //==> either 0 or 1
        //console.log(message);
        db.addProtocolStats(message, function (err, msg) {});
    });
};

module.exports = router;