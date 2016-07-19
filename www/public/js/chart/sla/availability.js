var arr = [
    {
        id: "realtime",
        title: "SLA/Availability",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createNodeReport"
        },
    },
];

var availableReports = {
}



MMTDrop.setOptions({
    format_payload: true
});


//create reports

var ReportFactory = {
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    createNodeReport: function ( fPeriod ) {
        var _this    = this;
        var COL      = MMTDrop.constants.StatsColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        var database = new MMTDrop.Database({collection : "availability", action: "find"}, function( data ){
          //add a new column for "not-availability"
          for( var i in data ){
            var msg = data[i];
            if( msg[4] == 0 ){
              msg.push( 1 );//5: not availability
            }else {
              msg.push( 0 );//5: not availability
            }
          }

          //add zero points for the timestamp that have no data
          var start_time = status_db.time.begin,
              end_time   = status_db.time.end,
              period_sampling = fPeriod.getDistanceBetweenToSamples() * 1000,
              time_id = 3;
          //sort data ascending by time
          data.sort( function( a, b ){
            return a[ time_id ] - b[ time_id ];
          } )

          //check whenever probe runing at the moment ts
          var inActivePeriod = function( ts ){
              for( var t in status_db.probeStatus )
                  if( status_db.probeStatus[t].start <= ts && ts <= status_db.probeStatus[t].last_update )
                      return true;
              return false;
          }

          var createZeroPoint = function( ts ){
              var zero = [0,0,0,ts,0,0];


              var default_value = null;

              if( inActivePeriod( ts ) )
                  default_value = 0;

              zero[4] = default_value;
              zero[5] = default_value;
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


        var cLine = MMTDrop.chartFactory.createTimeline({
            //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
            getData: {
                getDataFn: function (db) {
                    var data = db.data();

                    var columns = [
                      COL.TIMESTAMP,
                      {id: 4, label: "Available"},
                      {id: 5, label: "Not Available"}
                    ]

                    var ret = {
                        data   : data,
                        columns: columns,
                        ylabel : "Availability",
                    };

                    return ret;
                },
            },
            chart: {
                data:{
                    type: "area-step"
                },
                axis: {
                    x: {
                        tick: {
                            format: _this.formatTime
                        }
                    },
                    y: {
                      tick: {
                        count: 5
                      }
                    }
                },
                grid: {
                    x: {
                        show: false
                    }
                },
                tooltip:{
                    format: {
                        title:  _this.formatTime
                    }
                },
            },
            afterEachRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, _chart.chart, function (event, widget) {
                    var chart = event.data;
                    var height = $widget.find(".grid-stack-item-content").innerHeight();
                    height -= $widget.find(".filter-bar").outerHeight(true) + 15;
                    chart.resize({
                        height: height
                    });
                });
                $widget.trigger("widget-resized");
            }
        });


        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var obj= [
                      ["Available"    , 0],
                      ["Not available", 0]
                    ];

                    for( var i in data ){
                      var msg = data[i];
                      obj[0][1] += msg[ 4 ];
                      obj[1][1] += msg[ 5 ];
                    }

                    var columns = [
                      {id: "0"}, //label
                      {id: "1"}, //data
                    ]
                    console.log( obj );
                    return {
                        data   : obj,
                        columns: columns,
                        ylabel : "Availability",
                    };
                },
            },
        });

        var dataFlow = [{
                object: fProbe,
                effect: [{
                    object: cPie
                            },{
                    object: cLine
                            }, ]
                            }];

        var report = new MMTDrop.Report(
            // title
            "",

            // database
            database,

            // filers
					[fProbe],

            //charts
					[
            {
                charts: [cPie],
                width: 4
            },
                {
                    charts: [cLine],
                    width: 8
                },
					 ],

            //order of data flux
            dataFlow
        );
        return report;
    },
}
