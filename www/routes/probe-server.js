var fs         = require('fs');
var path       = require('path');
var lineReader = require('readline');
var mmtAdaptor = require('../libs/dataAdaptor');
var config     = require('../libs/config');
var path       = require('path');
var CURRENT_PROFILE = {};

var router = {};
var COL = mmtAdaptor.StatsColumnId;

//DONOT remove this block
//this is for Video QoS
/*
var qos_reports = [];
function send_to_client( msg ){
    qos_reports.push( msg );
}

setInterval( function(){
    if( qos_reports.length == 0 )
        return;
    //avg
    for( var j=1; j<qos_reports.length; j++)
        for( var i=4; i<13;i++ )
            qos_reports[0][i] += qos_reports[j][i];

    for( var i=4; i<13;i++ )
        if( i != 9 || i != 10 )
            qos_reports[0][i] /= qos_reports.length;

    router.socketio.emit( "qos", qos_reports[0] );

    qos_reports = [];
}, 1000);
*/
//end Video QoS

const _is_offline = (config.probe_analysis_mode === "offline");

router.process_message = function (db, message) {
    if( ! db ) return;

    //console.log( message );
    try {
        //message = message.replace(/\(null\)/g, 'null');
        var msg = mmtAdaptor.formatMessage( message );

        if( msg === null )
            return;

        var format = msg[0];

        if (format === mmtAdaptor.CsvFormat.NO_SESSION_STATS_FORMAT){
            if( router.config.only_ip_session === true ){
                //console.log( message );
                return;
            }
        }

        else if (format === mmtAdaptor.CsvFormat.STATS_FORMAT ){
            if (msg[4] == 0) {
                console.log("[META  ] " + message);
                return;
            }

            if( msg[ COL.IP_SRC ] === "undefined" ){
                console.log("[DONT 1] " + message);
                return;
            }

            if( mmtAdaptor.setDirectionStatFlowByIP(msg) === null) {
                console.log("[DONT KNOW DIRECTION] " + message);
                return;
            }
        }

        else if ( format === mmtAdaptor.CsvFormat.DEFAULT_APP_FORMAT
             ||   format === mmtAdaptor.CsvFormat.WEB_APP_FORMAT
             ||   format === mmtAdaptor.CsvFormat.SSL_APP_FORMAT ) {
            return;
        }

        else if( format === mmtAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT ) {
            if( msg[ mmtAdaptor.BehaviourBandwidthColumnId.VERDICT ] == "NO_CHANGE_BANDWIDTH" ||
              msg[ mmtAdaptor.BehaviourBandwidthColumnId.BW_BEFORE ] == msg[ mmtAdaptor.BehaviourBandwidthColumnId.BW_AFTER ] || msg[ mmtAdaptor.BehaviourBandwidthColumnId.IP ] === "undefined" ){
                console.log( message )
                return;
                //console.log( mmtAdaptor.formatReportItem( msg ) );
            }
        }

        else if( format === mmtAdaptor.CsvFormat.BA_PROFILE_FORMAT ){
            if(     msg[ mmtAdaptor.BehaviourProfileColumnId.VERDICT ] === "NO_CHANGE_CATEGORY"
                 //|| msg[ mmtAdaptor.BehaviourProfileColumnId.VERDICT ] === "NO_ACTIVITY_BEFORE"
                 || msg[ mmtAdaptor.BehaviourProfileColumnId.IP ]      === "undefined" ){
                console.log( message );
                return;
                //console.log( mmtAdaptor.formatReportItem( msg ) );
            }
        }


        else if( format === mmtAdaptor.CsvFormat.LICENSE ){

            if( router.dbadmin )
                router.dbadmin.insertLicense( mmtAdaptor.formatReportItem( msg ));
        }
        else if( format === mmtAdaptor.CsvFormat.OTT_QOS ){
            send_to_client( msg );
        }


        //replace pcap filename ../test_files/exemple_pcap_60.pcap
        if( _is_offline ){
            msg[ 2 ] = path.basename( msg[2] );
        }

         //TODO: to be remove, this chages probe ID, only for Thales demo
        //msg[1] = "Sodium";

        //to test mult-probe
        //msg[1] = Math.random() > 0.5 ? 1 : 0;

        db.addProtocolStats(msg, function (err, err_msg) {});

    } catch (err) {
        //console.error("Error when processing the message: $" + message + "$");
        console.error(err.stack);
        //process.exit(0);
    }
};



