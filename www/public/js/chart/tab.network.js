var arr = [
    {
        id: "top_user",
        title: "Top Users",
        x: 0,
        y: 0,
        width: 6,
        height: 6,
        type: "danger",
        userData: {
            fn: "createTopUserReport"
        },
    },
    {
        id: "top_proto",
        title: "Top Protocols",
        x: 6,
        y: 0,
        width: 6,
        height: 6,
        type: "success",
        userData: {
            fn: "createTopProtocolReport"
        },
    },
];

var availableReports = {
    "createTopUserReport": "Top Users Report",
    "createTopProtocolReport": "Top Protocols Report",
}

var database = MMTDrop.databaseFactory.createFlowDB();

var filters = [MMTDrop.filterFactory.createPeriodFilter(),
                MMTDrop.filterFactory.createProbeFilter(),
    MMTDrop.filterFactory.createFlowMetricFilter()];


//create reports
var SubReport = {
    loadChartOfUser : function( elemID, userIP ){
        var $mainChart = $("#" + elemID).parent().parent().parent().parent();
        $mainChart.hide();
        
        //get the last filter in the tool-box
        var filter = filters[ filters.length - 1 ];
        
        var $content   = $mainChart.parent();
        var subChartID = elemID + "_sub_chart";
        
        var $subReport = $("<div>", {
            "id" : subChartID
        });
        
        $content.append( $subReport );
        
        var db = MMTDrop.databaseFactory.createFlowDB();
        db.data( database.data().slice() );
        filter.attachTo( db );
        var rep = ReportFactory.createTopProtocolReport(filter, db);
        
        rep.renderTo( subChartID );
        
        //fire the chain to render the chart
        filter = rep.filters[0];
        filter.selectedOption( {id: userIP} );
        filter.redraw();
        filter.filter();
        
        var $closeBtn = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        
        
        $closeBtn.on("click", null, subChartID, function( event ){
            $( "#" + event.data).remove();
            $mainChart.show("slow", "swing");
        } );
        
        $subReport.find(".input-group").parent()//.html("")
            .append($closeBtn).append(
            $("<div>", {text: "detail for the client " + userIP}));
        
    }
}

var ReportFactory = {

    createTopProtocolReport: function (filter, database) {
        var self = this;
        var COL = MMTDrop.constants.FlowStatsColumn;
        var fUser = MMTDrop.filterFactory.createUserFilter();

        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = filter.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var obj = db.stat.splitDataByClass();

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "label": col.label,
                        "data": {}
                    };

                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = MMTDrop.constants.getCategoryNameFromID(cls);

                        var total = 0;
                        //sumup by col.id 
                        o = MMTDrop.tools.sumUp(o, col.id);
                        var v = o[col.id];
                        data.push({
                            "key": name,
                            "val": v
                        });

                        total += o[col.id];

                        cPie.dataLegend.data[name] = total;
                        cPie.dataLegend.dataTotal += total;
                    }

                    data.sort(function (a, b) {
                        return a.val - b.val;
                    });

                    return {
                        data: data,
                        columns: [{
                            "id": "key",
                            label: ""
                        }, {
                            "id": "val",
                            label: ""
                        }],
                        ylabel: col.label
                    };
                }
            },
            chart: {
                size: {
                    height: 200
                },
            },

            //custom legend
            afterRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th width='50%'>Application</th><th>" + legend.label + "</th><th>Percent</th></tr>").appendTo($table);
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
                        "html": '<a href="#">' + val + '</a>'
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
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[2, "desc"]]
                });
            }
        });
        //

        var dataFlow = [{
            object: filter,
            effect: [{
                object: fUser,
                effect: [{
                    object: cPie
                }]
                    }]
        }, ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fUser],

            //charts
					[
                {
                    charts: [cPie],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },

    createTopUserReport: function (filter, database) {
        var self = this;
        var COL = MMTDrop.constants.FlowStatsColumn;
        var fApp = MMTDrop.filterFactory.createClassFilter();

        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = filter.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var obj = MMTDrop.tools.splitData(db.data(), COL.CLIENT_ADDR.id);

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "label": col.label,
                        "data": {}
                    };

                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = cls;

                        //sumup by col.id 
                        o = MMTDrop.tools.sumUp(o, col.id);
                        var v = o[col.id];
                        data.push({
                            "key": name,
                            "val": v
                        });


                        cPie.dataLegend.data[name] = v;
                        cPie.dataLegend.dataTotal += v;
                    }

                    data.sort(function (a, b) {
                        return b.val - a.val;
                    });

                    //get top 8 only
                    var top = 5;
                    if (data.length > top && cPie.showAll !== true) {
                        var val = 0;
                        for (var i = top; i < data.length; i++)
                            val += data[i].val;

                        data[top] = {
                            key: "Other",
                            val: val
                        };
                        //remove all elements after top
                        data.splice(top + 1, data.length - top);

                        //reset dataLegend
                        cPie.dataLegend.data = {};
                        for (var i = 0; i <= top; i++) {
                            var o = data[i];
                            cPie.dataLegend.data[o.key] = o.val;
                        }

                    }

                    return {
                        data: data,
                        columns: [{
                            "id": "key",
                            label: ""
                        }, {
                            "id": "val",
                            label: ""
                        }],
                        ylabel: col.label
                    };
                }
            },
            chart: {
                size: {
                    height: 240
                },
            },

            //custom legend
            afterRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th width='50%'>Client</th><th>" + legend.label + "</th><th>Percent</th></tr>").appendTo($table);
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

                    var $atotal = $("<a>", {
                        text: val,
                        title: "click to show detail of this user",
                        href:"?show detail of this user"
                    });
                    
                    //click to show detail of this user
                    $atotal.on("click", null, key, function( event ){
                        event.preventDefault();
                        var ip = event.data;
                        SubReport.loadChartOfUser(_chart.elemID, ip);
                        return false;
                    });
                    
                    $("<td>", {align: "right"}).append($atotal).appendTo($tr);
                    

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
                        href: "?show all clients",
                        title: "click to show all clients",
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
                        "html":  val
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
                            "text": legend.dataTotal
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": "100%"
                        })
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[2, "desc"]]
                });
            }
        });
        //

        var dataFlow = [{
            object: filter,
            effect: [{
                object: fApp,
                effect: [{
                    object: cPie
                }]
                    }]
        }, ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fApp],

            //charts
					[
                {
                    charts: [cPie],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },
}