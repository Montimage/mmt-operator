var mmtAdaptor = require('../libs/dataAdaptor');

var router = function (db, redis) {
    var report_client = redis.createClient();

    report_client.subscribe("protocol.flow.stat");
    //report_client.subscribe("radius.report");
    //report_client.subscribe("microflows.report");
    report_client.subscribe("flow.report");
    report_client.subscribe("web.flow.report");
    report_client.subscribe("ssl.flow.report");
    //report_client.subscribe("rtp.flow.report");

    report_client.on('message', function (channel, message) {

        message = JSON.parse(message);
        
        
        message = mmtAdaptor.formatReportItem( message );

        //console.log(message);
        db.addProtocolStats(message, function (err, msg) {});
    });
};

module.exports = router;