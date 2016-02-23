var arr = [
    {
        id: "realtime",
        title: "Traffic",
        x: 0,
        y: 0,
        width: 12,
        height: 4,
        type: "success",
        userData: {
            fn: "createRealtimeTrafficReport"
        },
    },
    {
        id: "protocol",
        title: "Protocols",
        x: 0,
        y: 4,
        width: 12,
        height: 5,
        type: "info",
        userData: {
            fn: "createProtocolReport"
        },
    },
    {
        id: "node",
        title: "Nodes",
        x: 0,
        y: 9,
        width: 12,
        height: 6,
        type: "warning",
        locked: true,
        userData: {
            fn: "createNodeReport"
        }
    }
];

var availableReports = {
    //"createNodeReport"    : "Nodes",
    "createProtocolReport": "Protocols ",
    "createTrafficReport" : "Traffic"
}



function inDetailMode() {
    return (fPeriod.selectedOption().id === MMTDrop.constants.period.MINUTE);
}

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
            label = "In";
            tmp = "DL_" + tmp;
        } else {
            label = "Out";
            tmp = "UL_" + tmp;
        }
        return {
            id: COL[tmp].id,
            label: label,
            //type: "area"
        };
    },

    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    
    //add zero to the period having no data 
    addZeroPoints: function (data, start_time, end_time) {
        var time_id = 3;
        var period_sampling = 1000 * fPeriod.getDistanceBetweenToSamples();
        return MMTDrop.tools.addZeroPointsToData( data, period_sampling, time_id, start_time, end_time );
    },

    createProtocolReport: function (fPeriod) {
        var _this    = this;
        var self     = this;
        var COL      = MMTDrop.constants.StatsColumn;
        var database = MMTDrop.databaseFactory.createStatDB({id: "link.protocol", userData : {getProbeStatus: true} });
        var fMetric  = MMTDrop.filterFactory.createMetricFilter();
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        
        var setName = function (name) {
            name = MMTDrop.constants.getPathFriendlyName( name );
            name = name.replace("ETHERNET", "ETH");
            return name;
        }

        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var TIME = COL.TIMESTAMP;
                    var col = fMetric.selectedOption();

                    var colToSum = col;

                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var period = fPeriod.getDistanceBetweenToSamples();

                    var ylabel = col.label;
                    var unit   = "";

                    if (col.id === COL.PACKET_COUNT.id) {
                        period = 1; //donot change the total number
                        ylabel += " (total)";
                        unit   = "Packet Count";
                    } else if (col.id === COL.ACTIVE_FLOWS.id) {
                        ylabel += " (per second)";
                        unit   = "Flow Count";
                    } else {
                        period /= 8; //  bit/second
                        ylabel += " (bit/second)";
                        if( col.id === COL.DATA_VOLUME.id )
                            unit = "Data (Byte)";
                        else
                            unit = "Payload (Byte)";
                    }

                    var data = db.data(); //db.stat.sumDataByParent( );
                    var obj = MMTDrop.tools.splitData( data, COL.APP_PATH.id );

                    cLine.dataLegend = {
                        "dataTotal": 0,
                        "label"    : unit,
                        "data"     : {}
                    };
                    //ETHERNET
                    var o = MMTDrop.tools.sumUp (obj["99"], colToSum.id);
                    
                    if( o && o[ colToSum.id ])
                        cLine.dataLegend.dataTotal = o[ colToSum.id ];
                    else
                        cLine.dataLegend.dataTotal = 0;
                    
                    //filter key
                    for (var cls in obj) {
                        //remove all keys having level > 4, ETHENET.IP.TCP.HTTP.GOOGLE
                        var count = 0;
                        for( var i=0; i<cls.length; i++)
                            if( cls[ i ] === '.') count ++;
                        if( count >= 4 || count === 0 ){
                            delete obj[ cls ];
                            continue;
                        }
                        
                        //delete all parent of the current path "cls"
                        for( var i=0; i<cls.length; i++)
                            if( cls[ i ] === '.'){
                                var parent = cls.substr(0, i);
                                if( obj[ parent ])
                                    delete obj[ parent ];
                            }
                        //delete all applications (retain only protocols)
                        //var app = MMTDrop.constants.getAppIdFromPath( cls );
                        //if( MMTDrop.constants.PureProtocol.indexOf( app ) == -1 )
                        //    delete obj[ cls ];
                    }
                    
                    //get total data of each app path
                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = setName( cls );
                        var total = 0;
                    
                        //sumup by time
                        o = MMTDrop.tools.sumUp(o, colToSum.id);
                        total = o[ colToSum.id ]
                        
                        columns.push({
                            id: cls,
                            label: name,
                            type: "area-step-stack",
                            value: total
                        });
                    }



                    columns.sort(function (a, b) {
                        return b.value - a.value;
                    });


                    //retain only the top
                    var top = 7;
                    if (columns.length > top) {

                        columns.splice(top, columns.length - top);
                        
                        //other
                        var val = 0;
                        for (var i = 0; i < columns.length; i++)
                            val += columns[i].value;

                        cLine.dataLegend.data[ "Other" ] = cLine.dataLegend.dataTotal - val;
                    }else{
                        //other
                        var val = 0;
                        for (var i = 0; i < columns.length; i++)
                            val += columns[i].value;

                        if( val < cLine.dataLegend.dataTotal )
                             cLine.dataLegend.data[ "Other" ] = cLine.dataLegend.dataTotal - val;
                    }
                    
                    //update legend
                    for( var i in columns )
                        cLine.dataLegend.data[ columns[i].label ] = columns[i].value;
                    
                    
                    data = {};
                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = setName( cls );
                        
                        if( cLine.dataLegend.data[ name ] === undefined )
                            //cls = "other";
                            continue;
                        
                        //sumup by time
                        o = MMTDrop.tools.sumByGroup(o, colToSum.id, TIME.id);
                        for (var t in o) {
                            if (data[t] == undefined) {
                                data[t] = {};
                            }
                            if( data[t][cls] === undefined )
                                data[t][cls] = 0;
                            data[t][cls] += o[t][colToSum.id];
                        }
                    }
                    //divide to get the bandwidth
                    for( var t in data ){
                        var o = data[t];
                        for( var cls in o)
                            o[cls] /= period;
                    }

                    //short to draw the biggest data on top
                    columns.sort(function (a, b) {
                        return a.value < b.value;
                    });
                    
                    //the first column is timestamp
                    columns.unshift(TIME);



                    for (var t in data)
                        data[t][TIME.id] = parseInt(t);


                    //var arr = self.addZeroPoints(data, db.time.begin, db.time.end);

                    var $widget = $("#" + cLine.elemID).getWidgetParent();
                    var height = $widget.find(".grid-stack-item-content").innerHeight();
                        height -= $widget.find(".filter-bar").outerHeight(true) + 15;
                    
                    return {
                        data   : data,
                        columns: columns,
                        ylabel : ylabel,
                        height : height,
                        addZeroPoints:{
                            time_id       : 3,
                            time          : db.time,
                            sample_period : 1000 * fPeriod.getDistanceBetweenToSamples(),
                            probeStatus   : db.probeStatus
                        },
                    };
                }
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
                color: {
                    pattern: ['red', 'peru', 'orange', 'NavajoWhite', 'MediumPurple', 'purple', 'magenta', 'blue', 'MediumSpringGreen', 'green', ]
                },
                legend: {
                    show: false
                },
                axis: {
                    x: {
                        tick: {
                            format: _this.formatTime
                        }
                    },
                },
                grid: {
                    x: {
                        show: false
                    }
                },
                zoom: {
                    enabled: false,
                    rescale: false
                },
                tooltip:{
                    format: {
                        title:  _this.formatTime
                    }
                },
            },
	                //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;
                
                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed"
                });

                $("<thead><tr><th></th><th width='50%'>Protocol</th><th>" + legend.label + "</th><th>Percent</th</tr>").appendTo($table);
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
                        "text": MMTDrop.tools.formatDataVolume(val)
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": (val * 100 / legend.dataTotal).toFixed(2) + "%"

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
                        //.css({
                        //    "background-color": chart.color(key)
                        //})
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

                    $("<td>Other</td>") .appendTo($tr);


                    $("<td>", {
                        "align": "right",
                        "html": MMTDrop.tools.formatDataVolume(val)
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": (val * 100 / legend.dataTotal).toFixed(2) + "%"

                    }).appendTo($tr);

                    $tfoot.append($tr).appendTo($table);
                }

                $tfoot.append(
                    $("<tr>", {
                        "class": 'success'
                    }).append(
                        $("<td>")
                    ).append(
                        $("<td>", {
                            "text": "Total"
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": MMTDrop.tools.formatDataVolume(legend.dataTotal)
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": "100%"
                        })
                    )).appendTo($table);
                
                
                var legendId = _chart.elemID + "-legend";
                
                $("#"+ legendId).remove();
                $("#" + _chart.elemID).parent().parent().parent().append(
                    $('<div class="col-md-4 overflow-auto-xy" id="' + legendId + '"/>')
                );
                $table.appendTo($("#" + legendId));
                
                
                var table = $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]]
                });

                table.DataTable().columns.adjust();
            },
	    click: function(){
	    console.log("click");
	    },
            afterRender: function( _chart ){
                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, {
                    chart: _chart
                }, function (event, widget) {
                    var height = widget.find(".grid-stack-item-content").innerHeight();
                    height -= widget.find(".filter-bar").outerHeight(true) + 15;
                    console.log( "resize protocol chhart " + height );
                    event.data.chart.chart.resize({
                        height: height
                    });
                });
            }
        });

        //

        var dataFlow = [{
                object: fProbe,
                effect: [{
                    object: fMetric,
                    effect: [{
                        object: cLine
                    }]
				}, ]
			}, ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fProbe, fMetric],

            //charts
					[
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
    createNodeReport: function (fProbe) {
        var DETAIL = {};//data detail of each MAC
        var COL = MMTDrop.constants.StatsColumn;
        var database = MMTDrop.databaseFactory.createStatDB({id: "link.nodes"});
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var lastMinute  = db.time.end -   60*1000;
                    var last5Minute = db.time.end - 5*60*1000;

                    var obj = {};
                    for (var i in data) {
                        var msg = data[i];
                        
                        var time = msg[COL.TIMESTAMP.id];
                        
                        var mac  = msg[COL.MAC_SRC.id];
                        
                        if (obj[mac] == undefined) {
                            obj[mac] = {
                                "Probe ID"          : msg[COL.PROBE_ID.id],
                                "MAC Address"       : mac,
                                "In Frames"         : 0,
                                "Out Frames"        : 0,
                                "In Bytes"          : 0,
                                "Out Bytes"         : 0,
                                "Total Bytes"       : 0,
                                "StartTime"         : msg[COL.START_TIME.id],
                                "LastTime"          : time,
                            };
                        }
                        if( obj[mac]["LastTime"] < time )
                            obj[mac]["LastTime"] = time;
                        
                        if( obj[mac]["StartTime"] == undefined )
                            obj[mac]["StartTime"] = time;
                            
                        if( obj[mac]["StartTime"] > time )
                            obj[mac]["StartTime"] = time;
                        
                        if( time < lastMinute )
                            continue;
                        
                        /*
                        if( DETAIL[ mac ] == undefined )
                            DETAIL[ mac ] = [];
                        DETAIL[ mac ].push( msg );
                        */
                        
                        //calculate only data from the last minute
                        obj[mac]["In Frames"]       += msg[COL.DL_PACKET_COUNT.id];
                        obj[mac]["Out Frames"]      += msg[COL.UL_PACKET_COUNT.id];
                        obj[mac]["In Bytes"]        += msg[COL.DL_DATA_VOLUME.id];
                        obj[mac]["Out Bytes"]       += msg[COL.UL_DATA_VOLUME.id];
                        obj[mac]["Total Bytes"]     += msg[COL.DATA_VOLUME.id];
                    }

                    var arr = [];
                    //retain only the machines updating in the last 5 minutes
                    for( var i in obj ){
                        if( obj[i]["LastTime"] >= last5Minute )
                            arr.push( obj[i] );
                    }
                    
                    arr.sort(function (a, b) {
                        return b["Total Bytes"] - a["Total Bytes"];
                    });

                    for (var i = 0; i < arr.length; i++)
                        arr[i]["#"] = i + 1;

                    //Format data
                    for (var i in obj) {
                        //convert to time string    
                        obj[i]["StartTime"]   = moment(obj[i]["StartTime"]).format( "YYYY/MM/DD HH:mm:ss" );
                        obj[i]["LastTime"]    = moment(obj[i]["LastTime"]).format( "MM/DD HH:mm:ss" );
                        obj[i]["In Frames"]   = MMTDrop.tools.formatLocaleNumber(obj[i]["In Frames"]);
                        obj[i]["Out Frames"]  = MMTDrop.tools.formatLocaleNumber(obj[i]["Out Frames"]);
                        obj[i]["In Bytes"]    = MMTDrop.tools.formatDataVolume(obj[i]["In Bytes"]);
                        obj[i]["Out Bytes"]   = MMTDrop.tools.formatDataVolume(obj[i]["Out Bytes"]);
                        obj[i]["Total Bytes"] = MMTDrop.tools.formatDataVolume(obj[i]["Total Bytes"]);
                    }

                     var columns = [{id: "#"            , label: ""               , align:"right"},
                                  {id:"Probe ID"        , label:"Probe ID"        , align:"right"},
                                  {id:"MAC Address"     , label:"MAC Address"     , align:"right"},
                                  {id:"In Frames"       , label:"In Frames"       , align:"right"},
                                  {id:"Out Frames"      , label:"Out Frames"      , align:"right"},
                                  {id:"In Bytes"        , label:"In Bytes"        , align:"right"},
                                  {id:"Out Bytes"       , label:"Out Bytes"       , align:"right"},
                                  {id:"Total Bytes"     , label:"Total Bytes"     , align:"right"},
                                  {id:"StartTime"       , label:"Start Time"      , align:"right"},
                                  {id:"LastTime", label:"Last Update Time", align:"right"},];
                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                "order": [[0, "asc"]],
                dom: "f<'dataTables_scrollBody overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterEachRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();

                var table = _chart.chart;
                if( table === undefined ) return;
                
                table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                    var $div = $('.dataTables_scrollBody');
                    var h = $div.getWidgetContentOfParent().height() - 110;
                    $div.css('height', h);
                    $div.css('margin-top', 10);
                    $div.css('margin-bottom', 10);
                    $div.children().filter("table").css("border-top", "thin solid #ddd");
                });
                table.trigger("draw.dt");

                //resize when changing window size
                $widget.on("widget-resized", null, table, function (event, widget) {
                    if (event.data){
                        event.data.api().draw(false);
                    }
                });
                $widget.trigger("widget-resized", [$widget]);
                
                //add a separator
                $widget.css({"margin-top": "20px"});
                $widget.before('<div style="margin: 0; height: '
                               + ($widget.outerHeight(true) + 30) +'px; background-color: white; left: -10px; right:-10px; position: absolute; top:'
                               + ($widget.position().top ) +'px;">&nbsp;</div>')
            }
        });

        var dataFlow = [{
                object: cTable
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

    createRealtimeTrafficReport: function (fProbe) {
        var _this = this;
        var database = MMTDrop.databaseFactory.createStatDB({id:"link.traffic", userData:{getProbeStatus: true}});
        var rep = _this.createTrafficReport(fProbe, database, true);

        var COL = MMTDrop.constants.StatsColumn;
        var cLine = rep.groupCharts[0].charts[0];
        var fMetric = rep.filters[0];

        //add data to chart each second (rather than add immediatlly after receiving data)
        //this will avoid that two data are added very closely each

        var newData = {};
        var lastAddMoment = 0;
        var lengthOx = 0;
        var max_time = 0;
        var cols = [];
        var zeroPoint = {};

        var selectedMetricId = null;
        var initData = function () {
            newData = {};

            var col = fMetric.selectedOption();

            selectedMetricId = col.id;

            if (col.id !== COL.ACTIVE_FLOWS.id) {
                cols = [_this.getCol(col, true)];
                cols.push(_this.getCol(col, false));
                /*cols.push({
                    id: col.id,
                    label: "All"
                });*/
            } else
                cols = [col];

            for (var c in cols) {
                var serieName = cols[c].label;
                zeroPoint[serieName] = 0;
            }
        }


        fProbe.onFilter(initData);
        fMetric.onFilter(initData);

        var samplePeriod = fPeriod.getDistanceBetweenToSamples();

        var appendMsg = function (data) {
            if (data == undefined || data.length == 0)
                return;

            var chart = cLine.chart;
            if (chart == undefined)
                return;

            if (max_time === 0) {
                var chart_data = chart.data.shown();
                if (chart_data) {
                    chart_data = chart_data[0];
                    if (chart_data) {
                        chart_data = chart_data.values;
                        if (chart_data) {
                            lengthOx = chart_data.length;
                            max_time = chart_data[chart_data.length - 1].x.getTime();
                        }
                    }
                }
            }

            var numberofdrop = 0;

            for (var i in data) {
                var msg = data[i];
                if (msg[COL.FORMAT_ID.id] != MMTDrop.constants.CsvFormat.STATS_FORMAT)
                    continue;

                var time = parseInt(msg[COL.TIMESTAMP.id]);

                if (max_time === 0)
                    max_time = time - 5 * 60 * 1000; //last 5 minute

                if (time < max_time) {
                    numberofdrop++;
                    continue;
                }

                for (var c in cols) {
                    c = cols[c];
                    var serieName = c.label;
                    var val = msg[c.id];

                    if (newData[time] === undefined)
                        newData[time] = {};
                    if (newData[time][serieName] === undefined)
                        newData[time][serieName] = 0;

                    newData[time][serieName] += val;
                }
            }

            console.log("---> drop " + numberofdrop + " records that are older than " + (new Date(max_time)).toLocaleTimeString());

            var localtime = (new Date()).getTime();

            //update to chart each x seconds
            if (localtime - lastAddMoment > 1000 && !$.isEmptyObject(newData)) {

                //list of timestamps
                var keys = Object.keys(newData);
                keys = keys.map(function (i) {
                    return parseInt(i);
                });
                keys.sort();

                var max_Ox = max_time;

                //add some zero points 
                var new_keys = [];
                for (var i in keys) {
                    var time = keys[i];
                    //add zero points
                    var ts = max_time;
                    while (time - ts > samplePeriod * 1.5) {
                        //add zero points
                        ts += samplePeriod;
                        new_keys.push(ts);
                    }


                    new_keys.push(time);
                    max_time = time;
                }

                //
                var obj = {};
                //convert newData to columns format of C3js
                var length = 0;

                //for each time step
                for (var i in new_keys) {
                    var time = new_keys[i];
                    var o = newData[time];

                    if (o == undefined)
                        o = zeroPoint;

                    time = new Date(time);

                    length++;
                    //for each category (In/Out)
                    for (var s in o) {
                        //init for the first element of each array
                        if (obj["x-" + s] == undefined) {
                            obj["x-" + s] = ["x-" + s]; //Ox
                            obj[s] = [s]; //Oy
                        }

                        var val = o[s];
                        //console.log( MMTDrop.tools.formatDataVolume( val)) ;
                        //showing Data Volume, Payload
                        if (selectedMetricId === COL.DATA_VOLUME.id || selectedMetricId === COL.PAYLOAD_VOLUME.id)
                            val = val * 8 / MMTDrop.config.probe_stats_period; //8: bit/second
                        else if (selectedMetricId === COL.ACTIVE_FLOWS.id)
                            val = val / MMTDrop.config.probe_stats_period;

                        //console.log( ' == ' + MMTDrop.tools.formatDataVolume( val)) ;

                        obj["x-" + s].push(time); //Ox
                        obj[s].push(val); //Oy
                    }
                }

                //reset newData
                newData = {};
                lastAddMoment = localtime;

                var columns = MMTDrop.tools.object2Array(obj);


                if (lengthOx < 5)
                    length = 0;

                try {
                    chart.flow({
                        columns: columns,
                        length: length
                    });
                } catch (err) {
                    console.error(err.stack);
                }
            }
        };


        //if (inDetailMode())
        //    database.onMessage("protocol.flow.stat", appendMsg);

        return rep;
    },

    createTrafficReport: function (fProbe, database) {
        var _this = this;
        var COL = MMTDrop.constants.StatsColumn;

        var fMetric = MMTDrop.filterFactory.createMetricFilter();

        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var col = fMetric.selectedOption();
                    var cols = [];


                    var period = fPeriod.getDistanceBetweenToSamples();

                    var ylabel = col.label;

                    if (col.id === MMTDrop.constants.StatsColumn.PACKET_COUNT.id) {
                        period = 1; //donot change the total number      
                        ylabel += " (total)";
                    } else if (col.id === MMTDrop.constants.StatsColumn.ACTIVE_FLOWS.id) {
                        ylabel += " (per second)";
                    } else {
                        period /= 8; //  bit/second
                        ylabel += " (bit/second)";
                    }

                    if (col.id !== COL.ACTIVE_FLOWS.id) {
                        //dir = 1: incoming, -1 outgoing, 0: All
                        cols.push(_this.getCol(col, true)); //in
                        cols.push(_this.getCol(col, false)); //out
                        /*cols.push({
                            id: col.id,
                            label: "All"
                                //type : "line"
                        });*/
                    } else
                        cols.push(col);

                    var obj  = {};
                    var data = db.data();
                    
                    for (var i in data) {
                        var msg   = data[i];
                        var proto = msg[COL.APP_ID.id];

                        //if (msg[0] != 100)
                        //    continue;

                        var time  = msg[COL.TIMESTAMP.id];
                        var exist = true;

                        //data for this timestamp does not exist before
                        if (obj[time] == undefined) {
                            exist = false;
                            obj[time] = {};
                            obj[time][COL.TIMESTAMP.id] = time;
                        }


                        for (var j in cols) {
                            var id = cols[j].id;
                            
                            if( msg[id] == undefined )
                                msg[id] = 0;
                            
                            if (exist)
                                obj[time][id] += msg[id] / period;
                            else
                                obj[time][id] = msg[id] / period;
                        }
                    }

                    cols.unshift(COL.TIMESTAMP);
                    
                    var $widget = $("#" + cLine.elemID).getWidgetParent();
                    var height  = $widget.find(".grid-stack-item-content").innerHeight();
                    height     -= $widget.find(".filter-bar").outerHeight(true) + 15;
                    
                    return {
                        data    : obj,
                        columns : cols,
                        ylabel  : ylabel,
                        height  : height,
                        addZeroPoints:{
                            time_id       : 3,
                            time          : db.time,
                            sample_period : 1000 * fPeriod.getDistanceBetweenToSamples(),
                            probeStatus  : db.probeStatus
                        },
                    };
                }
            },

            chart: {
                data:{
                    type: "step"
                },
                color: {
                    pattern: ['orange', 'green', 'blue']
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
                    x: {
                        tick: {
                            format: _this.formatTime,
                        }
                    },
                },
                zoom: {
                    enabled: false,
                    rescale: false
                },
                tooltip:{
                    format: {
                        title:  _this.formatTime
                    }
                },
            },

            afterRender: function (chart) {
                //register resize handle
                var $widget = $("#" + chart.elemID).getWidgetParent();
                $widget.on("widget-resized", function (event, $widget) {
                    var height = $widget.find(".grid-stack-item-content").innerHeight();
                    height -= $widget.find(".filter-bar").outerHeight(true) + 15;
                    chart.chart.resize({
                        height: height
                    });
                });
            }
        });

        var dataFlow = [{
                object: fMetric,
                effect: [{
                    object: cLine
								}]
        }];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fMetric],

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
