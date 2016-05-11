var arr = [
    {
        id: "response_time",
        title: "Response Time",
        x: 0,
        y: 0,
        width: 12,
        height: 9,
        type: "success",
        userData: {
            fn: "createResponseTimeReport"
        },
    },
];

var availableReports = {
    "createResponseTimeReport": "Response Time",
};


//create reports
var ReportFactory = {
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },

    formatRTT : function( time ){
        return (time/1000).toFixed( 2 );
    },

    createResponseTimeReport: function (fPeriod) {
        var _this = this;
        var COL   = MMTDrop.constants.StatsColumn;
        var HTTP  = MMTDrop.constants.HttpStatsColumn;
        var fApp  = MMTDrop.filterFactory.createAppFilter();
        var appList_db = MMTDrop.databaseFactory.createStatDB({id:"app.list"});

        var database = new MMTDrop.Database({id: "app.responsetime", format: [100]}, function( data ){
            //group by timestamp
            var obj  = {};
            var cols = [ COL.DATA_VOLUME, COL.PAYLOAD_VOLUME, COL.PACKET_COUNT, COL.ACTIVE_FLOWS, COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER, HTTP.RESPONSE_TIME, HTTP.TRANSACTIONS_COUNT ];
            for (var i in data) {
                var msg   = data[i];

                var time  = msg[COL.TIMESTAMP.id];
                var exist = true;

                //data for this timestamp does not exist before
                if (obj[time] == undefined) {
                    var o = {};
                    o[COL.TIMESTAMP.id] = time;
                    //init
                    for( var j in cols )
                        o[ cols[j].id ] = 0;
                    obj[time] = o;
                }


                for (var j in cols) {
                    if( msg[ cols[j].id ] != undefined )
                        obj[time][ cols[j].id ] += msg[ cols[j].id ];
                }
            }

            //convert from object to array
            data = [];
            for( var i in obj )
                data.push( obj[i] );
            //sort by inc of time
            data.sort( function( a, b){
                return a[ COL.TIMESTAMP.id ] - b[ COL.TIMESTAMP.id ];
            })

            var time_interval = fPeriod.getDistanceBetweenToSamples();

            //format data
            for( var i=0; i<data.length; i++ ){
                //add index
                data[i][0] = i+1;
                //avg of 1 session
                var val = data[i][ COL.ACTIVE_FLOWS.id ] * 1000; //micro second => milli second
                data[i][ COL.RTT.id ]            = (data[i][ COL.RTT.id ]            / val).toFixed(2);
                data[i].DTT                      = ((data[i][ COL.RTT_AVG_SERVER.id ] + data[i][ COL.RTT_AVG_CLIENT.id ])/val).toFixed( 2 );
                data[i][ COL.RTT_AVG_SERVER.id ] = (data[i][ COL.RTT_AVG_SERVER.id ] / val).toFixed(2);
                data[i][ COL.RTT_AVG_CLIENT.id ] = (data[i][ COL.RTT_AVG_CLIENT.id ] / val).toFixed(2);


                val = data[i][ HTTP.TRANSACTIONS_COUNT.id ] * 1000; //micro second => milli second
                if( val != 0 )
                    data[i][ HTTP.RESPONSE_TIME.id ] = (data[i][ HTTP.RESPONSE_TIME.id ] / val).toFixed(2);

                //% of payload
                data[i][ COL.PAYLOAD_VOLUME.id ] = data[i][ COL.PAYLOAD_VOLUME.id ] * 100 / data[i][ COL.DATA_VOLUME.id ];
                //bit per second
                data[i][ COL.DATA_VOLUME.id ]    = data[i][ COL.DATA_VOLUME.id ] * 8 / time_interval;
                //pps
                data[i][ COL.PACKET_COUNT.id ]   = data[i][ COL.PACKET_COUNT.id ] / time_interval;
            }


            //add zero points for the timestamp that have no data
            var start_time = status_db.time.begin,
                end_time   = status_db.time.end,
                period_sampling = fPeriod.getDistanceBetweenToSamples() * 1000,
                time_id = 3;

            //check whenever probe runing at the moment ts
            var inActivePeriod = function( ts ){
                for( var t in status_db.probeStatus )
                    if( status_db.probeStatus[t].start <= ts && ts <= status_db.probeStatus[t].last_update )
                        return true;
                return false;
            }

            var createZeroPoint = function( ts ){
                var zero = {};
                zero[ time_id ] = ts;

                var default_value = null;

                if( inActivePeriod( ts ) )
                    default_value = 0;

                for( var c in cols )
                    zero[ cols[c].id ] = default_value;

                zero.DTT = default_value;
                zero.ART = default_value;

                return zero;
            }

            //add first element if need
            if( data.length == 0 || start_time < (data[0][ time_id ] - period_sampling) )
                data.unshift( createZeroPoint( start_time ) );

            //add last element if need
            if( data.length == 0 || end_time > (data[ data.length - 1 ][ time_id ] + period_sampling ) )
                data.push( createZeroPoint( end_time ) );

            var len    = data.length;
            var arr    = [];
            var lastTS = start_time;

            while( lastTS <= end_time ){
                lastTS += period_sampling;

                var existPoint = false;
                for (var i = 0; i < len; i++) {
                    var ts = data[i][time_id];

                    if( lastTS - period_sampling < ts && ts <= lastTS){
                        existPoint = true;
                        arr.push( data[i] );
                    }
                }

                if ( !existPoint )
                    arr.push( createZeroPoint( lastTS ) );
            }


            return arr;
        });

        //line chart on the top
        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var cols = [ COL.TIMESTAMP,
                                {id: COL.RTT.id            , label: "Network Rountrip Time (NRT)" , type: "area-stack"},
                                {id: "DTT"                 , label: "Data Transfer Time (DTT)"    , type: "area-stack"},
                                {id: HTTP.RESPONSE_TIME.id , label: "App Response Time (ART)"     , type: "area-stack"},
                                //label: "Data Rate" must be sync with axes: {"Data Rate": "y2"}
                                {id: COL.DATA_VOLUME.id    , label: "Data Rate"                   , type: "line"}
                               ];

                    return {
                        data    : db.data(),
                        columns : cols,
                        ylabel  : "Time (ms)",
                        height  : $( document ).width() > 1600 ? 270 : 250,
                    };
                }
            },

            //c3js options
            chart: {
                padding:{
                    top: 20,
                },
                data:{
                    type: "line",
                    axes:{
                        "Data Rate": "y2"
                    },
                    onclick: function( d, element ){
                        loadDetail( d.x.getTime() );
                    }
                },
                color: {
                    pattern: ['violet', 'orange', 'DeepSkyBlue', 'red']
                },
                grid: {
                    x: {
                        show: false
                    },
                },
                axis: {
                    x: {
                        tick: {
                            format: _this.formatTime,
                        }
                    },
                    y: {
                          tick:{
                              //override the default format
                              format: function( v ){
                                  if( v < 0 ) return 0;
                                  return  v.toFixed(2);
                              }
                          }
                    },
                    y2: {
                        show : true,
                        label: {
                            text: "Data Rate (bps)",
                            position: "outer"
                        },
                        tick: {
                            count: 5,
                            format: function( v ){
                                if( v < 0 ) return 0;
                                return MMTDrop.tools.formatDataVolume( v );
                            }
                        },
                        min: 0,
                        padding: {
                          top: 10,
                          bottom: 2
                        },
                    }
                },
                zoom: {
                    enabled: false,
                    rescale: true
                },
                tooltip:{
                    format: {
                        title:  _this.formatTime
                    }
                },
            },
            afterRender: function(){
                if( ! $("#__cust__style").length )
                    $('<style id="__cust__style" type="text/css">\
.c3-circle {cursor:pointer !important;} \
.c3-event-rect-{cursor:pointer} \
</style>').appendTo("head");
            }

        });

        //show tooltip when user moves mouse over one row off cTable
        window._showCLineTooltip = function ( time ){
            if( cLine )
                cLine.chart.tooltip.show( {x: time} );
        }
        window._hideCLineTooltip = function ( ){
            if( cLine )
                cLine.chart.tooltip.hide();
        }

        //detailled table on the bottom
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var cols = [ {id: 0, label:""},
                                {id: COL.TIMESTAMP.id      , label: "Time"               , align: "left"},
                                {id: HTTP.RESPONSE_TIME.id , label: "ART (ms/trans.)"    , align: "right"},
                                {id: "DTT"                 , label: "DTT (ms/flow)"         , align: "right"},
                                {id: COL.RTT_AVG_SERVER.id , label: "Server DTT (ms/flow)"  , align: "right"},
                                {id: COL.RTT_AVG_CLIENT.id , label: "Client DTT (ms/flow)"  , align: "right"},
                                {id: COL.RTT.id            , label: "NRT (ms/flow)"         , align: "right"},
                                {id: HTTP.TRANSACTIONS_COUNT.id   , label: "HTTP Trans."     , align: "right"},
                                {id: COL.ACTIVE_FLOWS.id   , label: "Active Flows"       , align: "right"},
                                {id: COL.PACKET_COUNT.id   , label: "Packet Rate (pps)"  , align: "right"},
                                {id: COL.DATA_VOLUME.id    , label: "Data Rate (bps)"    , align: "right"},
                                 {id: "packet_size"        , label: "Packet Size (B)"    , align: "right"},
                                {id: COL.PAYLOAD_VOLUME.id , label: "%Payload"           , align: "right"},
                               ];
                    var data = db.data();
                    var arr  = [];
                    var app_id = parseInt( fApp.selectedOption().id );
                    var index = 0;
                    for( var i=0; i<data.length; i++ ){
                        var msg = data[i];
                        if( msg[0] == undefined )
                            continue;

                        msg[0] = ++index;

                        //this happens when cTable is drawn >= 2 times
                        if( msg.__formated === true ) continue;

                        var time = msg[ COL.TIMESTAMP.id ];

                        msg[ COL.TIMESTAMP.id ] = _this.formatTime( new Date( time ) );
                        //user can see in detail if this row has data
                        if( msg[ COL.DATA_VOLUME.id ] > 0 ){
                            var load_fn = 'loadDetail('+ time +','+ app_id +')';
                            msg[ COL.TIMESTAMP.id ] = '<a data-timestamp='+ time +' onclick='+ load_fn +'>' + msg[ COL.TIMESTAMP.id ] + '</a>';
                        }


                        msg["packet_size"] = (msg[ COL.DATA_VOLUME.id ] / msg[ COL.PACKET_COUNT.id ]).toFixed(2);

                        msg[ COL.DATA_VOLUME.id ]  = MMTDrop.tools.formatDataVolume( msg[ COL.DATA_VOLUME.id ] );
                        msg[ COL.PACKET_COUNT.id ] = MMTDrop.tools.formatDataVolume( msg[ COL.PACKET_COUNT.id ] );

                        msg[ COL.PAYLOAD_VOLUME.id ] =  Math.round(msg[ COL.PAYLOAD_VOLUME.id ]) + "%";

                        msg.__formated = true;

                        arr.push( msg );
                    }
                    return {
                        data    : arr,
                        columns : cols
                    };
                }
            },
            chart:{
                "order": [0, "asc"],
                dom: "<'tbl-resp-time-report' t><'row'<'col-sm-3'i><'col-sm-9'p>>",
            },
            bgPercentage:{
                table : ".tbl-resp-time-report",
                column: 13, //index of column, start from 1
                css   : "bg-img-1-red-pixel",
            },
            afterEachRender: function (_chart) {
                // Add event listener for opening and closing details
                _chart.chart.on('mouseover', 'tbody tr[role=row]', function () {
                    var ts  = $(this).find('a').data("timestamp");
                    if ( ts )
                        _showCLineTooltip( ts );
                    return false;
                });

                _chart.chart.on('mouseout', 'tbody', function () {
                    _hideCLineTooltip()
                    return false;
                });
            },
        });

        cLine.attachTo( database, false );
        cTable.attachTo( database, false );
        //when use change app filter
        fApp.onFilter( function( opt ){
            //load data corresponding to the selected app
            var group_by = fPeriod.selectedOption().id;
            var period   = JSON.stringify( status_db.time );
            var db_options = {period: period, period_groupby: group_by, userData : { app_id: parseInt( opt.id )} };

            database.reload( db_options, function(data, chartList){
                for( var i in chartList){
                    chartList[i].redraw();
                }
            }, [cLine, cTable]);
        })

        var dataFlow = [{object: fApp} ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            appList_db,

            // filers
					[fApp],

            // charts
					[
                {
                    charts: [cLine],
                    width: 12
                },
                {
                    charts: [cTable],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },

    createDetailChart : function( ){
         var self    = this;
        var COL     = MMTDrop.constants.StatsColumn;
        var HTTP    = MMTDrop.constants.HttpStatsColumn;
        var SSL     = MMTDrop.constants.TlsStatsColumn;
        var RTP     = MMTDrop.constants.RtpStatsColumn;
        var FORMAT  = MMTDrop.constants.CsvFormat;
        var HISTORY = {};
        var openingRow;

        return MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    //reset
                    HISTORY    = {};
                    openingRow = {};

                    var col_key  = {id: COL.IP_DEST.id,  label: "Server" };
                        //col_key  = {id: COL.APP_PATH.id, label: "App/protocol Path"};

                    var columns = [{id: COL.START_TIME.id, label: "Start Time"   , align:"left"},
                                   {id: "LastUpdated"    , label: "Last Updated" , align:"left"},
                                   col_key
                                   ];

                    var colSum = [
                        {id: HTTP.RESPONSE_TIME.id , label: "ART(ms)"        , align:"right"},
                        {id: "DTT"                 , label: "DTT (ms)"       , align: "right"},
                        {id: COL.RTT_AVG_SERVER.id , label: "Servr DTT(ms)"  , align:"right"},
                        {id: COL.RTT_AVG_CLIENT.id , label: "Client DTT(ms)" , align:"right"},
                        {id: COL.RTT.id            , label: "NRT(ms)"        , align:"right"},
                        {id: HTTP.TRANSACTIONS_COUNT.id   , label: "HTTP Trans."    , align:"right"},
                        {id: COL.ACTIVE_FLOWS.id   , label: "Active Flows"    , align:"right"},
                        {id: COL.UL_DATA_VOLUME.id , label: "Upload (B)"     , align:"right"},
                        {id: COL.DL_DATA_VOLUME.id , label: "Download (B)"   , align:"right"},
                        {id: COL.DATA_VOLUME.id    , label: "Total (B)"      , align:"right"},
                        {id: COL.PACKET_COUNT.id   , label: "Packets"        , align:"right"},
                    ];


                    var data = db.data();

                    var arr = [];
                    var havingOther = false;
                    var updateIP2Name = function( obj, msg ){
                        if( obj.__needUpdateIP2Name == undefined )
                            return;

                        var host =  msg[ HTTP.HOSTNAME.id ];
                        if( host == undefined || host == "" )
                            host = msg[ SSL.SERVER_NAME.id ];
                        if( host != undefined && host != ""){
                            obj[COL.IP_DEST.id]  = obj[COL.IP_DEST.id] + " (" + host  + ")" ;
                            delete( obj.__needUpdateIP2Name );
                        }
                    }

                    for( var i in data){
                        var msg = data[i];
                        var start_time  = msg[ COL.START_TIME.id ];
                        var last_update = msg[ COL.TIMESTAMP.id ];

                        if( last_update < start_time )
                            last_update = start_time;

                        var key_val = msg [ col_key.id ];
                        if( HISTORY[ key_val ] == undefined ){
                            HISTORY[ key_val ] = {
                                data  : {
                                    __key : key_val
                                },
                                detail: [],
                            };
                            //update
                            var obj = HISTORY[ key_val ].data;
                            obj[ col_key.id ] = msg[ col_key.id ];

                            //IP
                            if( col_key.id == COL.IP_DEST.id ){
                                obj.__needUpdateIP2Name = true;
                                updateIP2Name( obj, msg );
                            }else
                                obj[ col_key.id ] =  MMTDrop.constants.getPathFriendlyName( obj[ col_key.id ] );


                            obj[ COL.START_TIME.id ] = start_time;
                            obj[ "LastUpdated" ]     = last_update;

                            for (var j in colSum )
                                obj[ colSum[j].id ] = msg[ colSum[j].id ];

                        }
                        else{
                            var obj = HISTORY[ key_val ].data;
                            if( col_key.id == COL.IP_DEST.id )
                                updateIP2Name( obj, msg );

                            if( obj[ COL.START_TIME.id ] >  start_time ) obj[ COL.START_TIME.id ] = start_time;
                            if( obj[ "LastUpdated" ] < last_update )     obj[ "LastUpdated" ]     = last_update;

                            for (var j in colSum )
                                obj[ colSum[j].id ] += msg[ colSum[j].id ] ;

                        }

                        HISTORY[ key_val ].detail.push( msg );
                    }

                    var arr = [];
                    for( var i in HISTORY )
                        arr.push( HISTORY[i].data );

                    arr.sort( function( a, b){
                        return b[ COL.DATA_VOLUME.id ] -  a[ COL.DATA_VOLUME.id ];
                    });

                    //format data
                    for( var i=0; i<arr.length; i++ ){
                        var obj = arr[i];
                        obj.index = i+1;

                        HISTORY[ i ] = HISTORY[ obj.__key ];

                        obj[ COL.START_TIME.id ]    = moment( obj[COL.START_TIME.id] ).format("YYYY/MM/DD HH:mm:ss");
                        obj[ "LastUpdated" ]        = moment( obj["LastUpdated"] )    .format("YYYY/MM/DD HH:mm:ss");
                        obj[ COL.UL_DATA_VOLUME.id] = MMTDrop.tools.formatDataVolume( obj[ COL.UL_DATA_VOLUME.id] );
                        obj[ COL.DL_DATA_VOLUME.id] = MMTDrop.tools.formatDataVolume( obj[ COL.DL_DATA_VOLUME.id] );
                        obj[ COL.DATA_VOLUME.id]    = MMTDrop.tools.formatDataVolume( obj[ COL.DATA_VOLUME.id]    );

                        obj.DTT = self.formatRTT( obj[ COL.RTT_AVG_CLIENT.id ] + obj[ COL.RTT_AVG_SERVER.id ] );

                        obj[ HTTP.RESPONSE_TIME.id ] = self.formatRTT( obj[ HTTP.RESPONSE_TIME.id ] );
                        obj[ COL.RTT_AVG_CLIENT.id ] = self.formatRTT( obj[ COL.RTT_AVG_CLIENT.id ] );
                        obj[ COL.RTT_AVG_SERVER.id ] = self.formatRTT( obj[ COL.RTT_AVG_SERVER.id ] );
                        obj[ COL.RTT.id ] = self.formatRTT( obj[ COL.RTT.id ] );

                        obj[ col_key.id ] = "<a>" + obj[ col_key.id ] + "</a>";

                    }
                    columns = columns.concat( colSum  );
                    columns.unshift( {id: "index", label: ""});

                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                //"scrollX": true,
                //"scrollY": true,
                dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><t><'row'<'col-sm-3'i><'col-sm-9'p>>",
                deferRender: true,
                order: [[4, "desc"]]
            },
            afterEachRender: function (_chart) {
                // Add event listener for opening and closing details
                _chart.chart.on('click', 'tbody tr[role=row] td a', function () {
                    var tr       = $(this).parent().parent();
                    var row      = _chart.chart.api().row(tr);
                    var row_data = row.data();
                    if( row_data == undefined )
                        return;

                    var index = row_data[0] - 1;

                    //if (openingRow && openingRow.index == index)
                    //    return;

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                        openingRow = {};
                    } else {
                        //close the last opening, that is different with the current one
                        if (openingRow.row ) {
                            openingRow.row.child.hide();
                            $(openingRow.row.node()).removeClass('shown');
                        }

                        // Open this row

                        row.child('<div id="detailTable" class="code-json overflow-auto-xy">----</div>').show();
                        tr.addClass('shown');

                        openingRow = {row: row, index: index};

                        var data = HISTORY[ index ].detail;
                        cDetailTable2.database.data( data );
                        cDetailTable2.renderTo("detailTable")
                    }
                    return false;
                });
            }
        });
    },

    createDetailOfApplicationChart2: function () {
        var self    = this;
        var COL     = MMTDrop.constants.StatsColumn;
        var HTTP    = MMTDrop.constants.HttpStatsColumn;
        var SSL     = MMTDrop.constants.TlsStatsColumn;
        var RTP     = MMTDrop.constants.RtpStatsColumn;
        var FORMAT  = MMTDrop.constants.CsvFormat;
        var openingRow;

        return MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var columns = [{id: COL.START_TIME.id, label: "Start Time", align:"left"},
                                   {id: COL.IP_SRC.id    , label: "Client"    , align:"left"},
                                   {id: COL.PORT_SRC.id  , label: "Src. Port" , align:"right"},
                                   {id: COL.PORT_DEST.id  , label: "Dst. Port" , align:"right"},
                                   {id: COL.APP_PATH.id  , label: "Proto/App Path"    , align:"left"},
                                  ];

                    var colSum = [
                        {id: HTTP.RESPONSE_TIME.id, label: "ART (ms)"       , align:"right"},
                        {id: COL.RTT_AVG_SERVER.id, label: "Server DTT (ms)", align:"right"},
                        {id: COL.RTT_AVG_CLIENT.id, label: "Client DTT (ms)", align:"right"},
                        {id: COL.RTT.id           , label: "NRT (ms)"       , align:"right"},
                        {id: HTTP.TRANSACTIONS_COUNT.id   , label: "HTTP Trans."    , align:"right"},
                        {id: COL.ACTIVE_FLOWS.id  , label: "Active Flows"   , align:"right"},
                        {id: COL.UL_DATA_VOLUME.id, label: "Upload (B)"     , align:"right"},
                        {id: COL.DL_DATA_VOLUME.id, label: "Download (B)"   , align:"right"},

                    ];
                    var otherCols = [
                        { id: HTTP.URI.id      , label: HTTP.URI.label},
                        { id: HTTP.METHOD.id   , label: HTTP.METHOD.label},
                        { id: HTTP.RESPONSE.id , label: HTTP.RESPONSE.label},
                        { id: HTTP.MIME_TYPE.id, label: "MIME"     , align:"left"},
                        { id: HTTP.REFERER.id  , label: "Referer"  , align:"left"},
                    ];


                    var data = db.data();

                    var arr = [];
                    var havingOther = false;

                    for( var i in data){
                        var msg     = data[i];

                        var format  = msg [ COL.FORMAT_TYPE.id ];
                        var obj     = {};
                        obj[ COL.START_TIME.id ]    = moment( msg[COL.START_TIME.id] ).format("YYYY/MM/DD HH:mm:ss");
                        obj[ COL.APP_PATH.id ]      = MMTDrop.constants.getPathFriendlyName( msg[ COL.APP_PATH.id ] );
                        obj[ COL.UL_DATA_VOLUME.id] = msg[ COL.UL_DATA_VOLUME.id];
                        obj[ COL.DL_DATA_VOLUME.id] = msg[ COL.DL_DATA_VOLUME.id];
                        obj[ COL.IP_SRC.id]         = msg[ COL.IP_SRC.id]; // ip
                        obj[ COL.PORT_SRC.id ]      = msg[ COL.PORT_SRC.id ];
                        obj[ COL.PORT_DEST.id ]      = msg[ COL.PORT_DEST.id ];

                        for( var j in colSum ){
                                var val = msg[ colSum[j].id ];
                                if( val == undefined )
                                    val = 0;
                            obj[ colSum[j].id ] = val;
                        }

                        for( var i in otherCols ){
                            var c   = otherCols[i];
                            var val = msg[ c.id ];
                            if( val != undefined && val != ""){
                                obj[ c.id ]  = val;
                                c.havingData = true;
                            }
                        }

                        arr.push( obj );

                    }

                    for( var i in otherCols ){
                        var c = otherCols[i];
                        if( c.havingData === true ){
                            colSum.push( c );
                            //default value for the rows that have not data of this c
                            for( var j in arr )
                                if( arr[j][ c.id ] == undefined )
                                    arr[j][ c.id ] = "";
                        }
                    }

                    columns = columns.concat( colSum  );
                    columns.unshift( {id: "index", label: ""});

                    for( var i=0; i<arr.length; i++ ){
                        arr[i][ COL.UL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( arr[i][ COL.UL_DATA_VOLUME.id ] );
                        arr[i][ COL.DL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( arr[i][ COL.DL_DATA_VOLUME.id ] );
                        arr[i].index = i+1;

                        arr[i][ HTTP.RESPONSE_TIME.id ] = self.formatRTT( arr[i][ HTTP.RESPONSE_TIME.id ] );
                        arr[i][ COL.RTT_AVG_CLIENT.id ] = self.formatRTT( arr[i][ COL.RTT_AVG_CLIENT.id ] );
                        arr[i][ COL.RTT_AVG_SERVER.id ] = self.formatRTT( arr[i][ COL.RTT_AVG_SERVER.id ] );
                        arr[i][ COL.RTT.id ] = self.formatRTT( arr[i][ COL.RTT.id ] );
                    }

                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                "paging": true,
                "info"  : true,
                "dom"   : '<"detail-table table-inside-table row-cursor-default" t><<"col-sm-3"i><"col-sm-3"f><"col-sm-6"p>>',
                "scrollY": "290px",
                "scrollCollapse": true,
                //"scrollX": true,
                deferRender: true,
            },
        });
    },

}


