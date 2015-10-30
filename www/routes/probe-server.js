var mmtAdaptor = require('../libs/dataAdaptor');

var router = function (db, redis) {
    var report_client = redis.createClient();

    report_client.subscribe("protocol.flow.stat");
    //report_client.subscribe("radius.report");
    //report_client.subscribe("microflows.report");
    //report_client.subscribe("flow.report");
    //report_client.subscribe("web.flow.report");
    //report_client.subscribe("ssl.flow.report");
    //report_client.subscribe("rtp.flow.report");

    report_client.on('message', function (channel, message) {
        var msg = JSON.parse(message);
        if( msg[4] == 0){
            //console.log("[META] " + message)
            return;
        }
        if( mmtAdaptor.convertProtocolStatFlow( msg ) == null){
            //console.log("[DONOT] " + message)
            return;
        }
        
        msg = mmtAdaptor.formatReportItem( msg );
        db.addProtocolStats(msg, function (err, err_msg) {});
    });
};

module.exports = router;