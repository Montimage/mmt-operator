var mmtAdaptor = require('../libs/dataAdaptor');
var config = require('../config.json');

var FLUSH_PERIOD = 5 * 1000;

if (config.buffer_socketio.flush_to_client_period)
    FLUSH_PERIOD = parseInt(config.buffer_socketio.flush_to_client_period) * 1000;


var router = {}
router.activeChannels = {};

router.start_socketio = function (io) {
    io.sockets.on('connection', function (client) {
        
        console.log( "[IO] a client is connected" );
        
        client.on("subscribe", function (msg) {
            console.log( "[IO] a client subscribes to the channel ["+ msg +"]");
            router.activeChannels[ msg ] = true;
            client.channel = msg;
        });

        client.on('disconnect', function () {
            console.log( "[IO] a client unsubscribes to the channel ["+ client.channel +"]");
            if( client.channel != undefined  && router.activeChannels[ client.channel ] === true )
                router.activeChannels[ client.channel ] = false
        });
    });

    function getClient(roomId) {
        var res = [],
            room = io.sockets.adapter.rooms[roomId];
        if (room) {
            for (var id in room) {
                res.push(io.sockets.adapter.nsp.connected[id]);
            }
        }
        return res;
    }

    var flushDataToClient = function () {
        
        //console.log( router.activeChannels );
        
        var channels = {
            "protocol.flow.stat": [100],
            "security.report": [10],
            "ba_profile.report": [12],
            "ba_bandwidth.report": [11]
        };

        for (var channel in channels) {
            if( router.activeChannels[ channel ] !== true )
                continue;
            
            var formats = channels[channel];
            var data = router.windowCache.getFreshData(formats);
            if (data.length > 0) {
                console.log("\n--------> flush " + data.length + " records to clients on the chanel " + channel);
                io.emit(channel, data);
            }
        }
    }
    //
    setInterval(flushDataToClient, FLUSH_PERIOD);

};

module.exports = router;