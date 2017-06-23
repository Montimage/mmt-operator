var arr = [
    {
        id: "realtime",
        title: "SLA/Vulnerability Scan Frequency",
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

//create reports

var ReportFactory = {
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    createNodeReport: function ( fPeriod ) {

        var _this    = this;
        var database = new MMTDrop.Database({collection: "misc", action: "find", query:[{$match:{0:1000}}], no_group: true});
        
        var cLine = MMTDrop.chartFactory.createScatter({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();

                    var zero_start = {}, zero_end ={} ;
                    zero_start[ COL.TIMESTAMP.id ] =  status_db.time.begin; 
                    zero_end  [ COL.TIMESTAMP.id ] =  status_db.time.end; 
                    data.push( zero_start );
                    data.push( zero_end );
                    var columns = [
                      {id: COL.TIMESTAMP.id},
                      {id: 4, label: "Vulnerability Scan Frequency"}
                    ]

                    var ret = {
                        data   : data,
                        columns: columns,
                        ylabel : "Period (s)",
                    };

                    return ret;
                },
            },
            chart: {
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

                point: {
                    r: function( d) { if( d.value === 0) return 0; return 5;} ,
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
                $("#" + _chart.elemID).getWidgetContentOfParent().css("margin-top", "15px");
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


        var report = new MMTDrop.Report(
            // title
            "",

            // database
            database,

            // filers
					[],

            //charts
					[
               {
                    charts: [cLine],
                    width: 12
                },
					 ],

            //order of data flux
          [{ object: cLine }]
        );
        return report;
    },
}
