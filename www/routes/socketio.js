var mmtAdaptor = require('../libs/dataAdaptor');
var config     = require('../config.json');

var router = {}
router.socketio_clients = [];

router.emit_data = function( channel, msg ){
    for( var i in router.socketio_clients ){
        console.log("\n--------> flush " + msg.length + " records to clients on the chanel " + channel);
        router.socketio_clients[i].emit( channel, msg );
    }
};

router.start_socketio = function (io) {
    io.sockets.on('connection', function (client) {
        router.socketio_clients.push( client );
        
        client.on("message", function (msg) {
            
        });

        client.on('disconnect', function () {
            for( var i in router.socketio_clients)
                if (router.socketio_clients[i] == client ){
                    router.socketio_clients.splice( i, 1 );
                    return;
                }
        });
    });
};

module.exports = router;