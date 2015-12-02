var fs = require('fs');
var mmtAdaptor = require('../libs/dataAdaptor');
var config = require("../config.json");
var LineByLineReader = require('line-by-line');


var router = {};
router.cacheData = {};

//cache size
var MAX_LENGTH   = 5000;
var MAX_PERIOD   = 60*60*1000;    //1 hour
var FLUSH_PERIOD = 5*1000;

if( config.buffer_socketio ){
    if( config.buffer_socketio.max_length_size )
        MAX_LENGTH = parseInt( config.buffer_socketio.max_length_size );
    if( config.buffer_socketio.max_period_size )
        MAX_PERIOD = parseInt( config.buffer_socketio.max_period_size ) * 1000;
    if( config.buffer_socketio.flush_to_client_period )
        FLUSH_PERIOD = parseInt( config.buffer_socketio.flush_to_client_period ) * 1000;
}

/**
 * A cache retains data in a period.
 * @param {integer} period size of this cache by seconds
 */
var CacheTimeStat = function( channel ){
    
    var self = this;
    this.latestTimestamp = null;
    this.oldestTimestamp = null;
    this.numberOfRemoved = 0;
    this.data = [];
    //msg.time is in miliseconds;
    this.push = function( msg ){
        if( msg === undefined )
            return;
        
        msg = msg.slice( 0 ); //clone data
        self.data.push( msg );
        var time = msg[3];
        self.latestTimestamp = time;
        if( self.oldestTimestamp === null )
            self.oldestTimestamp = time;
        else{
            var index = -1;
            //
            while ( (self.latestTimestamp - self.oldestTimestamp > MAX_PERIOD || self.data.length > MAX_LENGTH) && index < self.data.length - 1) {
                index ++;
                self.oldestTimestamp = self.data[index][3];
            }
            
            if( index > -1 ){
                //remove the first (index+1) elements
                self.data.splice(0, index+1 );
                self.numberOfRemoved += index + 1;
            }
        }
    };
    
    this.flushDataToClient = function(){
        var data = self.data;
    
        if( data.length > 0 ){
            if( self.numberOfRemoved > 0 )
                console.log( "  there are " + self.numberOfRemoved +" records in ["+ channel +"] that are either older than "+ (new Date( self.oldestTimestamp)).toLocaleTimeString() +" or over flow the cache length " + MAX_LENGTH );
            
            //reset data
            self.numberOfRemoved = 0;
            self.data = [];
            
            if( router.route_socketio ){
                router.route_socketio( channel, data );
            }
        }
    }
    
    setInterval( self.flushDataToClient, FLUSH_PERIOD );    //each X seconds
}


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

        if (format == mmtAdaptor.CsvFormat.STATS_FORMAT && config.mac_gateway != null && mmtAdaptor.setDirectionProtocolStat(msg, config.mac_gateway) == null) {
            console.log("[DONT 1] " + message);
            //return;
        }
        if ((format == mmtAdaptor.CsvFormat.DEFAULT_APP_FORMAT || format == mmtAdaptor.CsvFormat.WEB_APP_FORMAT || format == mmtAdaptor.CsvFormat.SSL_APP_FORMAT) && mmtAdaptor.setDirectionProtocolFlow(msg, config.local_network) == null) {
            console.log("[DONT 2] " + message);
            return;
        }

        //TODO: to be remove, this chages probe ID, only for Thales demo
        msg[1] = "Sodium";
        
        //route_socketio is assigned from app.js
        if (router.route_socketio) {
            var channel = null;
            switch (format) {
            case mmtAdaptor.CsvFormat.STATS_FORMAT:
                channel = "protocol.flow.stat";
                break;
            case mmtAdaptor.CsvFormat.SECURITY_FORMAT:
                channel = "security.report";
                break;
            }
            if (channel) {
                if( router.cacheData[ channel ] === undefined )
                    router.cacheData[ channel ] = new CacheTimeStat( channel );
                else
                    router.cacheData[ channel ].push( msg );
            }
        }

        msg = mmtAdaptor.formatReportItem(msg);

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

        lr.on('line', function (line) {
            // 'line' contains the current line without the trailing newline character.
            router.process_message(db, "[" + line + "]");
        });

        lr.on('end', function () {
            // All lines are read, file is closed now.
            //remove data file
            fs.unlinkSync( file_name );
            //remove semaphore file
            fs.unlinkSync( file_name + ".sem" );
            cb();
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
                process.stdout.write("\nWaiting data in the folder [" + folder_path + "] ");
            }else{
                process.stdout.write(".");
            }
            setTimeout(process_folder, 1500);
            return;
        }

        isPrintedMessage = false;
        console.log("\nProcessing  file [" + file_name + "]");
        process_file(file_name, function () {
            console.log(" ==> DONE ");
            process_folder();
        });
    };

    setTimeout( process_folder, 2000);
}

module.exports = router;