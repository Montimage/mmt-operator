var arr = [
    {
        id: "top_proto",
        title: "Top Websites",
        x: 0,
        y: 0,
        width: 6,
        height: 8,
        type: "success",
        userData: {
            fn: "createTopProtocolReport"
        },
    },
    {
        id: "top_user",
        title: "Top Websites of Users",
        x: 6,
        y: 0,
        width: 6,
        height: 8,
        type: "success",
        userData: {
            fn: "createTopProtocolsOfTopUsersReport"
        },
    },
];

var availableReports = {
    "createTopProtocolReport": "Top Websites",
}

var database = MMTDrop.databaseFactory.createFlowDB({
      format: [ MMTDrop.constants.CsvFormat.WEB_APP_FORMAT,
               MMTDrop.constants.CsvFormat.SSL_APP_FORMAT]  
});

var filters = [MMTDrop.filterFactory.createPeriodFilter(),
                MMTDrop.filterFactory.createProbeFilter(),
    MMTDrop.filterFactory.createFlowMetricFilter()];


function getHMTL( tag ){
    var html = tag[0];
    for( var i=1; i<tag.length; i++)
        html += ' <i class="fa fa-angle-right"/> ' + tag[i]; 
    return html;
}

//create reports
var SubReport = {
    data: {},
    loadChartOfOneUser : function( elemID, userIP, data, childrenTag ){
        childrenTag = childrenTag.slice(0);
        childrenTag.push( userIP );
        
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
        pre.rep = ReportFactory.createDetailOfApplicationReport(pre.filter, pre.db);
        pre.rep.charts[0].childrenTag = childrenTag;            
        
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
                html: getHMTL(childrenTag) ,
                style:"text-align: center; font-weight: bold"
            }));
        
        $subReport.show("slow", "easeInQuart");
    },
    
    
    loadChartOfOneApplication : function( elemID, appName, data, childrenTag ){

        //clone this array
        childrenTag = childrenTag.slice(0);
        childrenTag.push( appName );
        
        SubReport.data[elemID] = {};
        var pre = SubReport.data[elemID];
        
        //get classID from appName
        var APP = MMTDrop.constants.ProtocolsIDName;
        var appID = 0;
        for(var i in APP)
            if( APP[i] == appName){
                appID = i;
                break;
            }
                
        
        pre.$mainChart = $("#" + elemID).parent().parent().parent().parent();
        pre.$mainChart.hide();
        
        //get the last filter in the tool-box
        pre.filter = filters[ filters.length - 1 ];
        
        var $content   = pre.$mainChart.parent();
        var subChartID = elemID + "_sub_chart";
        
        var $subReport = $("<div>", {
            "id"   : subChartID,
        });
         
        $content.append( $subReport );
        $subReport.hide();
        
        pre.db = MMTDrop.databaseFactory.createFlowDB();
        //retain only msg concern to appID
        var arr = [];
        //list of data of the appID
        for( var i in data){
            var msg = data[i];
            if(  appID  ==   msg[ MMTDrop.constants.FlowStatsColumn.APP_NAME.id ])
                arr.push( msg );
        }
        
        pre.db.data( arr );
        pre.filter.attachTo( pre.db );
        
        pre.rep = ReportFactory.createTopUserReport(pre.filter, pre.db);
        
        pre.rep.charts[0].childrenTag = childrenTag;   
        try{
            pre.rep.renderTo( subChartID );
        
            //fire the chain to render the chart
            pre.rep.filters[0].filter();
        }catch( err ){ 
            console.error( err );
            console.error( err.stack); 
        }
        var $closeBtn = $('<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
        
        
        $closeBtn.on("click", null, {subChartID: subChartID, pre: pre}, function( event ){
            var $a = $( "#" + event.data.subChartID);
            var pre = event.data.pre;
            $a.hide("slow", "easeInQuart", function(){
                $a.remove(); 

                //delete a filter that was created by the report
                pre.rep.filters[0].delete();
                pre.rep.delete();
                pre.db.delete();

                pre.$mainChart.show();
            })
        } );
        
        $subReport.find(".input-group").parent().hide().parent()
            .append($closeBtn)
            .append($("<div>", {
                html: getHMTL(childrenTag) ,
                style:"text-align: center; font-weight: bold"
            }));
        
        $subReport.show("slow", "easeInQuart");
    },
}

