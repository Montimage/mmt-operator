var arr = [
    {
        id: "top_user",
        title: "Top Users",
        x: 0,
        y: 0,
        width: 6,
        height: 9,
        type: "info",
        userData: {
            fn: "createTopUserReport"
        },
    },
    {
        id: "top_proto",
        title: "Top Profiles",
        x: 6,
        y: 0,
        width: 6,
        height: 9,
        type: "success",
        userData: {
            fn: "createTopProtocolReport"
        },
    },
];

var availableReports = {
    "createTopUserReport": "Top Users",
    "createTopProtocolReport": "Top Protocols",
};

MMTDrop.filterFactory.createFlowMetricFilter();


function getHMTL( tag ){
    var html = tag[0];
    for( var i=1; i<tag.length; i++)
        html += ' <i class="fa fa-angle-right"/> ' + tag[i]; 
    return html;
}

//create reports
var ReportFactory = {
    createDetailOfApplicationReport: function (appName, filter, database) {
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
                        {id: COL.START_TIME.id, label: "Start Time", align:"right"}, 
                        {id: COL.SERVER_ADDR.id, label: "Server", align:"right"}, 

                    ];

                    var colSum = [
                        {id: COL.UL_DATA_VOLUME.id, label: "Upload (B)", align:"right"}, 
                        {id: COL.DL_DATA_VOLUME.id, label: "Download (B)", align:"right"}, 
                        //{id: COL.TCP_RTT.id, label: "RTT (s)"}, 
                        {id: COL.RETRANSMISSION_COUNT.id, label:"Retrans."},
                    ];
                    var havingAppPath = (appName == "NaP");
                    if( havingAppPath )
                        columns.push( {id: COL.PROTO_PATH.id, label: "Path", align:"right"} );
                    
                    var data = db.data();
                    
                    var arr = [];
                    var lastIndex = COL.APP_NAME.id + 1;
                    
                    var havingOther = false;
                    
                    for( var i in data){
                        var msg     = data[i];
                        var format  = msg[0];
                        var obj     = {};
                        
                        var date = new Date( msg[COL.START_TIME.id] );
                        
                        if( msg[COL.START_TIME.id] == undefined )
                            date = new Date( msg[COL.TIMESTAMP.id] );
                        
                        obj[ COL.START_TIME.id ] = MMTDrop.tools.formatDateTime( date ) ;
                        
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
                dom: "f<'dataTables_scrollBody overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterEachRender: function (_chart) {
                var table = _chart.chart;
                table.DataTable().columns.adjust();
                
                table.on("draw.dt", function () {
                    var $div = $('.dataTables_scrollBody');
                    var h = $div.parents().filter(".grid-stack-item-content").height() - 130;
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
    createApplicationReport: function (filter, ip) {
        var self = this;
        var db_param = {id: "network.profile" };
        if( ip !== undefined )
            db_param["userData"] = {ip: ip };
        var database = MMTDrop.databaseFactory.createStatDB( db_param );
        var COL      = MMTDrop.constants.StatsColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        
        var cPie = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [COL.DATA_VOLUME, COL.PACKET_COUNT];
                    
                    var obj = MMTDrop.tools.sumByGroup( data, 
                                                       [COL.DATA_VOLUME.id, COL.PACKET_COUNT.id], 
                                                       COL.APP_ID.id );

                    data = [];
                    for (var cls in obj) {
                        var o = obj[cls];
                        cls = parseInt( cls );
                        var name = MMTDrop.constants.getProtocolNameFromID(cls);

                        data.push( [0, name, 
                                    o[COL.DATA_VOLUME.id], 
                                    o[ COL.PACKET_COUNT.id ],
                                    MMTDrop.constants.getCategoryNameFromID(MMTDrop.constants.getCategoryIdFromAppId( cls ))
                                   ] )
                    }

                    //sort by data size
                    data.sort(function (a, b) {
                        return b[2] - a[2];
                    });
                    //index
                    for( var i=0; i<data.length; i++ ){
                        data[i][0] = (i+1);
                        data[i][2] = MMTDrop.tools.formatDataVolume(   data[i][2] );
                        data[i][3] = MMTDrop.tools.formatLocaleNumber( data[i][3] );
                    }
                    return {
                        data: data,
                        columns: [{id: 0, label: ""           , align: "left"}, 
                                  {id: 1, label: "Application", align: "left"},
                                  {id: 2, label: "Data       ", align: "right"},
                                  {id: 3, label: "Packet"     , align: "right"},
                                  {id: 4, label: "Profile"    , align: "right"}],
                    };
                }
            },
            chart: {
                "paging": false,
                "info"  : true,
                "dom"   : '<"row" <"col-md-6" i><"col-md-6" f>> <"application-table" t>',
            },

            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

            }
        });
        //

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cPie
                    }]
        }, ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fProbe],

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
    createDestinationReport: function (filter, ip) {
        var self = this;
        var db_param = {id: "network.destination" };
        if( ip !== undefined )
            db_param["userData"] = {ip: ip };
        var database = MMTDrop.databaseFactory.createStatDB( db_param );
        var COL      = MMTDrop.constants.StatsColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        
        var cPie = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var obj = {};

                    for (var i=0; i<data.length; i++) {
                        var msg  = data[i];
                        var ip   = msg[ COL.IP_DEST.id ];
                        var time = msg[ COL.TIMESTAMP.id ];
                        
                        if( obj[ip] === undefined )
                            obj[ ip ] = [
                                0, //0: index
                                ip,//1: ip
                                0, //2: data
                                0, //3: packet
                                msg[ COL.START_TIME.id ], //4: start time
                                time //5: last updated
                            ];
                        obj[ ip ][ 2 ] += msg[ COL.DATA_VOLUME.id];
                        obj[ ip ][ 3 ] += msg[ COL.PACKET_COUNT.id ];
                        
                        if( obj[ ip ][ 4 ] > time )
                            obj[ ip ][ 4 ] = time;
                        if( obj[ ip ][ 5 ] < time )
                            obj[ ip ][ 5 ] = time;
                    }

                    data = [];
                    for( var i in obj )
                        data.push( obj[i] );
                    
                    //sort by data size
                    data.sort(function (a, b) {
                        return b[2] - a[2];
                    });
                    //index
                    for( var i=0; i<data.length; i++ ){
                        data[i][0] = (i+1);
                        data[i][2] = MMTDrop.tools.formatDataVolume( data[i][2] );
                        data[i][3] = MMTDrop.tools.formatLocaleNumber( data[i][3] );
                        data[i][4] = moment( data[i][4] ).format("YYYY/MM/DD HH:mm:ss");
                        data[i][5] = moment( data[i][5] ).format("MM/DD HH:mm:ss");
                    }
                        

                    return {
                        data: data,
                        columns: [{id: 0, label: ""              , align: "left"}, 
                                  {id: 1, label: "Destination IP", align: "left"},
                                  {id: 2, label: "Data       "   , align: "right"},
                                  {id: 3, label: "Packet"        , align: "right"},
                                  {id: 4, label: "Start Time"    , align: "right"},
                                  {id: 5, label: "Last Updated"  , align: "right"},
                                 ],
                    };
                }
            },
            chart: {
                "paging": false,
                "info"  : true,
                "dom"   : '<"row" <"col-md-6" i><"col-md-6" f>> <"application-table" t>',
            },
            click: function( el ){
                console.log( el );
            },
            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                

            }
        });
        //

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cPie
                    }]
        }, ];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fProbe],

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
    createTopProtocolReport: function (filter, ip) {
        var self = this;
        var db_param = {id: "network.profile" };
        if( ip !== undefined )
            db_param["userData"] = {ip: ip };
        var database = MMTDrop.databaseFactory.createStatDB( db_param );
        var COL      = MMTDrop.constants.StatsColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        var fMetric  = MMTDrop.filterFactory.createMetricFilter();

        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = fMetric.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var obj = db.stat.splitDataByClass();

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "label"    : col.label.substr(0, col.label.indexOf(" ")),
                        "data"     : {}
                    };

                    var total = 0;

                    for (var cls in obj) {
                        var o = obj[cls];
                        //sumup by col.id 
                        o = MMTDrop.tools.sumUp(o, col.id);

                        var v = o[col.id];
                        if( v === 0 || v === undefined ) continue;

                        var name = MMTDrop.constants.getCategoryNameFromID(cls);

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

                    var top = 7;
                    if( data.length > top+1 && cPie.showAll !== true && ip == undefined ){
                        var val = 0;
                        
                        //update data
                        for (var i=top; i<data.length; i++ ){
                            var msg = data[i];
                            val += msg.val;
                        }
                                                
                        data[top] = {
                            key: "Other",
                            val: val
                        };
                        data.length = top+1;
                        
                        //reset dataLegend
                        cPie.dataLegend.data = {};
                        for (var i = 0; i < data.length; i++) {
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
                    };
                }
            },
            chart: {
                size: {
                    height: 300
                },
                legend: {
                    hide: true,
                },
                data: {
                    onclick: function( d, i ){
                        var id = d.id;
                        if( id === "Other") return;
                        
                        var _chart = cPie.chart;
                    }
                }
            },

            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-condensed"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th width='50%'>Profile</th><th>" + legend.label + "</th><th>Percent</th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    if( key == "Other")
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
                        href : "?show detail of this class",
                        title: "click to show detail of this class",
                        text : MMTDrop.tools.formatDataVolume( val ),
                        
                    });
                    $a.on("click", null, key, function( event ){
                        event.preventDefault();
                        var id = event.data;
                        
                        if( ip )
                            location.href = "?profile=" + id + "&ip = " + ip;
                        else
                            location.href = "?profile=" + id;
                        return false;
                    });
                    
                    $("<td>", {align: "right"}).text(  MMTDrop.tools.formatDataVolume( val ) ).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": Math.round(val * 10000 / legend.dataTotal) / 100 + "%"
                    }).appendTo($tr);
                }
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
                        href: "?show all classes",
                        title: "click to show all classes",
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
                        "html" :  MMTDrop.tools.formatDataVolume( val )
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
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]]
                });
            }
        });
        //

        var dataFlow = [{object:fProbe,
                         effect:[{
                object: fMetric,
                effect: [{
                    object: cPie
                }]
        }, ] }];

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
                    charts: [cPie],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },

    createTopUserReport: function (filter, userData) {
        var self = this;
        var database = MMTDrop.databaseFactory.createStatDB({id: "network.user", userData: userData});
        var COL      = MMTDrop.constants.StatsColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        var fMetric  = MMTDrop.filterFactory.createMetricFilter();

        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = fMetric.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "label"    : col.label,
                        "data"     : {}
                    };

                    var db_data = db.data();
                    
                    for( var i=0; i< db_data.length; i++){
                        var val  = db_data[i][ col.id ];
                        var name = db_data[i][ COL.IP_SRC.id ];
                        

                        if( cPie.dataLegend.data[name] === undefined )
                            cPie.dataLegend.data[name] = 0;

                        cPie.dataLegend.data[name] += val;
                        cPie.dataLegend.dataTotal  += val;
                    }
                    for( var name in cPie.dataLegend.data )
                        data.push({
                            "key": name,
                            "val": cPie.dataLegend.data[ name ]
                        });
                    

                    data.sort(function (a, b) {
                        return b.val - a.val;
                    });

                    var top = 7;
                    if( data.length > top+1 && cPie.showAll !== true){
                        var val = 0;
                        
                        //update data
                        for (var i=top; i<data.length; i++ ){
                            var msg = data[i];
                            val += msg.val;
                        }
                                                
                        data[top] = {
                            key: "Other",
                            val: val 
                        };
                        data.length = top+1;
                        
                        //reset dataLegend
                        cPie.dataLegend.data = {};
                        for (var i = 0; i < data.length; i++) {
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
                    height: 300
                },
                legend: {
                    hide: true,
                },
                data: {
                    onclick: function( d, i ){
                        var ip = d.id;
                        if( ip === "Other") return;
                        
                        var _chart = cPie;
                        //TODO
                    }
                }
            },

            //custom legend
            afterEachRender: function (_chart) {
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
                    
                    var $label = $("<a>", {
                        text : key,
                        title: "click to show detail of this user",
                        href :"?ip=" + key
                    });
                    
                    $("<td>", {align: "left"}).append($label).appendTo($tr);
                    
                    $("<td>", {
                        "text" : MMTDrop.tools.formatDataVolume( val ),
                        "align": "right"
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
                        "html":  MMTDrop.tools.formatDataVolume( val ),
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
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]]
                });
            }
        });
        //

        var dataFlow = [{object:fProbe,
                         effect:[{
                object: fMetric,
                effect: [{
                    object: cPie
                }]
        }, ] }];

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

