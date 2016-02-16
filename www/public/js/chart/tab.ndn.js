var arr = [
    {
        id: "top_user",
        title: "Top Names",
        x: 0,
        y: 0,
        width: 12,
        height: 9,
        type: "info",
        userData: {
            fn: "createTopNameReport"
        },
    },
];

var availableReports = {
    "createTopNameReport": "Top Names",
};


function getHMTL( tag ){
    var html = tag[0];
    for( var i=1; i<tag.length; i++)
        html += ' <i class="fa fa-angle-right"/> ' + tag[i]; 
    return html;
}

//create reports
var ReportFactory = {
    createDetailOfApplicationChart: function () {
        var self    = this;
        var COL     = MMTDrop.constants.StatsColumn;
        var HTTP    = MMTDrop.constants.HttpStatsColumn;
        var SSL     = MMTDrop.constants.TlsStatsColumn;
        var RTP     = MMTDrop.constants.RtpStatsColumn;
        var FORMAT  = MMTDrop.constants.CsvFormat;
        var HISTORY = [];
        var openingRow;
        
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    HISTORY = [];
                    var columns = [{id: COL.START_TIME.id, label: "Start Time", align:"left"},
                                   {id: COL.IP_DEST.id   , label: "Server"    , align:"left"}];

                    var colSum = [
                        {id: COL.UL_DATA_VOLUME.id, label: "Upload"  , align:"right"}, 
                        {id: COL.DL_DATA_VOLUME.id, label: "Download", align:"right"},
                    ];
                    var otherCols = [
                        {id: HTTP.MIME_TYPE.id, label: "MIME"  , align:"left"},
                        {id: HTTP.REFERER.id, label: "Referer"  , align:"left"},
                    ];
                    
                    var havingAppPath = true;
                    if( havingAppPath )
                        columns.push( {id: COL.APP_PATH.id, label: "Path", align:"left"} );
                    
                    var data = db.data();
                    
                    var arr = [];
                    var havingOther = false;
                    
                    for( var i in data){
                        var msg     = data[i];

                        var format  = msg [ COL.FORMAT_TYPE.id ];
                        var obj     = {};
                        HISTORY.push( msg );
                        obj["index"] = HISTORY.length;
                        
                        obj[ COL.START_TIME.id ]    = moment( msg[COL.START_TIME.id] ).format("YYYY/MM/DD HH:mm:ss");
                        obj[ COL.APP_PATH.id ]      = MMTDrop.constants.getPathFriendlyName( msg[COL.APP_PATH.id] ) ;
                        obj[ COL.UL_DATA_VOLUME.id] = msg[ COL.UL_DATA_VOLUME.id];
                        obj[ COL.DL_DATA_VOLUME.id] = msg[ COL.DL_DATA_VOLUME.id];
                        
                        var host =  msg[ HTTP.HOSTNAME.id ];
                        if( host == undefined || host == "" )
                            host = msg[ SSL.SERVER_NAME.id ];
                        
                        
                        if( host != undefined && host != ""){
                            if( cTable.userData.ip_dest != undefined )
                                obj[COL.IP_DEST.id]  = host;
                            else
                                obj[COL.IP_DEST.id]  = host  + " ("+ msg[COL.IP_DEST.id] +")";
                        }else
                            obj[COL.IP_DEST.id]  = msg[COL.IP_DEST.id]; // ip
                        
                        for( var j in colSum ){
                                var val = msg[ colSum[j].id ];
                                if( val == undefined )
                                    val = 0;
                            obj[ colSum[j].id ] = val;
                        }
                        
                        for( var i in otherCols ){
                            var c   = otherCols[i];
                            var val = msg[ c.id ];
                            if( val != undefined && val != ""){
                                obj[ c.id ]  = val;
                                c.havingData = true;
                            }
                        }
                        
                        arr.push( obj );
                            
                    }
                    
                    for( var i in otherCols ){
                        var c = otherCols[i];
                        if( c.havingData === true )
                            colSum.push( c );
                    }
                    
                    columns = columns.concat( colSum  );
                    columns.unshift( {id: "index", label: ""});
                    
                    for( var i in arr ){
                        arr[i][ COL.UL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( arr[i][ COL.UL_DATA_VOLUME.id ] );
                        arr[i][ COL.DL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( arr[i][ COL.DL_DATA_VOLUME.id ] );
                    }
                    
                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                //"scrollX": true,
                //"scrollY": true,
                dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><'row-cursor-pointer't><'row'<'col-sm-3'i><'col-sm-9'p>>",
            },
            afterEachRender: function (_chart) {
                // Add event listener for opening and closing details
                _chart.chart.on('click', 'tr[role=row]', function () {
                    var tr = $(this);
                    var row = _chart.chart.api().row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                        openingRow = null;
                    } else {
                        //close the last opening
                        if (openingRow) {
                            openingRow.child.hide();
                            $(openingRow.node()).removeClass('shown');
                        }

                        // Open this row
                        var index = row.data()[0] - 1;
                        var event = HISTORY[ index ];
                        var format = event[ 24 ];
                        var NEXT;
                        if( format == FORMAT.WEB_APP_FORMAT ){
                            NEXT = HTTP;
                            event[ 24 ] = "HTTP";
                        }else if( format == FORMAT.SSL_APP_FORMAT ){
                            NEXT = SSL;
                            event[ 24 ] = "SSL";
                        }else if( format == FORMAT.RTP_APP_FORMAT ){
                            NEXT = RTP;
                            event[ 24 ] = "RTP";
                        }
                        var obj = {};
                        for( var i in COL )
                            if( event[ COL[i].id ] != undefined )
                                obj[ COL[i].label ] = event[ COL[i].id ];
                        
                        for( var i in NEXT )
                            obj[ NEXT[i].label ] = event[ NEXT[i].id ];

                        var str = JSON.stringify(obj, function (key, val) {
                            if (typeof val === "string")
                                return "<string>" + val + "</string>";
                            if (typeof val === "number")
                                return " <number>" + val + "</number>";
                            return val;
                        })
                        .replace(/(\"<string>)/g, '<string>"').replace(/<\/string>\"/g, ' "</string>')
                        .replace(/\"<number/g, "<number").replace(/number>\"/g, "number>")
                        //.replace(/\"(.+)\":/g, "<label>$1</label> :")
                        ;
                        row.child('<div id="detailTest" class="code-json overflow-auto-xy"><ul>' + str + '</ul></div>').show();
                        tr.addClass('shown');
                        openingRow = row;
                    }
                    return false;
                });
            }
        });
        return cTable;
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
                        var name = MMTDrop.constants.getProtocolNameFromID(cls);
                        name = '<a onclick=loadDetail(null,'+ cls +')>' + name + '</a>'
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
                        
                        ip = '<a onclick=loadDetail("'+ ip +'")>' + ip + '</a>'
                        
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
    
    createTopNameReport: function (filter, userData) {
        var self = this;
        var database = new MMTDrop.Database({format: [625]});
        var COL      = MMTDrop.constants.NdnColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        var fMetric  = MMTDrop.filterFactory.createNdnMetricFilter();

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
                        var name = db_data[i][ COL.NAME.id ];
                        var mac  = db_data[i][ COL.MAC_SRC.id ];

                        if( cPie.dataLegend.data[name] === undefined )
                            cPie.dataLegend.data[name] = {mac: mac, val: 0};

                        cPie.dataLegend.data[name].val += val;
                        cPie.dataLegend.dataTotal      += val;
                    }
                    for( var name in cPie.dataLegend.data )
                        data.push({
                            "key": name,
                            "val": cPie.dataLegend.data[ name ].val
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
                            
                            //remove
                            delete( cPie.dataLegend.data[ msg.key ]);
                        }
                                            
                        //reset dataLegend
                        cPie.dataLegend.data["Other"] = {mac: "", val: val};
                        
                        data[top] = {
                            key: "Other",
                            val: val 
                        };
                        data.length = top+1;
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
                $("<thead><tr><th></th><th width='40%'>Name</th><th width='20%'>MAC</th><th width='20%'>" + legend.label + "</th><th width='20%'>Percent</th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    if (key == "Other")
                        continue;
                    i++;
                    var val = legend.data[key].val;
                    var mac = legend.data[key].mac;
                    
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
                        "text" : mac,
                        "align": "left"
                    }).appendTo($tr);

                    
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
                    var val = legend.data[key].val;

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
                    
                    $("<td>").appendTo($tr);
                    
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
                    order: [[4, "desc"]]
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

var detail_db = MMTDrop.databaseFactory.createStatDB({id: "network.detail"});
var cTable    = ReportFactory.createDetailOfApplicationChart();
function loadDetail( ip_dest, app_id ){
    if( param.ip == undefined )
        return;
    var userData = {
        ip     : param.ip,
        ip_dest: ip_dest,
        app_id : app_id
    };
    if( ip_dest == undefined )
        ip_dest = "";
    else
        ip_dest = ', <strong>IP destination: </strong>' + ip_dest;
    
    var app_name = "";
    if( app_id )
        app_name = ', <strong>Application:</strong> ' + MMTDrop.constants.getProtocolNameFromID( app_id );
    
    cTable.userData = userData;
    
    var period = fPeriod.selectedOption().id;
    detail_db.reload({"userData": userData, "period": period}, function( new_data, table){
        table.attachTo( detail_db, false );
        table.renderTo( "popupTable" )
        $("#detailItem").html('<strong>IP source:</strong> '+ param.ip + ip_dest + app_name );
        $("#modalWindow").modal();
    }, cTable);
    
    
     if( $("#modalWindow").length === 0 ){
        var modal = '<div class="modal modal-wide fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">'
                    +'<div class="modal-dialog">'
                    +'<div class="modal-content" >'
                    +'<div class="modal-header">'
                    +'<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>'
                    +'<h4 class="modal-title">Detail</h4>'
                    +'</div>'
                    +'<div class="modal-body code-json">'
                    +'<div id="detailItem"/>'
                    +'<div id="popupTable"/>'
                    +'</div>'
                    +'</div></div></div>';

        $("body").append( $(modal) );
    }
}