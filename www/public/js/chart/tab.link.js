var arr = [
    {
        id: "realtime",
        title: "Traffic in Realtime",
        x: 0,
        y: 0,
        width: 6,
        height: 6,
        type: "success",
        userData: {
            fn: "createRealtimeTrafficReport"
        },
    },
    {
        id: "protocol",
        title: "Protocols",
        x: 6,
        y: 0,
        width: 6,
        height: 6,
        type: "info",
        userData: {
            fn: "createProtocolReport"
        },
    },
    {
        id: "node",
        title: "Nodes",
        x: 0,
        y: 7,
        width: 12,
        height: 5,
        type: "danger",
        userData: {
            fn: "createNodeReport"
        }
    }
];

var availableReports = {
    "createNodeReport":     "Nodes",
    "createProtocolReport": "Protocols",
    "createTrafficReport":  "Traffic"
}

var database = MMTDrop.databaseFactory.createStatDB();
var filters = [MMTDrop.filterFactory.createPeriodFilter(),
                MMTDrop.filterFactory.createProbeFilter()];


//create reports

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
            label   = "In";
            tmp     = "DL_" + tmp;
        } else {
            label   = "Out";
            tmp     = "UL_" + tmp;
        }
        return {
            id      : COL[tmp].id,
            label   : label,
            type    : "area"
        };
    },

    createProtocolReport: function (fProbe, database) {
        var self = this;
        var COL = MMTDrop.constants.StatsColumn;
        var fDir = MMTDrop.filterFactory.createDirectionFilter();
        var fMetric = MMTDrop.filterFactory.createMetricFilter();



        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var TIME        = COL.TIMESTAMP;
                    var col         = fMetric.selectedOption();
                    var dir         = fDir.selectedOption().id;
                    
                    var colToSum    = col;
                    if( dir != 0 )
                        colToSum = self.getCol(col, dir == 1);

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
                        var o    = obj[cls];
                        var name = MMTDrop.constants.getCategoryNameFromID(cls);
                        
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
                        
                        columns.push({
                            id   : cls,
                            label: name,
                            type : "area",
                            value: total
                        });
                    }

                    //flat data
                    var arr = [];
                    for (var o in data) {
                        var oo = data[o];
                        oo[TIME.id] = o;
                        arr.push(oo);
                    }

                    columns.sort( function( a, b){
                        return a.value < b.value;
                    } );
                    
                    return {
                        data   : arr,
                        columns: columns,
                        ylabel : col.label
                    };
                }
            },
            chart: {
                color: {
                    pattern: ['red', 'peru', 'orange', 'NavajoWhite', 'MediumPurple', 'purple', 'magenta', 'blue', 'MediumSpringGreen', 'green',]
                },
                legend: {
                    show: true
                },
                size: {
                    height: 200
                },
                axis: {
                    y: {
                        tick: {
                            count: 5
                        },
                        padding: {
                            top   : 10,
                            bottom: 0
                        }
                    }
                },
                grid: {
                    x: {
                        show: false
                    }
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
                $("<thead><tr><th></th><th width='50%'>Application</th><th>" + legend.label + "</th><th>Percent</th</tr>").appendTo($table);
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
                            "align": "right"
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
                            var id = $(this).data("id");
                            chart.toggle(id);
                            //$(this).css("background-color", chart.color(id) );
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
                }
                $("<tfoot>").append(
                    $("<tr>", {
                        "class": 'success'
                    }).append(
                        $("<td>", {
                            "align": "center",
                            "text": i
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
                    )).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom   : "t",
                    order : [[2, "desc"]]
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

        var COL = MMTDrop.constants.StatsColumn;

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();

                    var obj = {};
                    for (var i in data) {
                        var msg = data[i];
                        var mac = msg[COL.MAC_SRC.id];
                        if (obj[mac] == undefined) {
                            obj[mac] = {
                                "Probe ID"   : "",
                                "MAC Address": mac,
                                "In Frames"  : 0,
                                "Out Frames" : 0,
                                "In Bytes"   : 0,
                                "Out Bytes"  : 0,
                                "Total Bytes": 0,
                                "Start Time" : msg[COL.TIMESTAMP.id],
                                "Last Update Time": msg[COL.TIMESTAMP.id],
                            };
                        }
                        
                        obj[mac]["Probe ID"]         = msg[COL.PROBE_ID.id];
                        obj[mac]["In Frames"]       += msg[COL.DL_PACKET_COUNT.id];
                        obj[mac]["Out Frames"]      += msg[COL.UL_PACKET_COUNT.id];
                        obj[mac]["In Bytes"]        += msg[COL.DL_DATA_VOLUME.id];
                        obj[mac]["Out Bytes"]       += msg[COL.UL_DATA_VOLUME.id];
                        obj[mac]["Total Bytes"]     += msg[COL.DATA_VOLUME.id];
                        obj[mac]["Last Update Time"] = msg[COL.TIMESTAMP.id];
                    }

                    var columns = [ {id: "#", label: ""} ];
                    for (var i in obj) {
                        if (columns.length == 1){
                            for (var j in obj[i]){
                                var col = {
                                    id      : j,
                                    label   : j
                                };
                                
                                if( ["In Frames", "Out Frames", "In Bytes", "Out Bytes", "Total Bytes"].indexOf( j) >= 0 )
                                    col.align = "right";
                                columns.push( col );
                            }
                            break;
                        }
                    }
                    
                    var arr = MMTDrop.tools.object2Array( obj );
                    
                    arr.sort( function( a,b ){
                        return b["Total Bytes"] - a["Total Bytes"] ;
                    } );
                    
                    for( var i=0; i<arr.length; i++)
                        arr[i]["#"] = i+1;
                    
                    //Format data
                    for (var i in obj) {
                        //convert to time string    
                        obj[i]["Start Time"]        = (new Date(obj[i]["Start Time"])).toLocaleString();
                        obj[i]["Last Update Time"]  = (new Date(obj[i]["Last Update Time"])).toLocaleString();
                        obj[i]["In Frames"]       = MMTDrop.tools.formatLocaleNumber( obj[i]["In Frames"]);
                        obj[i]["Out Frames"]      = MMTDrop.tools.formatLocaleNumber( obj[i]["Out Frames"]);
                        obj[i]["In Bytes"]        = MMTDrop.tools.formatDataVolume( obj[i]["In Bytes"]);
                        obj[i]["Out Bytes"]       = MMTDrop.tools.formatDataVolume( obj[i]["Out Bytes"]);
                        obj[i]["Total Bytes"]     = MMTDrop.tools.formatDataVolume( obj[i]["Total Bytes"]);
                    }

                    
                    return {
                        data   : arr,
                        columns: columns
                    };
                }
            },
            chart: {
                "order": [[0, "asc"]],
                dom: "ft<'row'<'col-sm-3'l><'col-sm-9'p>>",
            }
        });

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cTable
            }]
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
        var _this   = this;
        var rep     = _this.createTrafficReport(fProbe, database, true);

        var COL     = MMTDrop.constants.StatsColumn;
        var cLine   = rep.groupCharts[0].charts[0];
        var fDir    = rep.filters[0];
        var fMetric = rep.filters[1];

        //add data to chart each second (rather than add immediatlly after receiving data)
        //this will avoid that two data are added very closely each

        var newData = {};
        var lastAddMoment = 0;

        var cols = [];

        var initData = function () {
            newData = {};

            var col = fMetric.selectedOption();
            var dir = fDir.selectedOption().id;

            if (dir == 0) {
                cols = [ _this.getCol(col, true) ];
                cols.push(_this.getCol(col, false));
                /*cols.push({
                    id: col.id,
                    label: "All"
                });*/
            } else
                cols = [_this.getCol(col, dir == 1)];
        }
        
        fDir.onFilter(initData);
        fMetric.onFilter(initData);

        var appendMsg = function (msg) {
            
            if (msg[COL.APP_ID.id] != 99)
                return;

            console.log( JSON.stringify(msg) );
            
            var chart = cLine.chart;
            if (chart == undefined)
                return;

            chart.zoom.enable(false);

            //the chart cLine in 

            var time = msg[COL.TIMESTAMP.id];
            for (var c in cols) {
                c = cols[c];
                var serieName = c.label;

                var val = msg[c.id];

                if (newData[serieName] === undefined)
                    newData[serieName] = 0;
                else
                    console.log( "plus: " + serieName ); 
                
                newData[serieName] += val;
            }

            //update to chart each x seconds
            if ( time - lastAddMoment > 0 * 1000 ) {
                //

                var date = new Date(time);
                var xs = chart.xs();

                var columns = [];
                //convert newData to columns format of C3js
                for (var s in newData) {
                    columns.push([s, newData[s]]); //y value
                    columns.push(["x-" + s, date]); //x value = time
                }

                //reset newData
                newData       = {};
                lastAddMoment = time;
                
                var length = 0;
                var data = chart.data.shown();

                if( data.length > 0 ){
                    var min  = data[0].values[0].x;

                    if( time - min > 1*60*1000)
                        length = 1;
                }
                
                try {
                    chart.flow({
                        columns: columns,
                        length : length 
                    });
                } catch (err) {}
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
                    var cols = [];


                    //dir = 1: incoming, -1 outgoing, 0: All
                    if (dir == 0) {
                        cols.push(_this.getCol(col, true));
                        cols.push(_this.getCol(col, false));
                        /*cols.push({
                            id: col.id,
                            label: "All"
                                //type : "line"
                        });*/
                    } else if (dir == 1)
                        cols.push(_this.getCol(col, true));
                    else
                        cols.push(_this.getCol(col, false));

                    var arr = {};
                    var ethernet = 99;
                    var data = db.data();
                    for (var i in data) {
                        var msg = data[i];
                        var proto = msg[COL.APP_ID.id];

                        if (proto != ethernet || msg[0] != 100)
                            continue;

                        var time = msg[ COL.TIMESTAMP.id ];
                        var exist = true;
        
                        //data for this timestamp does not exist before
                        if( arr[time] == undefined ){
                            exist = false;
                            arr[time] = {};
                            arr[time][ COL.TIMESTAMP.id ] = time;
                        }

                        
                        for (var j in cols) {
                            var id = cols[j].id;
                            if( exist )
                                arr[time][id] += msg[id];
                            else
                                arr[time][id] = msg[id];
                        }
                    }

                    cols.unshift( COL.TIMESTAMP );
                    return {
                        data: arr,
                        columns: cols,
                        ylabel: col.label
                    };
                }
            },

            chart: {
                color: {
                    pattern: ['orange', 'green', 'blue']
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
                        show: true
                    }
                },
                axis: {
                    y: {
                        tick: {
                            count: 5
                        },
                        padding: {
                            top   : 10,
                            bottom: 0
                        }
                    }
                },
            },

            afterRender: function (chart) {
                var $widget = $("#" + chart.elemID).parents().filter(".grid-stack-item");
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