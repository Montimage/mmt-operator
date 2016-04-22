var arr = [
    {
        id: "top_name",
        title: "Top Names",
        x: 0,
        y: 0,
        width: 6,
        height: 9,
        type: "info",
        userData: {
            fn: "createTopNameReport"
        },
    },
    {
        id: "top_user",
        title: "Top Machines",
        x: 6,
        y: 0,
        width: 6,
        height: 9,
        type: "warning",
        userData: {
            fn: "createTopMACReport"
        },
    },
];

var availableReports = {
};


var url = window.location.href.slice(window.location.href.indexOf('?') + 1);
var index = url.indexOf("=")
var param = {};
param[ url.substr(0, index) ] = url.substr(index+1);


if( param.mac != undefined || param.name ){
    var title = "MAC: " + param.mac;
    if( param.name != undefined )
        title = "Name: " + decodeURI( param.name );
    arr = [{
        id: "profile",
        title: title,
        x: 0,
        y: 0,
        width: 12,
        height: 8,
        type: "info",
        userData: {
            fn: "createDetailReport"
        },
    }];
}


function getHMTL( tag ){
    var html = tag[0];
    for( var i=1; i<tag.length; i++)
        html += ' <i class="fa fa-angle-right"/> ' + tag[i]; 
    return html;
}