router.startListening = function (db, redis) {
    var report_client = redis.createClient();
    //*
    report_client.subscribe("license.stat");
    report_client.subscribe("security.report");
    report_client.subscribe("protocol.flow.stat");
    report_client.subscribe("session.flow.report");
    report_client.subscribe("protocol.stat");
    //report_client.subscribe("radius.report");
    //report_client.subscribe("microflows.report");
    report_client.subscribe("flow.report");
    report_client.subscribe("web.flow.report");
    report_client.subscribe("ssl.flow.report");
    report_client.subscribe("rtp.flow.report");

    report_client.subscribe("behaviour.report");

    report_client.subscribe("ndn.report");
    report_client.subscribe("OTT.flow.report");

    //for MUSA
    report_client.subscribe("metrics.availability");
    //*/

    report_client.on('message', function (channel, message) {
        //console.log( "[" + channel + "] " + message );
        router.process_message(db, message);
    });
};


router.startListeningAtFolder = function (db, folder_path) {
    // ensure data directory exists
    if( !fs.existsSync( folder_path ) ){
      console.error("Error: Data folder [" + config.log_folder + "] does not exists.");
      process.exit();
    }

    //load list of read csv file from db
    var read_files = null;

    if (folder_path.charAt(folder_path.length - 1) != "/")
        folder_path += "/";

    const process_file = function (file_name, cb) {
        const lr = lineReader.createInterface({
         input: fs.createReadStream( file_name )
        });
        var totalLines = 0;

        var start_ts = (new Date()).getTime();
        console.log("file " + path.basename( file_name ));

        lr.on('line', function (line) {
            // 'line' contains the current line without the trailing newline character.
            router.process_message(db, "[" + line + "]");
            totalLines ++;
        });

        lr.on('close', function () {
            // All lines are read, file is closed now.
            start_ts = (new Date()).getTime() - start_ts;
            console.log(" ==> DONE ("+ totalLines +" lines, "+ start_ts +" ms)");

            //remove data file
            if( config.delete_data ){
                //remove semaphore file
                fs.unlink( file_name + ".sem", function(err){
                  if( err ) console.error( err );
                  fs.unlink( file_name, function( e ){
                     if( err ) console.error( err );
                     cb( totalLines );
                  });
                });
            }
            else{
                read_files.push( file_name );
                router.dbadmin.mdb.collection("read-files").insert( {"file_name": file_name}, function(){
                    cb( totalLines );
                });
            }
        });
    };


    var _cache_files = [];
    //get the oldest file containing data and not beeing locked
    var get_csv_file = function (dir) {
        if( _cache_files.length > 0){
          //delete the first element from _cache_files and return the element
          return _cache_files.splice(0, 1)[0];
        }

         //Returns an array of filenames excluding '.' and '..'.
        var files = fs.readdirSync(dir);
        var arr = []; //will contain list of csv files

        for (var i=0; i<files.length; i++) {
            var file_name = files[i];

            //file was read (check in database when the read files are not deleted)
            if( config.delete_data !== true )
                if( read_files.indexOf( dir + file_name ) > -1 )
                    continue;

            //need to end with csv
            if (file_name.match(/csv$/i) == null)
                continue;

            //check if there exists its semaphore
            if ( files.indexOf( file_name + ".sem" ) > -1 )
                arr.push(dir + file_name);
        }

        if( arr.length == 0 )
            return null;

        //sort by ascending of file name
        _cache_files = arr.sort();

        //delete the first element from _cache_files and return the element
        return _cache_files.splice(0, 1)[0];
    };


    var process_folder = function () {
        var file_name = get_csv_file( folder_path );
        if (file_name == null) {
            setTimeout(process_folder, 500);
            return;
        }
        try{
            process_file(file_name, function () {
                process_folder();
            });
        }catch( ex ){
            console.error( ex );
            process_folder();
        }
    };

    process.stdout.write("\nWaiting for data in the folder [" + folder_path + "] ...\n");
    //need to delete .csv and .sem files after reading
    if( config.delete_data ){
        //start after 2 seconds
        setTimeout( process_folder, 2000);
    }else{
        //connect to DB to store list of read files
        var start_process = function(){
            router.dbadmin.connect( function( err, mdb ) {
                if( err ){
                    throw new Error( "Cannot connect to mongoDB" );
                    process.exit(0);
                }
                mdb.collection("read-files").find().toArray( function(err, doc){
                    read_files = [];
                    for(var i in doc)
                        read_files.push( doc[i].file_name );
                    process_folder();
                });
            });
        };

        setTimeout( start_process, 2000);
    }
}

module.exports = router;
