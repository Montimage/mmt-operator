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
    data: {},
    loadChartOfUser : function( elemID, userIP, data, isAppChart ){
        if( isAppChart == undefined )
            isAppChart = false;
        
        SubReport.data[elemID] = {};
        var pre = SubReport.data[elemID];

        pre.$mainChart = $("#" + elemID).parent().parent().parent().parent();
        pre.$mainChart.hide();
        
        //get the last filter in the tool-box
        pre.filter = filters[ filters.length - 1 ];
        
        var subChartID = elemID + "_sub_chart";
        
        var $subReport = $("<div>", {
            "id"   : subChartID
        });
         
        pre.$mainChart.parent().append( $subReport );
        
        $subReport.hide();
        
        pre.db = MMTDrop.databaseFactory.createFlowDB();
        //retain only msg concern to userIP
        var arr  = [];
        for( var i in data){
            var msg = data[i];
            if( msg[ MMTDrop.constants.FlowStatsColumn.CLIENT_ADDR.id ] == userIP )
                arr.push( msg );
        }
        pre.db.data( arr );
        pre.filter.attachTo( pre.db );
        if( isAppChart === false){
            pre.rep = ReportFactory.createTopProtocolReport(pre.filter, pre.db);
            pre.rep.charts[0].level = 2;
        }else{
            pre.rep = ReportFactory.createDetailOfClassReport(pre.filter, pre.db);
            pre.rep.charts[0].level = 3;
        }
            
        pre.rep.renderTo( subChartID );
        
        //fire the chain to render the chart
        pre.rep.filters[0].filter();
        pre.rep.charts[0].level = 2;
        
        var $closeBtn = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        
        
        $closeBtn.on("click", null, subChartID, function( event ){
            var $a = $( "#" + event.data);
            $a.hide("slow", "easeInQuart", function(){
                $a.remove(); 
                pre.$mainChart.show();
            })
        } );
        
        $subReport.find(".input-group").parent().hide().parent()
            .append($closeBtn)
            .append($("<div>", {
                text: "detail of the client " + userIP,
                style:"text-align: center; font-weight: bold"
            }));
        
        $subReport.show("slow", "easeInQuart");
    },
    
    loadChartOfClass : function( elemID, className, data, isAppChart ){
        if( isAppChart == undefined )
            isAppChart = false;
        
        SubReport.data[elemID] = {};
        var pre = SubReport.data[elemID];
        
        //get classID from className
        var CAT = MMTDrop.constants.CategoriesIdsMap;
        var classID = 0;
        for(var i in CAT)
            if( CAT[i] == className){
                classID = i;
                break;
            }
                
        
        pre.$mainChart = $("#" + elemID).parent().parent().parent().parent();
        pre.$mainChart.hide();
        
        //get the last filter in the tool-box
        pre.filter = filters[ filters.length - 1 ];
        
        var $content   = pre.$mainChart.parent();
        var subChartID = elemID + "_sub_chart";
        
        var $subReport = $("<div>", {
            "id"   : subChartID
        });
         
        $content.append( $subReport );
        $subReport.hide();
        
        pre.db = MMTDrop.databaseFactory.createFlowDB();
        //retain only msg concern to classID
        var arr = [];
        //list of all app in the class classID
        var appLst = MMTDrop.constants.CategoriesAppIdsMap[ classID ];
        for( var i in data){
            var msg = data[i];
            var appId = msg[ MMTDrop.constants.FlowStatsColumn.APP_NAME.id ];
            if( appLst.indexOf( appId )  > -1 )
                arr.push( msg );
        }
        
        pre.db.data( arr );
        pre.filter.attachTo( pre.db );
        if( isAppChart === false ){
            pre.rep = ReportFactory.createTopUserReport(pre.filter, pre.db);
            pre.rep.charts[0].level = 2;
        }else{
            pre.rep = ReportFactory.createDetailOfClassReport(pre.filter, pre.db);
            pre.rep.charts[0].level = 3;
        }
        
        pre.rep.renderTo( subChartID );
        
        //fire the chain to render the chart
        pre.rep.filters[0].filter();

        var $closeBtn = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        
        
        $closeBtn.on("click", null, subChartID, function( event ){
            var $a = $( "#" + event.data);
            $a.hide("slow", "easeInQuart", function(){
                $a.remove(); 
                pre.$mainChart.show();
            })
        } );
        
        $subReport.find(".input-group").parent().hide().parent()
            .append($closeBtn)
            .append($("<div>", {
                text: "detail of the class " + className,
                style:"text-align: center; font-weight: bold"
            }));
        
        $subReport.show("slow", "easeInQuart");
    },
    
}

var ReportFactory = {

    createDetailOfClassReport: function (filter, database) {
        var self = this;
        var COL = MMTDrop.constants.FlowStatsColumn;
        var fApp = MMTDrop.filterFactory.createAppFilter();

        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = filter.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var obj = db.stat.splitDataByApp();

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "label": col.label,
                        "data": {}
                    };

                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = MMTDrop.constants.getProtocolNameFromID(cls);

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

                    var $a = $("<a>", {
                        href: "?show detail of this class",
                        title: "click to show detail of this class",
                        text: val,
                        
                    });
                    $a.on("click", null, key, function( event ){
                        event.preventDefault();
                         var id = event.data;
                        SubReport.loadChartOfClass(_chart.elemID, id, _chart.database.data());
                        
                        return false;
                    });
                    
                    $("<td>", {align: "right"}).append( $a ).appendTo($tr);

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

                    var $a = $("<a>", {
                        href: "?show detail of this class",
                        title: "click to show detail of this class",
                        text: val,
                        
                    });
                    $a.on("click", null, key, function( event ){
                        event.preventDefault();
                        var id = event.data;
                        var level = _chart.level;
                        if( level == undefined )
                            SubReport.loadChartOfClass(_chart.elemID, id, _chart.database.data());
                        else if( level == 2 )
                            SubReport.loadChartOfUser(_chart.elemID, id, _chart.database.data(), true);
                            
                        return false;
                    });
                    
                    $("<td>", {align: "right"}).append( $a ).appendTo($tr);

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
                        
                        
                        var level = _chart.level;
                        //for the first time
                        if( level == undefined )
                            SubReport.loadChartOfUser(_chart.elemID, ip, _chart.database.data());
                        else if( level == 2 )
                            SubReport.loadChartOfClass(_chart.elemID, ip, _chart.database.data(), true);
                        
                        

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