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
    createResponseTimeReport: function (filter) {
        var _this = this;
        var COL   = MMTDrop.constants.StatsColumn;
        var HTTP  = MMTDrop.constants.HttpStatsColumn;
        var fApp  = MMTDrop.filterFactory.createMetricFilter();
        
        var database = new MMTDrop.Database({id: "link.traffic", format: [100]}, function( data ){
            //group by timestamp
            var obj  = {};
            var cols = [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.ACTIVE_FLOWS, COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER, HTTP.RESPONSE_TIME ];
            for (var i in data) {
                var msg   = data[i];

                var time  = msg[COL.TIMESTAMP.id];
                var exist = true;

                //data for this timestamp does not exist before
                if (obj[time] == undefined) {
                    var o = {};
                    o[COL.TIMESTAMP.id] = time;
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
            
            
            //format data
            for( var i=0; i<data.length; i++ ){
                //add index
                data[i][0] = i+1;
                //avg of 1 session
                var val = data[i][ COL.ACTIVE_FLOWS.id ] * 1000; //micro second => milli second
                data[i][ HTTP.RESPONSE_TIME.id ] = (data[i][ HTTP.RESPONSE_TIME.id ] / val).toFixed(2);
                data[i][ COL.RTT.id ]            = (data[i][ COL.RTT.id ]            / val).toFixed(2);
                data[i].DTT                      = ((data[i][ COL.RTT_AVG_SERVER.id ] + data[i][ COL.RTT_AVG_CLIENT.id ])/val).toFixed( 2 );
                data[i][ COL.RTT_AVG_SERVER.id ] = (data[i][ COL.RTT_AVG_SERVER.id ] / val).toFixed(2);
                data[i][ COL.RTT_AVG_CLIENT.id ] = (data[i][ COL.RTT_AVG_CLIENT.id ] / val).toFixed(2);
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
                        ylabel  : "Time(ms)",
                        height  : 270,
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
                                {id: COL.TIMESTAMP.id      , label: "Time"             , align: "left"}, 
                                {id: HTTP.RESPONSE_TIME.id , label: "ART (ms)"         , align: "right"},
                                {id: "DTT"                 , label: "DTT (ms)"         , align: "right"},
                                {id: COL.RTT_AVG_SERVER.id , label: "Server DTT (ms)"  , align: "right"},
                                {id: COL.RTT_AVG_CLIENT.id , label: "Client DTT (ms)"  , align: "right"},
                                {id: COL.RTT.id            , label: "NRT (ms)"         , align: "right"},
                                {id: COL.ACTIVE_FLOWS.id   , label: "Transactions"     , align: "right"},
                                {id: COL.PACKET_COUNT.id   , label: "Packet Rate (pps)", align: "right"},
                                {id: COL.DATA_VOLUME.id    , label: "Data Rate (bps)"  , align: "right"}];
                    var data = db.data(); 
                    var arr  = [];
                    for( var i in data ){
                        var msg = data[i];
                        if( msg[0] == undefined )
                            continue;
                        
                        //this happens when cTable is drawn >= 2 times
                        if( msg.__formated === true ) continue;
                        
                        var time = msg[ COL.TIMESTAMP.id ];
                        
                        msg[ COL.TIMESTAMP.id ]    = _this.formatTime( new Date( msg[ COL.TIMESTAMP.id ] ) );
                        msg[ COL.DATA_VOLUME.id ]  = MMTDrop.tools.formatDataVolume( msg[ COL.DATA_VOLUME.id ] );
                        msg[ COL.PACKET_COUNT.id ] = MMTDrop.tools.formatDataVolume( msg[ COL.PACKET_COUNT.id ] );
                        
                        var flows = msg[ COL.ACTIVE_FLOWS.id ];
                        if( flows > 0 )
                            msg[ COL.ACTIVE_FLOWS.id ] = '<a href="application/transaction?time='+ time +'" onmouseover=_showCLineTooltip('+ time +') onmouseout=_hideCLineTooltip()>' + flows + '</a>';
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
                dom: "<t><'row'<'col-sm-3'i><'col-sm-9'p>>",
            }
                
        });
        
        var dataFlow = [
            {object: fApp,
             effect: [{object: cLine}, {object: cTable}]
            }];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

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
    
}