var param = MMTDrop.tools.getURLParameters();
if( param.ip != undefined ){
    var ip = param.ip; //'<a href="?">'+ param.ip +'</a>'
    arr = [{
        id: "profile",
        title: ip + " &gt; Profiles",
        x: 0,
        y: 0,
        width: 5,
        height: 10,
        type: "info",
        userData: {
            fn: "createIPUserReport"
        },
    },{
        id: "user",
        title: ip + " &gt; Destinations",
        x: 6,
        y: 0,
        width: 7,
        height: 5,
        type: "info",
        userData: {
            fn: "createIPDestinationReport"
        },
    },{
        id: "app",
        title: ip + " &gt; Protocols/Applications",
        x: 6,
        y: 6,
        width: 7,
        height: 5,
        type: "info",
        userData: {
            fn: "createIPApplicationReport"
        },
    }];
    
    ReportFactory.ip = param.ip;
    ReportFactory.createIPUserReport = function( filter ){
        var rep = this.createTopProtocolReport( filter, this.ip);
        return rep;
    };
    
    ReportFactory.createIPApplicationReport = function( filter ){
        var rep = this.createApplicationReport( filter, this.ip);
        return rep;
    };
    
    ReportFactory.createIPDestinationReport = function( filter ){
        var rep = this.createDestinationReport( filter, this.ip);
        return rep;
    }
}