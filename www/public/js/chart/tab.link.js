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
        type: "warning",
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

var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
var fProbe  = MMTDrop.filterFactory.createProbeFilter();

var database = MMTDrop.databaseFactory.createStatDB();
var filters = [ fPeriod, fProbe];



fPeriod.onChange( loading.onShowing );


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
    
    //add zero to the period having no data 
    addZeroPoints : function( data, period, time_id ){
        if( data instanceof Array == false )
            data = MMTDrop.tools.object2Array( data );
        
        data.sort( function( a, b){
            return b[ time_id ] - a[time_id]
        } )
        
        var len   = data.length;
        var arr   = [];
        var lastTS ;
        period = period * 1000;
        for( var i=0; i<len; i++ ){
            var ts = data[i][ time_id ];
            if( lastTS === undefined )
                lastTS = ts;
            if( ts - lastTS >   period * 2.5){

                var zero = {};
                zero[ time_id ] = lastTS + period ;
                arr.push( zero );


                zero = {};
                zero[ time_id ] = ts - period;
                arr.push( zero );
            }
            
            lastTS = ts;
            arr.push( data[i] );
        }
        return arr;           
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
                    var columns = [];

                    var period = fPeriod.getSamplePeriod();
                    
                    var obj = db.stat.splitDataByApp();

                    cLine.dataLegend = {
                        "dataTotal": 0,
                        "label": col.label,
                        "data": {}
                    };
                    
                    for (var cls in obj) {
                        var o    = obj[cls];
                        var name = MMTDrop.constants.getProtocolNameFromID(cls);
                        
                        var total = 0;
                        //sumup by time
                        o = MMTDrop.tools.sumByGroup(o, colToSum.id, TIME.id);
                        for (var t in o) {
                            var v = o[t][colToSum.id] / period;
                            if (data[t] == undefined){
                                data[t] = {};
                            }
                            data[t][cls] = v;

                            total += v;
                        }

                        cLine.dataLegend.data[name] = total;
                        cLine.dataLegend.dataTotal += total;
                        
                        columns.push({
                            id   : cls,
                            label: name,
                            type : "area-stack",
                            value: total
                        });
                    }


                    
                    columns.sort( function( a, b){
                        return b.value - a.value;
                    } );
                    
                    
                    var top = 3;
                    if( columns.length > top && cLine.showAll !== true){
                        var val = 0;
                        for( var i=top; i<columns.length; i++)
                            val += columns[i].value;
                        
                        
                        columns.splice( top, columns.length - top);
                        
                        //update data
                        for (var i in data ){
                            var msg = data[i];
                            var v = 0;
                            for( var j in columns )
                                if( msg[ columns[j].id ] )
                                    v += msg[ columns[j].id ];
                            var v2 = 0;
                            for( var j in msg )
                                v2 += msg[j];
                            
                            msg["other"] = v2 - v;
                        }
                                
                                
                        columns.push( {
                            id   : "other",
                            label: "Other",
                            value: val,
                            type : "area-stack"
                        });
                        
                        columns.sort( function( a, b){
                            return a.value < b.value;
                        } );
                        
                        //reset dataLegend
                        cLine.dataLegend.data = {};
                        for (var i = 0; i <= top; i++) {
                            var o = columns[i];
                            cLine.dataLegend.data[o.label] = o.value;
                        }
                    }
                        
                        
                    for( var i in columns )    
                        if( columns[i].value === 0){
                            columns.splice( i, columns.length - i );
                            break;
                        }
                    //the first column is timestamp
                    columns.unshift( TIME );
                    
                    
                    for( var t in data )
                        data[t][ TIME.id ] = parseInt(t);
                    
                    
                    var arr = self.addZeroPoints( data );
                    
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
                    show: false 
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
                    if (key == "Other")
                        continue;
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
                        "text" :  MMTDrop.tools.formatDataVolume( val )
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": Math.round(val * 10000 / legend.dataTotal) / 100 + "%"

                    }).appendTo($tr);
                }
                //footer of table
                var $tfoot = $("<tfoot>");

                if (legend.data["Other"] != undefined) {
                    i++;
                    $tr = $("<tr>");
                    var key = "Other";
                    var val = legend.data[key];

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

                    var $a = $("<a>", {
                        href: "?show all protocols",
                        title: "click to show all protocols",
                        text: "Other",
                        
                    });
                    $a.on("click", function(){
                       _chart.showAll = true;
                       _chart.redraw(); 
                        return false;
                    });
                    
                    $("<td>").append( $a ).appendTo($tr);

                    
                    $("<td>", {
                        "align": "right",
                        "html":  MMTDrop.tools.formatDataVolume( val )
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": Math.round(val * 10000 / legend.dataTotal) / 100 + "%"

                    }).appendTo($tr);

                    $tfoot.append($tr).appendTo($table);
                }
                
                $tfoot.append(
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
                            "text": MMTDrop.tools.formatDataVolume( legend.dataTotal )
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
                    order : [[3, "desc"]]
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
                                "Start Time" : msg[COL.START_TIME.id],
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
                                else
                                    col.align = "left";
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
                dom: "f<'dataTables_scrollBody overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterRender: function (_chart) {
                var table = _chart.chart;
                table.DataTable().columns.adjust();
                
                table.on("draw.dt", function () {
                    var $div = $('.dataTables_scrollBody');
                    var h = $div.parents().filter(".grid-stack-item-content").height() - 110;
                    $div.css('height', h);
                    $div.css('margin-top', 10);
                    $div.css('margin-bottom', 10);
                    $div.children().filter("table").css( "border-top", "thin solid #ddd" );
                });
                table.trigger("draw.dt");
                //resize when changing window size
                $(window).resize(function () {
                    if (table)
                        table.api().draw(false);
                });
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

        var appendMsg = function ( data ) {
            if( data == undefined || data.length == 0 )
                return;
            
            var chart = cLine.chart;
            if (chart == undefined)
                return;
            chart.zoom.enable(false);

            var maxOx = 0;
            var minOx = 0; 
            
            var chart_data = chart.data.shown();
            if( chart_data ){
                chart_data = chart_data[0];
                if( chart_data ){
                    chart_data = chart_data.values;
                    if( chart_data ){
                        var maxOx = chart_data[ chart_data.length - 1 ].x.getTime();
                        var minOx = chart_data[0].x.getTime();
                    }
                }
            }
            
            var numberofdrop = 0;
            for( var i in data ){
                var msg = data[i];
                if (msg[COL.FORMAT_ID.id] != MMTDrop.constants.CsvFormat.STATS_FORMAT )
                    continue;

                var time = msg[COL.TIMESTAMP.id];
                
                if( time < maxOx ){
                    numberofdrop ++;
                    continue;
                }
                
                for (var c in cols) {
                    c = cols[c];
                    var serieName = c.label;
                    var val       = msg[c.id];

                    if (newData[time] === undefined)
                        newData[time] = {};
                    if (newData[time][serieName] === undefined )
                        newData[time][serieName] = 0;

                    newData[time][serieName] += val;
                }
            }
            
            console.log( "---> drop " + numberofdrop + " records that are older than " + (new Date(maxOx)).toLocaleTimeString() );
            
            var localtime = (new Date()).getTime();
            
            //update to chart each x seconds
            if ( localtime - lastAddMoment > 1000 && !$.isEmptyObject( newData ) ) {
                //
                var obj = {};
                //convert newData to columns format of C3js
                var length = 0;
                //for each time step
                for (var t in newData) {
                    length ++;
                    var o = newData[t];
                    var time = new Date( parseInt( t ) );
                    
                    //for each category (In/Out)
                    for( var s in o ){
                        //init for the first element of each array
                        if( length === 1 ){
                            obj["x-" + s] = [ "x-" + s];    //Ox
                            obj[   s    ] = [ s ];          //Oy
                        }
                        
                        var val = o[s] / MMTDrop.config.probe_stats_period;
                        val = Math.round( val );
                        
                        obj["x-" + s].push( time );    //Ox
                        obj[    s   ].push( val );     //Oy
                    }
                }

                //reset newData
                newData       = {};
                lastAddMoment = localtime;
                

                if( maxOx - minOx < 5*60*1000){
                    length = 0;
                }
                
                var columns = MMTDrop.tools.object2Array( obj );
                try {
                    chart.flow({
                        columns: columns,
                        length : length 
                    });
                } catch (err) {
                    console.error( err.stack );
                }
            }
        };


        database.onMessage( "protocol.flow.stat", appendMsg );

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


                    var period = fPeriod.getSamplePeriod();
                    
                    //dir = 1: incoming, -1 outgoing, 0: All
                    if (dir == 0) {
                        cols.push(_this.getCol(col, true));    //in
                        cols.push(_this.getCol(col, false));   //out
                        /*cols.push({
                            id: col.id,
                            label: "All"
                                //type : "line"
                        });*/
                    } else if (dir == 1)
                        cols.push(_this.getCol(col, true));
                    else
                        cols.push(_this.getCol(col, false));

                    var obj = {};
                    var data = db.data();
                    for (var i in data) {
                        var msg = data[i];
                        var proto = msg[COL.APP_ID.id];

                        if ( msg[0] != 100)
                            continue;

                        var time = msg[ COL.TIMESTAMP.id ];
                        var exist = true;
        
                        //data for this timestamp does not exist before
                        if( obj[time] == undefined ){
                            exist = false;
                            obj[time] = {};
                            obj[time][ COL.TIMESTAMP.id ] = time;
                        }

                        
                        for (var j in cols) {
                            var id = cols[j].id;
                            if( exist )
                                obj[time][id] += msg[id] / period;
                            else
                                obj[time][id] = msg[id] / period;
                        }
                    }

                    var arr = _this.addZeroPoints( obj );
                    
                    cols.unshift( COL.TIMESTAMP );
                    return {
                        data   : arr,
                        columns: cols,
                        ylabel : col.label
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
    },
}