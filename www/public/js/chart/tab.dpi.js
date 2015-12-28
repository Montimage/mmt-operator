var arr = [
    {
        id: "realtime",
        title: "Protocol Hierarchy",
        x: 0,
        y: 0,
        width: 12,
        height: 4,
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

var database = new MMTDrop.Database({
        format: MMTDrop.constants.CsvFormat.STATS_FORMAT
    },
    function (data) {
        //how data is processed for stat
        var COL = MMTDrop.constants.StatsColumn;
        var colsToSum = [COL.ACTIVE_FLOWS.id, COL.DATA_VOLUME.id,
                         COL.PAYLOAD_VOLUME.id, COL.PACKET_COUNT.id]

        var obj = MMTDrop.tools.sumByGroups(data,
            colsToSum, [COL.TIMESTAMP.id, COL.PROBE_ID.id,
						 COL.SOURCE_ID.id, COL.APP_PATH.id]);


        for (var time in obj)
            for (var probe in obj[time])
                for (var src in obj[time][probe]) {
                    data = obj[time][probe][src];

                    //STEP 1. 
                    var hasChildren = {};

                    var keys = Object.keys(data); //keys is a set of APP_PATH
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];

                        hasChildren[key] = false;

                        for (var j = 0; j < keys.length; j++) {
                            if (i == j)
                                continue;
                            if (keys[j].indexOf( key + ".") === 0 ) {
                                hasChildren[key] = true;
                                break;
                            }
                        }
                    }
                    
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[ i ];
                        //if this has child
                        if (hasChildren[key]) {
                            var msg = data[key];

                            //create a new child of msg
                            var child = MMTDrop.tools.cloneData(msg);

                            var path = key + '.-1'; //
                            //add new child to data
                            data[path] = child;
                            hasChildren[path] = false;

                            //the data of msg will be represented by it child
                            // ==> reset data of msg to zero
                            for (var k in colsToSum)
                                if (colsToSum[k] in msg)
                                    msg[colsToSum[k]] = 0;
                        }
                    }


                    //STEP 2. sumUp
                    keys = Object.keys(data); //keys is a set of APP_PATH
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (hasChildren[key] == true)
                            continue;

                        var msg = data[key];
                        var parentKey = MMTDrop.constants.getParentPath(key);
                        //sum up
                        while (parentKey != ".") {

                            var parentMsg = data[parentKey];

                            //if parent does not exist, create it and add it to data
                            if (parentMsg == undefined) {
                                parentMsg = MMTDrop.tools.cloneData(msg);
                                data[parentKey] = parentMsg;
                            }
                            //if parent exists, cummulate its child
                            else
                                for (var k in colsToSum) {
                                    var col = colsToSum[k];
                                    if (col in msg) {
                                        parentMsg[col] += msg[col];
                                    }
                                }

                            parentKey = MMTDrop.constants.getParentPath(parentKey);
                        }
                    }
                }


        data = [];
        for (var time in obj)
            for (var probe in obj[time])
                for (var src in obj[time][probe])
                    for (var path in obj[time][probe][src]) {
                        var msg = obj[time][probe][src][path];
                        msg[COL.FORMAT_ID.id] = MMTDrop.constants.CsvFormat.STATS_FORMAT;
                        msg[COL.PROBE_ID.id] = parseInt(probe);
                        msg[COL.SOURCE_ID.id] = src;
                        msg[COL.TIMESTAMP.id] = parseInt(time);
                        msg[COL.APP_PATH.id] = path;
                        msg[COL.APP_ID.id] = MMTDrop.constants.getAppIdFromPath(path);
                        //msg[ COL.APP_ID.id  ] = MMTDrop.constants.getProtocolNameFromID( MMTDrop.constants.getAppIdFromPath( path ) );
                        data.push(msg);
                    }

        return data;

    });
var filters = [fPeriod, fProbe];

MMTDrop.setOptions({
    format_payload: true
});

fPeriod.onChange(function () {});

//create reports

var ReportFactory = {
    createNodeReport: function (fProbe, database) {
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

                    var obj = MMTDrop.tools.sumByGroups(db.data(),
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
                }]);
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
                        o[MMTDrop.constants.StatsColumn.TIMESTAMP.id] = time;

                        var msg = data[time];
                        for (var path in msg) {
                            o[path] = msg[path][colToSum];
                            if (header.indexOf(path) == -1)
                                header.push(path);
                        }
                        arr.push(o);
                    }
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
                        ylabel: fMetric.selectedOption().label
                    };
                },
            },
            chart: {

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