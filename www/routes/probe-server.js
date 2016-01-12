var fs = require('fs');
var mmtAdaptor = require('../libs/dataAdaptor');
var config = require("../config.json");
var LineByLineReader = require('line-by-line');

var CURRENT_PROFILE = {};

var router = {};

router.process_message = function (db, message) {
    //console.log( message );
    try {
        var msg = mmtAdaptor.formatMessage( message );
        if( msg === null )
            return;
        
        
        if (msg[4] == 0) {
            console.log("[META  ] " + message);
            return;
        }
        var format = msg[0];
        if (format == 99)
            return;

        if (format == mmtAdaptor.CsvFormat.STATS_FORMAT && config.local_network != null && mmtAdaptor.setDirectionStatFlowByIP(msg, config.local_network) == null) {
            console.log("[DONT 1] " + message);
            //return;
        }
        if ((format == mmtAdaptor.CsvFormat.DEFAULT_APP_FORMAT || format == mmtAdaptor.CsvFormat.WEB_APP_FORMAT || format == mmtAdaptor.CsvFormat.SSL_APP_FORMAT) && mmtAdaptor.setDirectionProtocolFlow(msg, config.local_network) == null) {
            console.log("[DONT 2] " + message);
            return;
        }
        if( format === 11) {
            if( msg[ mmtAdaptor.BehaviourBandwidthColumnId.VERDICT ] == "NO_CHANGE_BANDWIDTH" ||
              msg[ mmtAdaptor.BehaviourBandwidthColumnId.BW_BEFORE ] == msg[ mmtAdaptor.BehaviourBandwidthColumnId.BW_AFTER ] ){
                console.log( message )
                return;
                //console.log( mmtAdaptor.formatReportItem( msg ) );
            }
            console.log( message );
        }
        
        if( format === 12 ){
            if( msg[ mmtAdaptor.BehaviourProfileColumnId.VERDICT ] == "NO_CHANGE_CATEGORY" ){
                console.log( message )
                return;
                //console.log( mmtAdaptor.formatReportItem( msg ) );
            }else{
                /*
                var ip          =  msg[ mmtAdaptor.BehaviourProfileColumnId.IP ];
                var new_profile =  msg[ mmtAdaptor.BehaviourProfileColumnId.PROFILE_AFTER ];

                if( CURRENT_PROFILE[ ip ] === new_profile ){
                    console.log(" PROFILE_NO_CHANGE ");
                    console.log( message )
                    return;
                }

                CURRENT_PROFILE[ ip ] = new_profile;
                */
            }
        }
        //TODO: to be remove, this chages probe ID, only for Thales demo
        //msg[1] = "Sodium";
        
        if (db && msg)
            db.addProtocolStats(msg, function (err, err_msg) {});


    } catch (err) {
        console.error("Error when processing the message: $" + message + "$");
        console.error(err.stack);
        //process.exit(0);
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
    
    report_client.subscribe("behaviour.report");
    //*/

    report_client.on('message', function (channel, message) {
        //console.log( "[" + channel + "] " + message );
        router.process_message(db, message);
    });
};


router.startListeningAtFolder = function (db, folder_path) {
    if (folder_path.charAt(folder_path.length - 1) != "/")
        folder_path += "/";

    var process_file = function (file_name, cb) {
        var lr = new LineByLineReader(file_name);
        var totalLines = 0;
        
        lr.on('line', function (line) {
            // 'line' contains the current line without the trailing newline character.
            router.process_message(db, "[" + line + "]");
            totalLines ++;
        });

        lr.on('end', function () {
            // All lines are read, file is closed now.
            //remove data file
            fs.unlinkSync( file_name );
            //remove semaphore file
            fs.unlinkSync( file_name + ".sem" );
            cb( totalLines );
        });
    };


    //get the oldest file containing data and not beeing locked
    var get_csv_file = function (dir) {

        var files = fs.readdirSync(dir);
        var arr = [];
        for (var i in files) {
            var file_name = files[i];
            //need to end with csv
            if (file_name.match(/csv$/i) == null)
                continue;

            var lock_file = dir + file_name + ".sem";

            if (fs.existsSync(lock_file) == true) {
                arr.push(dir + file_name);
            }
        }

        if( arr.length == 0 )
            return null;
        
        //sort by ascending of file name
        arr = arr.sort();
        
        return arr[0];
    };
    
    var isPrintedMessage = false;

    var process_folder = function () {
        var file_name = get_csv_file( folder_path );
        if (file_name == null) {
            if ( !isPrintedMessage ) {
                isPrintedMessage = true;
                process.stdout.write("\nWaiting for data in the folder [" + folder_path + "] ");
            }else{
                process.stdout.write(".");
            }
            setTimeout(process_folder, 1500);
            return;
        }

        isPrintedMessage = false;
        console.log("\nProcessing  file [" + file_name + "]");
        process_file(file_name, function ( total ) {
            console.log(" ==> DONE ("+ total +" lines)");
            process_folder();
        });
    };

    setTimeout( process_folder, 2000);
}

module.exports = router;