//create reports
var ReportFactory = {
    createDetailReport: function ( filter ) {
        var self = this;
        var db_param = {format: [625], userData: param, id:"ndn.detail" };
        var isMAC    = param.mac !== undefined;
        var database = new MMTDrop.Database( db_param );
        var COL      = MMTDrop.constants.NdnColumn;
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    
                    var obj = {};
                    var ID  = (isMAC ? COL.NAME: COL.MAC_SRC);
                    //index
                    for( var i=0; i<data.length; i++ ){
                        var msg = data[i];
                        var key = {id: msg[ ID.id ], mac_dest: msg[ COL.MAC_DEST.id ]};
                        key     = JSON.stringify( key );
                        
                        if( obj[ key ] == undefined )
                            obj[ key ] = msg;
                        else{
                            for( var j=13; j<24; j++)
                                //time
                                if( j == 14 || j == 18 || j == 21 || j==22 || j==23){
                                    obj[key][ j ] = msg[ j ];
                                }else
                                    obj[key][ j ] += msg[ j ];
                        }
                    }
                    
                    data = [];
                    for( var i in obj ){
                        obj[i][ 0 ] = data.length + 1;
                        data.push( obj[i] );
                    }
                    
                    var columns = [{id: 0, label: ""           , align: "left"}, 
                                   {id: 7, label: "Name"       , align: "left"},
                                   {id: 6, label: "MAC Destination"       , align: "left"},
                                  ];
                    if( ! isMAC )
                        columns[1] = {id: 5, label: "MAC Source" , align: "right"};
                    
                    for(var i in COL )
                        if( COL[i].id > 7 && COL[i].id != 12)
                            columns.push( COL[i] );
                    //data.length = 1000;
                    return {
                        data   : data,
                        columns: columns,
                    };
                }
            },
            chart: {
                "paging"     : true,
                "info"       : true,
                "deferRender": true,
                "dom"   : '<"row"  <"col-md-6"><"col-md-6" f>> <"application-table overflow-auto-xy" t><"row" <"col-md-2" l> <"col-md-4" i><"col-md-6" p>> ',
            },

            //custom legend
            afterEachRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();

                var table = _chart.chart;
                if( table === undefined ) return;
                
                table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                    var $div = $('.application-table');
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

            }
        });
        //

        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cTable
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
                    charts: [cTable],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },
    
    createTopNameReport: function (filter, isMAC) {
        isMAC = (isMAC === true);
        var self = this;
        var db_option= {format: [625], id: "ndn.name"};
        if( isMAC )
            db_option.id = "ndn.mac";
        
        var database = new MMTDrop.Database( db_option );
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
                        "ndnTotal" : 0,
                        "label"    : col.label,
                        "data"     : {}
                    };

                    var db_data = db.data();
                    
                    for( var i=0; i< db_data.length; i++){
                        var val  = db_data[i][ col.id ];
                        var name = db_data[i][ COL.NAME.id ];
                        if( isMAC )
                            name = db_data[i][ COL.MAC_SRC.id ];
                        var val2 = val;
                        if( col.id < COL.NB_DATA_PACKET.id )
                            val2  = db_data[i][ col.id + 4 ];

                        if( cPie.dataLegend.data[name] === undefined )
                            cPie.dataLegend.data[name] = {val2: 0, val: 0};

                        cPie.dataLegend.data[name].val  += val;
                        cPie.dataLegend.data[name].val2 += val2;
                        cPie.dataLegend.ndnTotal        += val;
                        cPie.dataLegend.dataTotal       += val2;
                    }
                    for( var name in cPie.dataLegend.data )
                        data.push({
                            "key": name,
                            "val": cPie.dataLegend.data[ name ].val,
                            "val2": cPie.dataLegend.data[ name ].val2
                        });
                    

                    data.sort(function (a, b) {
                        return b.val - a.val;
                    });

                    var top = 7;
                    if( data.length > top+1 && cPie.showAll !== true){
                        var val = 0, val2 = 0;
                        
                        //update data
                        for (var i=top; i<data.length; i++ ){
                            var msg = data[i];
                            val  += msg.val;
                            val2 += msg.val2;
                            //remove
                            delete( cPie.dataLegend.data[ msg.key ]);
                        }
                                            
                        //reset dataLegend
                        cPie.dataLegend.data["Other"] = {val2: val2, val: val};
                        
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
                var name = "Name";
                if( isMAC )
                    name = "MAC Address";
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th width='60%'>"+ name  +"</th><th width='20%'>" + legend.label + "</th><th width='20%'>Percent</th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    if (key == "Other")
                        continue;
                    i++;
                    var val   = legend.data[key].val;
                    var val2  = legend.data[key].val2;
                    
                    var $tr = $("<tr>");
                    $tr.appendTo($table);

                    $("<td>", {
                            //"class": "item-" + key,
                            "data-id": key,
                            "style": "min-width: 30px; cursor: pointer",
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
                        title: "click to show detail of this " + (isMAC ? "name" : "machine"),
                        href : (isMAC ? "?mac=": "?name=") + encodeURI(key)
                    });
                    
                    $("<td>", {align: "left"
                        }).append($label).appendTo($tr);
                    
                    $("<td>", {
                        "text" : MMTDrop.tools.formatDataVolume( val ),
                        "align": "right"
                    }).appendTo($tr);
                    /*
                    $("<td>", {
                        "text" : (val * 100 / val2).toFixed(2) + "%",
                        "align": "right"
                    }).appendTo($tr);
                    */
                    $("<td>", {
                        "align": "right",
                        "text": (val * 100 / legend.ndnTotal).toFixed(2) + "%"

                    }).appendTo($tr);
                }
                
                //footer of table
                var $tfoot = $("<tfoot>");

                if (legend.data["Other"] != undefined) {
                    i++;
                    $tr = $("<tr>");
                    var key = "Other";
                    var val = legend.data[key].val;
                    var val2 = legend.data[key].val2;
                    
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
                        href: "#showAllClients",
                        title: "click to show all clients",
                        text: "Other",
                        
                    });
                    $a.on("click", function( event ){
                        event.preventDefault();
                       //_chart.showAll = true;
                       //_chart.redraw(); 
                        return false;
                    });
                    
                    $("<td>").append( $a ).appendTo($tr);
                    
                    $("<td>", {
                        "align": "right",
                        "html":  MMTDrop.tools.formatDataVolume( val ),
                    }).appendTo($tr);
                    /*
                    $("<td>", {
                        "text" : (val * 100 / val2).toFixed(2) + "%",
                        "align": "right"
                    }).appendTo($tr);
                    */
                    $("<td>", {
                        "align": "right",
                        "text": (val * 100 / legend.ndnTotal).toFixed(2) + "%"

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
                            "text": MMTDrop.tools.formatDataVolume( legend.ndnTotal )
                        })
                    )/*.append(
                        $("<td>", {
                            "text" : (legend.ndnTotal * 100 / legend.dataTotal).toFixed(2) + "%",
                            "align": "right"
                        })
                    )*/.append(
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
    
    createTopMACReport: function (filter) {
        return this.createTopNameReport(filter, true);
    },
    
}