var ReportFactory = {
    createDetailOfApplicationReport: function ( filter, database) {
        var self = this;
        var COL  = MMTDrop.constants.FlowStatsColumn;
        var HTTP = MMTDrop.constants.HttpStatsColumn;
        var SSL  = MMTDrop.constants.TlsStatsColumn;
        var RTP  = MMTDrop.constants.RtpStatsColumn;
        var FORMAT = MMTDrop.constants.CsvFormat;
        var fApp = MMTDrop.filterFactory.createAppFilter();

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var columns = [
                        {id: COL.START_TIME.id, label: "Start Time"}, 
                        {id: COL.SERVER_ADDR.id, label: "Server"}, 

                    ];

                    var colSum = [
                        {id: COL.UL_DATA_VOLUME.id, label: "Upload (B)"}, 
                        {id: COL.DL_DATA_VOLUME.id, label: "Download (B)"}, 
                        //{id: COL.TCP_RTT.id, label: "RTT (s)"}, 
                        {id: COL.RETRANSMISSION_COUNT.id, label:"Retrans."},
                    ];
                    var havingAppPath = false;
                    if( havingAppPath )
                        columns.push( {id: COL.PROTO_PATH.id, label: "Path"} );
                    
                    var data = db.data();
                    
                    var arr = [];
                    var lastIndex = COL.APP_NAME.id + 1;
                    
                    var havingOther = false;
                    
                    for( var i in data){
                        var msg     = data[i];
                        var format  = msg[0];
                        var obj     = {};
                        
                        var date = new Date( msg[COL.START_TIME.id] );
                        obj[ COL.START_TIME.id ] = date.toISOString().replace('T',' ').replace('Z', '') ;
                        
                        var host;
                        if( format == FORMAT.WEB_APP_FORMAT ){
                            host = msg[ lastIndex + HTTP.HOSTNAME.id ];
                        }
                        else if ( format == FORMAT.SSL_APP_FORMAT ){
                            host = msg[ lastIndex + SSL.SERVER_NAME.id ];
                        }
                        
                        if( host != undefined )
                            obj[COL.SERVER_ADDR.id]  = host ;
                                //+ "("+ msg[COL.SERVER_ADDR.id] +")"; //hostname + ip
                        else
                            obj[COL.SERVER_ADDR.id]  = msg[COL.SERVER_ADDR.id]; // ip
                        
                        for( var j in colSum ){
                                var val = msg[ colSum[j].id ];
                                if( val == undefined )
                                    val = 0;
                            obj[ colSum[j].id ] = val;
                        }
                        
                        var other = [];
                        if( format == FORMAT.WEB_APP_FORMAT ){
                            other.push( msg[ lastIndex + HTTP.MIME_TYPE.id ] );
//                            other.push( msg[ lastIndex + HTTP.MIME_TYPE.id ] );                            
                        }
  
                        if( other.length > 0 ){
                            havingOther  = true;
                            obj["other"] = other.join(", ");    
                        }
                        
                        if( havingAppPath )
                            obj[ COL.PROTO_PATH.id ] = MMTDrop.constants.getPathFriendlyName( msg[COL.PROTO_PATH.id] ) ;
                            
                        
                        arr.push( obj );
                            
                    }
                    
                    if( havingOther )
                        colSum.push( {id: "other", label: "Other"} );
                    
                    columns = columns.concat( colSum  );
                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                //"scrollX": true,
                //"scrollY": true,
                dom: "f<'overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterRender: function (_chart) {
                
            }
        });
        //

        var dataFlow = [{
            object: filter,
            effect: [{
                object: fApp,
                effect: [{
                    object: cTable
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
                    charts: [cTable],
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

                    var obj = db.stat.splitDataByApp();

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "label": col.label,
                        "data": {}
                    };

                    var total = 0;

                    for (var cls in obj) {
                        var o = obj[cls];
                        //sumup by col.id 
                        o = MMTDrop.tools.sumUp(o, col.id);

                        var v = o[col.id];
                        if( v == 0 ) continue;

                        //all
                        /*
                        if( cls == -1 ){
                                total = v;
                                continue;
                        }
                        */

                        var name = MMTDrop.constants.getProtocolNameFromID(cls);

                        data.push({
                            "key": name,
                            "val": v
                        });

                        cPie.dataLegend.data[name] = v;
                        cPie.dataLegend.dataTotal += v;
                    }

                    data.sort(function (a, b) {
                        return a.val - b.val;
                    });

                    if( total != 0 ){
                            var other = total - cPie.dataLegend.dataTotal;

                            cPie.dataLegend.dataTotal = total;
                            cPie.dataLegend.data["Unclassified"] = other;
                            data.push( {"key": "Unclassified", "val": other} )
                    }
                    
                    //get top 8 only
                    var top = 8;
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
                $("<thead><tr><th></th><th width='50%'>Website</th><th>" + legend.label + "</th><th>Percent</th></tr>").appendTo($table);
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

                    var $a = $("<a>", {
                        href: "?show detail of this class",
                        title: "click to show detail of this class",
                        text: val,
                        
                    });
                    $a.on("click", null, key, function( event ){
                        event.preventDefault();
                        var id = event.data;
                        if( _chart.childrenTag == undefined )
                            _chart.childrenTag = [];
                        
                        var childrenTag = _chart.childrenTag;

                        SubReport.loadChartOfOneApplication(_chart.elemID, id, _chart.database.data(), childrenTag);
                            
                        return false;
                    });
                    
                    $("<td>", {align: "right"}).append( $a ).appendTo($tr);

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
                        href: "?show all websites",
                        title: "click to show all websites",
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
                        
                        if ( _chart.childrenTag == undefined )
                            _chart.childrenTag = [];
                        var childrenTag = _chart.childrenTag;
                        
                        SubReport.loadChartOfOneUser(_chart.elemID, ip, _chart.database.data(), childrenTag);
                        
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
    
    
    createTopProtocolsOfTopUsersReport : function ( filter, database) {
        var self = this;
        var COL  = MMTDrop.constants.FlowStatsColumn;
        var HTTP = MMTDrop.constants.HttpStatsColumn;
        var SSL  = MMTDrop.constants.TlsStatsColumn;
        var RTP  = MMTDrop.constants.RtpStatsColumn;
        var FORMAT = MMTDrop.constants.CsvFormat;
        var fApp = MMTDrop.filterFactory.createAppFilter();

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var columns = [
                        {id: COL.CLIENT_ADDR.id, label: "Client"}, 
                        {id: COL.APP_NAME.id, label: "Web"}, 

                    ];

                    var colSum = [
                        {id: COL.UL_DATA_VOLUME.id, label: "Upload (B)"}, 
                        {id: COL.DL_DATA_VOLUME.id, label: "Download (B)"}, 
                    ];
                    
                    var getIDs = function( cols ){
                        var ar = [];
                        for( var i in cols )
                            ar.push( cols[i].id )
                            
                        return ar;
                    }
                    
                    var data = MMTDrop.tools.sumByGroups( 
                                db.data(),
                                getIDs( colSum ),    //cols to sum
                                getIDs( columns)     //cols to group
                    );
                    
                    var arr = [];
                    
                    for( var i in data){
                        var msg     = data[i];
                        var format  = msg[0];
                        var obj     = {};
                        
                        obj[ COL.CLIENT_ADDR.id ] = msg[ COL.CLIENT_ADDR.id ] ;

                        
                        
                        var total = 0;
                        for( var j in colSum ){
                                var val = msg[ colSum[j].id ];
                                if( val == undefined )
                                    val = 0;
                            obj[ colSum[j].id ] = val;
                            
                            total += val;
                        }
                        
                        obj["total"] = total;
                        
                        arr.push( obj );
                            
                    }
                    
                    columns = columns.concat( colSum  );
                    columns.push( {id: "total", label: "Total"} );
                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                //"scrollX": true,
                //"scrollY": true,
                dom: "f<'overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterRender: function (_chart) {
                
            }
        });
        //

        var dataFlow = [{
            object: filter,
            effect: [{
                object: fApp,
                effect: [{
                    object: cTable
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
                    charts: [cTable],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },
}