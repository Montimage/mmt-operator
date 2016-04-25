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
        var fApp  = MMTDrop.filterFactory.createMetricFilter();
        var database2 = MMTDrop.databaseFactory.createStatDB({id: "link.traffic"});
        
        var database = new MMTDrop.Database({id: "link.traffic", format: [100]}, function( data ){
            //group by timestamp
            var obj  = {};
            var cols = [ COL.DATA_VOLUME, COL.PACKET_COUNT, COL.ACTIVE_FLOWS, COL.RTT, COL.RTT_AVG_CLIENT, COL.RTT_AVG_SERVER ];
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
                data[i].ART                      = 0;
                data[i][ COL.RTT.id ]            = (data[i][ COL.RTT.id ]            / val).toFixed(2);
                data[i].DTT                      = ((data[i][ COL.RTT_AVG_SERVER.id ] + data[i][ COL.RTT_AVG_CLIENT.id ])/val).toFixed( 2 );
                data[i][ COL.RTT_AVG_SERVER.id ] = (data[i][ COL.RTT_AVG_SERVER.id ] / val).toFixed(2);
                data[i][ COL.RTT_AVG_CLIENT.id ] = (data[i][ COL.RTT_AVG_CLIENT.id ] / val).toFixed(2);
            }
            return data;
        });
        
        //line chart on the top
        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var cols = [ COL.TIMESTAMP, 
                                {id: COL.RTT.id        , label: "Network Rountrip Time (NRT)" , type: "area-stack"},
                                {id: "DTT"             , label: "Data Transfer Time (DTT)"    , type: "area-stack"},
                                {id: "ART"             , label: "App Response Time (ART)"     , type: "area-stack"},
                                //label: "Data Rate" must be sync with axes: {"Data Rate": "y2"}
                                {id: COL.DATA_VOLUME.id, label: "Data Rate"                   , type: "line"}
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
                        }
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
                                {id: "ART"                 , label: "ART (ms)"         , align: "right"},
                                {id: "DTT"                 , label: "DTT (ms)"         , align: "right"},
                                {id: COL.RTT_AVG_SERVER.id , label: "Server DTT (ms)"  , align: "right"},
                                {id: COL.RTT_AVG_CLIENT.id , label: "Client DTT (ms)"  , align: "right"},
                                {id: COL.RTT.id            , label: "NRT (ms)"         , align: "right"},
                                {id: COL.ACTIVE_FLOWS.id   , label: "Transactions"     , align: "right"},
                                {id: COL.PACKET_COUNT.id   , label: "Packet Rate (pps)", align: "right"},
                                {id: COL.DATA_VOLUME.id    , label: "Data Rate (bps)"  , align: "right"}];
                    var data = db.data(); 
                    for( var i in data ){
                        var msg = data[i];
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
                    }
                    return {
                        data    : data,
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
