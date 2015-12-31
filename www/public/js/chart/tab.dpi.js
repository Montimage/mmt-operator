var arr = [
    {
        id: "realtime",
        title: "Protocol Hierarchy",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createNodeReport"
        },
    }
];

var availableReports = {
    "createNodeReport": "Protocol Hierarchy",
}

var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
var fProbe = MMTDrop.filterFactory.createProbeFilter();

var database = MMTDrop.databaseFactory.createStatDB();
var filters = [fPeriod, fProbe];

MMTDrop.setOptions({
    format_payload: true
});

fPeriod.onChange(function () {});

//create reports

var ReportFactory = {
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    createNodeReport: function (fProbe, database) {
        var _this = this;
        var COL = MMTDrop.constants.StatsColumn;
        var cTree = MMTDrop.chartFactory.createTree({
            getData: {
                getDataFn: function (db) {
                    var args = [{
                        id: COL.PACKET_COUNT.id,
                        label: "Packets"
                    }];

                    if (fProbe.selectedOption().id != 0)
                        args.push({
                            id: COL.DATA_VOLUME.id,
                            label: "Data (B)"
                        });

                    var group =  {
                        id: MMTDrop.constants.StatsColumn.APP_PATH.id,
                        label: "Name"
                    };

                    var label = "";
                    if (args.length == 1)
                        label = args[0].label;

                    //id of columns tobe sumUp 
                    var cols = [];
                    for (var i in args)
                        cols.push(args[i].id);

                    var data = db.stat.sumDataByParent();
                    cTree.data = data;
                    var obj = MMTDrop.tools.sumByGroups( data,
                        cols, [group.id,
						 MMTDrop.constants.StatsColumn.PROBE_ID.id]);

                    //splite data by probes
                    //probes is an object each key is a probeId and value of key is msg containing this probeId
                    var probes = db.stat.getProbes();
                    var nProbe = probes.length;

                    var data = [];
                    for (var app in obj) {
                        var o = {};
                        o[group.id] = app;

                        var isZero = true;

                        for (var i in args) {
                            var oo = {};
                            var temp = 0;
                            for (var prob in obj[app]) {
                                temp = obj[app][prob][args[i].id];

                                if (!isNaN(temp) && parseInt(temp) != 0)
                                    isZero = false;
                                
                                if( args[i].id == COL.DATA_VOLUME.id)
                                    temp = MMTDrop.tools.formatDataVolume( temp );

                                oo[prob] = temp;
                            }
                            //asign to value if there is only one probe
                            if (nProbe == 1)
                                o[args[i].id] = temp;
                            else
                                o[args[i].id] = oo;
                        }

                        //only add the item o if there data number != 0
                        if (isZero == false)
                            data.push(o);
                    }
                    //columns to show. The first column is APP_PATH
                    var columns = [group];

                    for (var i in args) {
                        if (nProbe == 1)
                            columns.push(args[i]);
                        else {
                            columns.push({
                                id: args[i].id,
                                label: args[i].label,
                                probes: probes
                            });
                        }
                    }

                    return {
                        data: data,
                        columns: columns,
                        probes: probes,
                        ylabel: label
                    };

                }
            },
            click: function (e) {
                if (Array.isArray(e) == false)
                    return;

                var data = database.stat.filter([{
                    id: COL.APP_PATH.id,
                    data: e
                }], cTree.data);
                var oldData = database.data();

                //set new data for cLine
                database.data(data);
                cLine.attachTo(database);
                cLine.redraw();

                //reset
                database.data(oldData);
            },
            afterRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, _chart.chart, function (event, widget) {
                    var chart = $("table.treetable tbody");
                    var height = widget.find(".grid-stack-item-content").innerHeight();
                    height -= widget.find(".filter-bar").outerHeight(true) + 45;
                    chart.css({
                        "max-height": height,
                        "height": height
                    });
                });
                $widget.trigger("widget-resized", [$widget]);
            }
        });

        var cLine = MMTDrop.chartFactory.createTimeline({
            //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
            getData: {
                getDataFn: function (db) {
                    var colToSum = fMetric.selectedOption().id;
                    var colsToGroup = [MMTDrop.constants.StatsColumn.TIMESTAMP.id,
						                 MMTDrop.constants.StatsColumn.APP_PATH.id];

                    var data = db.data();
                    
                    data = MMTDrop.tools.sumByGroups(data, [colToSum], colsToGroup);

                    var arr = [];
                    var header = [];

                    for (var time in data) {
                        var o = {};
                        o[MMTDrop.constants.StatsColumn.TIMESTAMP.id] = parseInt( time );

                        var msg = data[time];
                        for (var path in msg) {
                            o[path] = msg[path][colToSum];
                            if (header.indexOf(path) == -1)
                                header.push(path);
                        }
                        arr.push(o);
                    }
                    
                    var time_id = 3;
                    var period_sampling = 1000 * fPeriod.getDistanceBetweenToSamples();
                    var period_total    = 1000 * fPeriod.getSamplePeriodTotal();
        
                    arr = MMTDrop.tools.addZeroPointsToData( arr, period_sampling, period_total, time_id );
                   
                    
                    var columns = [MMTDrop.constants.StatsColumn.TIMESTAMP];
                    for (var i = 0; i < header.length; i++) {
                        var path = header[i];
                        columns.push({
                            id: path,
                            label: MMTDrop.constants.getPathFriendlyName(path)
                        });
                    }
                    return {
                        data: arr,
                        columns: columns,
                        ylabel: fMetric.selectedOption().label + " (in total)"
                    };
                },
            },
            chart: {
                point: {
                    //show: false,
                    r: 0,
                    focus: {
                        expand: {
                            r: 5
                        }
                    }
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
                        },
                        padding: {
                            top: 10,
                            bottom: 0
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
            afterRender: function (_chart) {
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
                $widget.trigger("widget-resized", [$widget]);
            }
        });

        var fMetric = MMTDrop.filterFactory.createMetricFilter();

        //redraw cLine when changing fMetric
        fMetric.onFilter(function () {
            cLine.redraw();
        });

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cTree,
                effect: []
					}, ]
			}, ];

        var report = new MMTDrop.Report(
            // title
            "",

            // database
            database,

            // filers
					[fMetric],

            //charts
					[
                {
                    charts: [cTree],
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