var detail_db    = MMTDrop.databaseFactory.createStatDB({id: "app.detail"});
var cTableDetail = ReportFactory.createDetailChart();

var cDetailTable2 = ReportFactory.createDetailOfApplicationChart2();
cDetailTable2.attachTo( new MMTDrop.Database(), false );

function loadDetail( timestamp, app_id ){
    if( timestamp == undefined )
        return;


    var group_by = fPeriod.selectedOption().id;
    var period   = {begin: timestamp, end: timestamp};
    period = JSON.stringify( period );

    var time_str = moment( timestamp ).format("YYYY/MM/DD HH:mm:ss");
    var userData = null;
    if( app_id )
        userData = {app_id : app_id};

    detail_db.reload({"period": period, period_groupby: group_by, userData : userData }, function( new_data, table){
        table.attachTo( detail_db, false );
        table.renderTo( "popupTable" )
        $("#detailItem").html('<strong>Timestamp: </strong> '+ time_str +' ');
        $("#modalWindow").modal();
    }, cTableDetail);


     if( $("#modalWindow").length === 0 ){
        var modal = '<div class="modal modal-wide fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">'
                    +'<div class="modal-dialog">'
                    +'<div class="modal-content" >'
                    +'<div class="modal-header">'
                    +'<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>'
                    +'<h4 class="modal-title">Detail</h4>'
                    +'</div>'
                    +'<div class="modal-body code-json">'
                    +'<div id="detailItem"/>'
                    +'<div id="popupTable"/>'
                    +'</div>'
                    +'</div></div></div>';

        $("body").append( $(modal) );
    }
}
