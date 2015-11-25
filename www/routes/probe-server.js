var fs          = require('fs');
var mmtAdaptor  = require('../libs/dataAdaptor');
var config      = require("../config.json");

var router = {};

router.process_message = function (db, message) {
//    console.log( message );
    try{
    var msg = JSON.parse(message);

    if (msg[4] == 0) {
        console.log("[META  ] " + message);
        return;
    }
    var format = msg[0];
    if( format == 99 )
        return;
    
    if (format == mmtAdaptor.CsvFormat.STATS_FORMAT && config.mac_gateway != null && mmtAdaptor.setDirectionProtocolStat(msg, config.mac_gateway) == null) {
        console.log("[DONT 1] " + message);
        //return;
    }
    if ((format == mmtAdaptor.CsvFormat.DEFAULT_APP_FORMAT || format == mmtAdaptor.CsvFormat.WEB_APP_FORMAT || format == mmtAdaptor.CsvFormat.SSL_APP_FORMAT) && mmtAdaptor.setDirectionProtocolFlow(msg, config.local_network) == null) {
        console.log("[DONT 2] " + message);
        return;
    }

    //route_socketio is assigned from app.js
    if( router.route_socketio ){
        var channel = null;
        switch( format ){
            case mmtAdaptor.CsvFormat.STATS_FORMAT:
                channel = "protocol.flow.stat";
                break;
            case mmtAdaptor.CsvFormat.SECURITY_FORMAT:
                channel = "security.report";
                break;
        }
        if( channel ){
            var m = msg.slice( 0 );
            m[3] *= 1000;    //timestamp
            router.route_socketio( channel, m );
        }
    }
    
    msg = mmtAdaptor.formatReportItem(msg);

    if( db && msg )
        db.addProtocolStats(msg, function (err, err_msg) {});
    }catch( err ){
        console.error( err );
    }
};



router.startListening = function (db, redis) {
    var report_client = redis.createClient();
    //*
    report_client.subscribe("security.report");
    report_client.subscribe("protocol.flow.stat");
    //report_client.subscribe("protocol.stat");
    //report_client.subscribe("radius.report");
    //report_client.subscribe("microflows.report");
    report_client.subscribe("flow.report");
    report_client.subscribe("web.flow.report");
    report_client.subscribe("ssl.flow.report");
    report_client.subscribe("rtp.flow.report");
    //*/

    report_client.on('message', function (channel, message) {
        //console.log( "[" + channel + "] " + message );
        router.process_message(db, message);
    });
};


router.startListeningAtFolder = function (db, folder_path) {
    var listen_period = config.probe_stats_period * 1000;
        
    var process_file = function (file_name, cb) {
        var input_stream = fs.createReadStream(file_name);
        var remaining = '';

        input_stream.on('data', function (data) {
            remaining += data;
            var index = remaining.indexOf('\n');
            while (index > -1) {
                var line = remaining.substring(0, index);
                remaining = remaining.substring(index + 1);
                
                router.process_message(db, "[" + line + "]" );
                
                index = remaining.indexOf('\n');
            }
        });

        input_stream.on('end', function () {
            if (remaining.length > 0) {
                router.process_message(db, "["+ remaining +"]" );
            }
            //delete file
            fs.unlink( file_name, function( err  ){} );
            
            cb();
        });
    };
    
    
    //get list of files contains data and not beeing locked
    var read_and_sort_files_by_date = function( dir ){
        
        var files = fs.readdirSync( dir );
        var arr = [];
        for( var i in files ){
            var file_name = files[i];
            if( file_name.match(/csv$/i) == null )
                continue;
            
            var lock_file = dir + file_name.replace(".csv", ".lock");

            if( fs.existsSync( lock_file ) == false ){
                arr.push( dir + file_name );
            }
        }
        
        return arr.map(function(v) { 
                  return { name:v,
                           time:fs.statSync( v ).mtime.getTime()
                         }; 
               })
               .sort(function(a, b) { return b.time - a.time; })
               .map(function(v) { return v.name; });
    };
    
    var process_folder = function(){
        var files = read_and_sort_files_by_date( folder_path );
        var total    = files.length;
        var num_file = 0;
        if( total == 0 ){
            console.log("Waiting data in the folder ["+ folder_path +"] ... ");
            setTimeout( process_folder, listen_period );
            return;
        }
        
        console.log("Processing " + JSON.stringify(files) );
        for( var i in files ){
            var file_name = files[i];
            process_file( files[i], function(){
                num_file ++;
                console.log( num_file + " done file " + file_name );
                if( num_file == total ){
                    setTimeout( process_folder, listen_period );
                }
            } );
        }
    };
    
    process_folder();
}

module.exports = router;