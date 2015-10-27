/**
 * config:
 *  - elem:        DOM selector to render report
 * 	- channel:     where the report listens data to update its visualation
 *  - title:       title of report
 *  - chartType:   ['timeline', 'pie', 'bar', 'tree', 'table']
 *  - filterTypes: ['class', 'app', 'datatype']
 *  - metric: an array of elements ['stat', 'flow']
 *  		  or a column index, eg, MMTDrop.constants.StatsColumn.DATA_VOLUME
 *  	
 */


var ReportFactory = {
    getCol: function (col, isIn) {
        var COL = MMTDrop.constants.StatsColumn;
        var tmp = "PAYLOAD_VOLUME";
        if (col.id == COL.DATA_VOLUME.id)
            tmp = "DATA_VOLUME";
        else if (col.id == COL.PACKET_COUNT.id)
            tmp = "PACKET_COUNT";

        var label;
        if (isIn) {
            label = "In";
            tmp = "DL_" + tmp;
        } else {
            label = "Out";
            tmp = "UL_" + tmp;
        }
        return {
            id: COL[tmp].id,
            label: label,
            type: "area"
        };
    },

    createProtocolReport: function (fProbe, database) {
        var self = this;
        var COL = MMTDrop.constants.StatsColumn;
        var fDir = MMTDrop.filterFactory.createDirectionFilter(false);
        var fMetric = MMTDrop.filterFactory.createMetricFilter();



        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var TIME = COL.TIMESTAMP;
                    var col = fMetric.selectedOption();
                    var dir = fDir.selectedOption().id;
                    var colToSum = self.getCol(col, dir == 1);

                    var data = {};
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [TIME];

                    var obj = db.stat.splitDataByClass();

                    cLine.dataLegend = {
                        "dataTotal": 0,
                        "label": col.label,
                        "data": {}
                    };
                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = MMTDrop.constants.getCategoryNameFromID(cls);

                        columns.push({
                            id: cls,
                            label: name,
                            type: "area"
                        });

                        var total = 0;
                        //sumup by time
                        o = MMTDrop.tools.sumByGroup(o, colToSum.id, TIME.id);
                        for (var t in o) {
                            var v = o[t][colToSum.id];
                            if (data[t] == undefined)
                                data[t] = {};

                            data[t][cls] = v;

                            total += v;
                        }

                        cLine.dataLegend.data[name] = total;
                        cLine.dataLegend.dataTotal += total;
                    }

                    //flat data
                    var arr = [];
                    for (var o in data) {
                        var oo = data[o];
                        oo[TIME.id] = o;
                        arr.push(oo);
                    }

                    return {
                        data: arr,
                        columns: columns,
                        ylabel: col.label
                    };
                }
            },
            chart: {
                legend: {
                    show: false
                },
                size: {
                    height: 150
                }
            },
            //custom legend
            afterRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th width='50%'>Application</th><th>" + legend.label + "</th><th>Percent</t><th>Percent of bandwidth</t></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    i++;
                    var val = legend.data[key];
                    var $tr = $("<tr>");
                    $tr.appendTo($table);

                    $("<td>", {
                            "class": "item-" + key,
                            "data-id": key,
                            "style": "width: 30px; cursor: pointer",
                            "align": "right",
                            "text": i
                        })
                        .css({
                            "background-color": chart.color(key)
                        })
                        .on('mouseover', function () {
                            chart.focus($(this).data("id"));
                        })
                        .on('mouseout', function () {
                            chart.revert();
                        })
                        .on('click', function () {
                            chart.toggle($(this).data("id"));
                        })
                        .appendTo($tr);
                    $("<td>", {
                        "text": key
                    }).appendTo($tr);
                    $("<td>", {
                        "align": "right",
                        "text": val
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": Math.round(val * 10000 / legend.dataTotal) / 100 + "%"

                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": (100 * Math.round(val / legend.dataTotal)) + "%"

                    }).appendTo($tr);
                }
                $("<tfoot>").append(
                    $("<tr>", {
                        "class": 'success'
                    }).append(
                        $("<td>", {
                            "align": "right",
                            "text": i + 1
                        })
                    ).append(
                        $("<td>", {
                            "text": "Total"
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": legend.dataTotal
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": "100%"
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": "100%"
                        })
                    )).appendTo($table)

                $table.DataTable({
                    paging: false,
                    dom: "t"
                });
            }
        });

        //

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: fDir,
                effect: [{
                    object: fMetric,
                    effect: [{
                        object: cLine
                    }]
				}, ]
            }]
			}, ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fDir, fMetric],

            //charts
					[
                {
                    charts: [cLine],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },
    createNodeReport: function (fProbe, database) {

        var COL    = MMTDrop.constants.StatsColumn;

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var col  = COL.DATA_VOLUME.id;

                    var sorted = false; //do not sort by default

                    var label = col.label;
                    col = col.id;

                    var probes = db.stat.getProbes();
                    var noProbes = probes.length;

                    var obj = MMTDrop.tools.sumByGroups(db.data(), [col], [COL.APP_NAME.id, COL.PROBE_ID.id]);
                    var arr = [];
                    for (var time in obj) {
                        var oo = {};
                        oo[COL.APP_NAME.id] = time;
                        //console.log("TIME: " + time);
                        oo[col] = {};
                        for (var probe in obj[time])
                            if (noProbes == 1)
                                oo[col] = obj[time][probe][col];
                            else
                                oo[col][probe] = obj[time][probe][col];

                        arr.push(oo);
                    }

                    var columns = [COL.APP_NAME];
                    if (noProbes == 1)
                        columns.push({
                            id: col,
                            label: "Probe " + probes[0]
                        });
                    else
                        columns.push({
                            id: col,
                            label: "Probe",
                            probes: probes
                        });

                    return {
                        data: arr,
                        columns: columns,
                        ylabel: label,
                        probes: probes
                    };
                }
            }
        });

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cTable}]
        }];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[],

            // charts
					[
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

    createRealtimeTrafficReport: function (fProbe, database) {
        var _this = this;
        var rep = _this.createTrafficReport(fProbe, database, true);

        var COL = MMTDrop.constants.StatsColumn;
        var cLine = rep.groupCharts[0].charts[0];
        var fDir = rep.filters[0];
        var fMetric = rep.filters[1];

        //add data to chart each second (rather than add immediatlly after receiving data)
        //this will avoid that two data are added very closely each

        var newData = {};
        var lastAddMoment = 0;

        fDir.onFilter(function () {
            newData = {};
        });

        var appendMsg = function (msg) {
            if (msg[COL.APP_ID.id] != 99)
                return;
            //console.log( msg );
            var chart = cLine.chart;
            if (chart == undefined)
                return;

            //the chart cLine in 
            //- probeMode if it shows total data of each probe
            //- appMode   if it shows data of each app in a probe
            var probeId = fProbe.selectedOption().id;
            var isInProbeMode = probeId == 0;

            var col = fMetric.selectedOption();
            var dir = fDir.selectedOption().id;

            var cols = [];
            if (dir == 0) {
                cols.push(_this.getCol(col, true));
                cols.push(_this.getCol(col, false));
                cols.push({
                    id: col.id,
                    label: "All"
                });
            } else
                cols = [_this.getCol(col, dir == 1)];

            //receive msg of a probe different with the one beeing showing
            if (!isInProbeMode &&
                probeId != msg[COL.PROBE_ID.id]) {
                console.log(" donot concern");
                return;
            }


            var time = msg[COL.TIMESTAMP.id];
            for (var c in cols) {
                c = cols[c];
                var serieName = c.label;

                if (isInProbeMode)
                    serieName = "Probe-" + msg[COL.PROBE_ID.id];
                var val = msg[c.id];

                if (newData[serieName] === undefined)
                    newData[serieName] = 0;

                newData[serieName] += val;
            }

            //update to chart each x seconds
            if (time - lastAddMoment > 2 * 1000 && newData != {}) {
                //chart.zoom.enable( false );

                var date = new Date(time);
                var xs = chart.xs();

                var columns = [];
                //convert newData to columns format of C3js
                for (var s in newData) {
                    columns.push([s, newData[s]]); //y value
                    columns.push(["x-" + s, date]); //x value = time
                }

                //load new pair nameY: nameX

                chart.flow({
                    columns: columns
                });


                //reset newData
                newData = {};
                lastAddMoment = time;
            }
        };


        database.onMessage(function (msg) {
            if (msg[COL.FORMAT_ID.id] != MMTDrop.constants.CsvFormat.STATS_FORMAT)
                return;
            appendMsg(msg);
        });

        return rep;
    },

    createTrafficReport: function (fProbe, database) {
        var _this = this;
        var COL = MMTDrop.constants.StatsColumn;

        var fDir = MMTDrop.filterFactory.createDirectionFilter();
        var fMetric = MMTDrop.filterFactory.createMetricFilter();

        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var dir = fDir.selectedOption().id;
                    var col = fMetric.selectedOption();
                    var cols = [COL.TIMESTAMP];


                    //dir = 1: incoming, -1 outgoing, 0: All
                    if (dir == 0) {
                        cols.push(_this.getCol(col, true));
                        cols.push(_this.getCol(col, false));
                        cols.push({
                            id: col.id,
                            label: "All"
                                //type : "line"
                        });
                    } else if (dir == 1)
                        cols.push(_this.getCol(col, true));
                    else
                        cols.push(_this.getCol(col, false));

                    var arr = [];
                    var ethernet = 99;
                    var data = db.data();
                    for (var i in data) {
                        var msg = data[i];
                        var proto = msg[COL.APP_ID.id];

                        if (proto != ethernet || msg[0] != 99)
                            continue;

                        var o = {};
                        for (var j in cols) {
                            var id = cols[j].id;
                            o[id] = msg[id];
                        }
                        arr.push(o);
                    }

                    return {
                        data: arr,
                        columns: cols,
                        ylabel: col.label
                    };
                }
            },
            chart: {
                color: {
                    pattern: ['red', 'green', 'blue']
                },
                point: {
                    //show: false,
                    r: 0,
                    focus: {
                        expand: {
                            r: 5
                        }
                    }
                },
                grid: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false
                    }
                },
            },
            afterRender: function (chart) {
                var  $widget = $("#" + chart.elemID).parents().filter(".grid-stack-item");
                $widget.on("widget-resized", function (event, $widget) {
                    setTimeout(function () {
                        var height = $widget.find(".grid-stack-item-content").innerHeight();
                        height -= $widget.find(".filter-bar").outerHeight(true) + 20;
                        chart.chart.resize({
                            height: height
                        });

                    }, 500)
                });
                

                $widget.trigger("widget-resized", [$widget]);
            }
        });

        var dataFlow = [{
            object: fDir,
            effect: [{
                object: fProbe,
                effect: [{
                    object: fMetric,
                    effect: [{
                        object: cLine
                    }]
								}]
					}]
        }];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fDir, fMetric],

            // charts
					[
                {
                    charts: [cLine],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );
        return report;
    }
}