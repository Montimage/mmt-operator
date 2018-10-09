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
        title: "Top Protocols",
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
        title: "Last Minute Active Nodes",
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


    createProtocolReport: function (fPeriod) {
        var _this    = this;
        var self     = this;
        var COL      = MMTDrop.constants.StatsColumn;
        
        //the data is got by 2 stages:
        //1 - get the list of protocols having the highest data volumes
        //2 - get details of the protocols inside the top list.
        
        //Top protocols ordering by data_volum/////////////////////////////
        var match1 = {proto_depth: {$gt: 2, $lt: 5}}; //
        match1[ COL.APP_ID.id ] = { "$ne" : "0" }; //exclude unknown traffic
        
        //mongoDB aggregate
        var group1 = { _id : {} };
        group1["_id"]                = "$" + COL.APP_PATH.id; //groupby protocol path
        group1[ COL.DATA_VOLUME.id ] = {"$sum"   : "$" + COL.DATA_VOLUME.id}; //total data volume
        group1[ COL.APP_PATH.id ]    = {"$first" : "$" + COL.APP_PATH.id};    //retain proto path
        group1[ COL.APP_ID.id ]      = {"$first" : "$" + COL.APP_ID.id};    //retain proto path
        const sort = {};
        sort[ COL.DATA_VOLUME.id ] = -1;
        
        var database = new MMTDrop.Database({collection: "data_protocol", action: "aggregate",
            query: [{"$match": match1},{"$group": group1}, {$sort: sort}, {$limit: 10}], raw: true});
        //////////////////////////////////////////////////
        
        ///get only protocol inside top
        var detail_database = new MMTDrop.Database({collection: "data_protocol", action: "aggregate", raw: true } );
        
        //after getting the top list of protocols
        database.afterReload( function( data ){
           //add ethernet to get total
        		const app_path_arr = ["99"];
        		const app_id_arr   = [99];
        		
        		//get the top protocol paths having the highest data_volume
        		for( var i=0; i<data.length; i++ ){
        			app_path_arr.push( data[i][ COL.APP_PATH.id ] );
        			app_id_arr.push(   data[i][ COL.APP_ID.id ] );
        			
        			//get top 7
        			if( app_path_arr.length >= 8 )
        				break;
        		}
        		
        		//select only the app in the top
        		var match2 = { proto_depth: {$lt: 5} };
        		match2[ COL.APP_ID.id ]   = {$in : app_id_arr };
        		match2[ COL.APP_PATH.id ] = {$in : app_path_arr };
        		
	        	var group2 = { _id: {} };
	        	[ COL.TIMESTAMP.id, COL.APP_ID.id ].forEach( function( el, index){
	                group2["_id"][ el ] = "$" + el;
	        	} );
	        	
	        	[ COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id ].forEach( function( el, index){
	        		group2[ el ] = {"$sum" : "$" + el};
	        	});

	        	[ COL.TIMESTAMP.id , COL.APP_PATH.id, COL.APP_ID.id ].forEach( function( el, index){
	        		group2[ el ] = {"$first" : "$"+ el};
	        	} );

	        	var db_options = {
	        			period: status_db.time, 
	        			period_groupby: fPeriod.selectedOption().id, 
	        			query : [
	        				{$match: match2},  
	        				{$group: group2},
	        			]};
	        	
	        	if( URL_PARAM.probe_id != undefined )
	        	   db_options.probe = URL_PARAM.probe_id;
	        	
	        	//reload detail database
	        	detail_database.reload( db_options, function(){
	        		//draw the chart
	        		cLine.attachTo( detail_database );
	        		cLine.redraw();
	        	})
        })
        
        var fMetric  = MMTDrop.filterFactory.createMetricFilter();

        var setName = function (name) {
            name = MMTDrop.constants.getPathFriendlyName( name );
            //name = name.replace("ETHERNET", "ETH");
            return name == "ETH" ? "TOTAL" : name;
        }

        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var TIME = COL.TIMESTAMP;
                    var col = fMetric.selectedOption();

                    var colToSum = col;

                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var period = fPeriod.getDistanceBetweenToSamples() * 1.0;

                    var ylabel = col.label;
                    var unit   = "";

                    if (col.id === COL.PACKET_COUNT.id) {
                        ylabel += " (pps)";
                        unit   = "Packet Count";
                    } else if (col.id === COL.ACTIVE_FLOWS.id) {
                        unit   = "Flow Count";
                        ylabel += " (total)";
                        period  = 1;
                    } else {
                        period /= 8; //  bit/second
                        ylabel += " (bps)";
                        if( col.id === COL.DATA_VOLUME.id )
                            unit = "Data (B)";
                        else
                            unit = "Payload (B)";
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
                        if( cls == '99')
                          continue;

                        //remove all keys having level > 4, ETHENET.IP.TCP.HTTP.GOOGLE
                        var count = 0;
                        for( var i=0; i<cls.length; i++)
                            if( cls[ i ] === '.') count ++;
                        if( count >= 5 ){
                            delete obj[ cls ];
                            continue;
                        }

                        //delete all parent of the current path "cls"
                        for( var i=0; i<cls.length; i++)
                            if( cls[ i ] === '.'){
                                var parent = cls.substr(0, i);
                                if( obj[ parent ] && parent != "99")
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
                        if( cls != '99')
                          columns.push({
                              id   : cls,
                              label: name,
                              type : "area-stack",
                              value: total
                          });
                        else {
                          columns.push({
                              id   : cls,
                              label: name,
                              type : "line",
                              value: total
                          });
                        }
                    }



                    columns.sort(function (a, b) {
                        return b.value - a.value;
                    });


                    //retain only the top
                    var top = 8;
                    if (columns.length > top) {

                        columns.splice(top, columns.length - top);

                        //other
                        var val = 0;
                        for (var i = 0; i < columns.length; i++)
                          if( columns[i].id != '99')
                            val += columns[i].value;

                        if( val < cLine.dataLegend.dataTotal )
                          cLine.dataLegend.data[ "Other" ] = cLine.dataLegend.dataTotal - val;
                    }else{
                        //other
                        var val = 0;
                        for (var i = 0; i < columns.length; i++)
                          if( columns[i].id != '99')
                            val += columns[i].value;

                        if( val < cLine.dataLegend.dataTotal )
                             cLine.dataLegend.data[ "Other" ] = cLine.dataLegend.dataTotal - val;
                    }

                    //update legend
                    for( var i in columns )
                      if( columns[i].id != '99')
                        cLine.dataLegend.data[ columns[i].label ] = {val: columns[i].value, cls: columns[i].id};


                    data = {};
                    for (var cls in obj) {
                        var o = obj[cls];
                        var name = setName( cls );

                        if( cls != '99' && cLine.dataLegend.data[ name ] === undefined )
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
                            time          : status_db.time,
                            sample_period : 1000 * fPeriod.getDistanceBetweenToSamples(),
                            probeStatus   : status_db.probeStatus
                        },
                    };
                }
            },
            chart: {
                data: {
                  //order: null
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
                color: {
                    pattern: ['gray', 'red', 'peru', 'orange', 'NavajoWhite', 'MediumPurple', 'purple', 'magenta', 'blue', 'MediumSpringGreen', 'green', ]
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
                tooltip: {
                  _contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        var $$ = this, config = $$.config,
                            titleFormat = config.tooltip_format_title || defaultTitleFormat,
                            nameFormat = config.tooltip_format_name || function (name) { return name; },
                            valueFormat = config.tooltip_format_value || defaultValueFormat,
                            text, i, title, value, name, bgcolor;
                            //push "Total Bandwidth" to the top
                            d.push( d[0] );
                            for (i = d.length; i >0; i--) {
                              if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

                              if (! text) {
                                  title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                                  text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
                              }

                              name = nameFormat(d[i].name);
                              value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                              bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                              text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                              text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                              text += "<td class='value'>" + value + "</td>";
                              text += "</tr>";
                          }
                        return text + "</table>";
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
            },
	                //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed tbl-node-legend"
                });

                $("<thead><tr><th></th><th width='50%'>Protocol</th><th>" + legend.label + "</th><th>Percent</th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    var val = legend.data[key].val;
                    var cls = legend.data[key].cls;

                    //there are at least 2
                    if (key == "Other")
                        continue;
                    i++;

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
                        .on('click', function () {
                            var id = $(this).data("id");
                            chart.toggle(id);
                            //$(this).css("background-color", chart.color(id) );
                        })
                        .appendTo($tr);
                    $("<td>", {
                        "html": '<span style="max-width:150px;display:inline-block">' + key + '</span>'
                    }).appendTo($tr);
                    $("<td>", {
                        "align": "right",
                        "text": MMTDrop.tools.formatDataVolume(val)
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);
                }
                //footer of table
                var $tfoot = $("<tfoot>");

                if (legend.data["Other"] != undefined && legend.dataTotal > legend.data["Other"]) {
                    i++;
                    $tr = $("<tr>");
                    var key = "Other";
                    var val = legend.data[key];

                    $("<td>", {
                            "class": "item-" + key,
                            "data-id": key,
                            "style": "width: 30px",
                            "align": "right"
                        })
                        .appendTo($tr);

                    $("<td>Other</td>") .appendTo($tr);


                    $("<td>", {
                        "align": "right",
                        "html": MMTDrop.tools.formatDataVolume(val)
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);

                    $tfoot.append($tr).appendTo($table);
                }

                $tfoot.append(
                    $("<tr>", {
                        "class": 'success'
                    }).append(
                        $("<td>", {
                            //text  : i,
                            style : "cursor:pointer;background-color:"+ chart.color( "TOTAL" )
                        }).on('click', function () {
                            chart.toggle( "TOTAL" );
                        })
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
                            "align"  : "right",
                            "text"   : "100%",
                        })
                    )
                    ).appendTo($table);


                var legendId = _chart.elemID + "-legend";

                $("#"+ legendId).remove();
                var $parent = $("#" + _chart.elemID).parent().parent();

                $parent.parent().append(
                    $('<div style="width: 360px; margin-right: 15px" class="pull-right overflow-auto-xy" id="' + legendId + '"/>')
                );
                $table.appendTo($("#" + legendId));

                var table = $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]]
                });


                $parent.css("width", ($(document).width() - 50 - 390) + "px")
                       .css("width", "calc(100% - 390px")
                       .css("width", "-webkit-calc(100% - 390px")//safari
                       .css("width", "-moz-calc(100% - 390px")   //firefox
                       .css("width", "-o-calc(100% - 390px")   //opera
                       ;
                _chart.chart.resize();

                table.DataTable().columns.adjust();

            },
        /*
	    click: function(){
            //console.log("click");
	    },
        */
            bgPercentage:{
                table : ".tbl-node-legend",
                column: 4, //index of column, start from 1
                css   : "bg-img-1-red-pixel"
            },
            afterRender: function( _chart ){
                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, {
                    chart: _chart
                }, function (event, widget) {
                    var height = widget.find(".grid-stack-item-content").innerHeight();
                    height    -= widget.find(".filter-bar").outerHeight(true) + 15;
                    event.data.chart.chart.resize({
                        height: height,
                    });
                });
            }
        });
        
        //redraw cLine when changing fMetric
        fMetric.onFilter(function () {
            cLine.redraw();
        });
        //

        var dataFlow = [{
                    object: fMetric,
                    effect: [{
                        object: cLine
                    }]
		                },];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fMetric],

            //charts
					[
            {
              charts: [cLine],
              width: 12
            },
					 ],

            //order of data flux
            [{}]
        );

        return report;
    },
    createNodeReport: function (fPeriod) {
        var DETAIL = {};//data detail of each MAC
        var database = new MMTDrop.Database({collection: "data_mac_real", action: "aggregate", no_group : true, no_override_when_reload: true, raw:true});
        //this is called each time database is reloaded to update parameters of database
        database.updateParameter = function( _old_param ){
          var last5Minute = status_db.time.end - 5*60*1000;
          var lastMinute = status_db.time.end - 60*1000;
          var $match = {};
          $match[ COL.TIMESTAMP.id ] = {$gte: lastMinute, $lte: status_db.time.end };

          $match[ COL.PROBE_ID.id ] = URL_PARAM.probe_id;
          
          var group = { _id : {} };
          //[ COL.TIMESTAMP.id, COL.MAC_SRC.id, COL.PROBE_ID.id ]
          [ COL.MAC_SRC.id, COL.PROBE_ID.id ]
          .forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
          } );
          [ COL.UL_DATA_VOLUME.id, COL.UL_PACKET_COUNT.id, COL.DL_DATA_VOLUME.id, COL.DL_PACKET_COUNT.id,
            COL.DATA_VOLUME.id, COL.PACKET_COUNT.id
          ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
          });
          [ COL.TIMESTAMP.id, COL.PROBE_ID.id, COL.MAC_SRC.id ].forEach( function( el, index){
            group[ el ] = {"$last" : "$"+ el};
          } );
//          [ COL.START_TIME.id ].forEach( function( el, index){
//            group[ el ] = {"$first" : "$"+ el};
//          } );
          return {query: [{$match: $match}, {$group : group}]};
        }
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var lastMinute  = status_db.time.end -   60*1000;
                    var last5Minute = status_db.time.end - 5*60*1000;

                    var obj = {};
                    for (var i in data) {
                        var msg = data[i];

                        var time = msg[COL.TIMESTAMP.id];

                        var mac  = msg[COL.MAC_SRC.id];

                        if (obj[mac] == undefined) {
                            obj[mac] = {
                                "ProbeID"    : msg[COL.PROBE_ID.id],
                                "MACAddress" : mac,
                                "InFrames"   : 0,
                                "OutFrames"  : 0,
                                "InBytes"    : 0,
                                "OutBytes"   : 0,
                                "TotalBytes" : 0,
//                                "StartTime"  : msg[COL.START_TIME.id],
                                "LastTime"   : time,
                            };
                        }
                        if( obj[mac]["LastTime"] < time )
                            obj[mac]["LastTime"] = time;

//                        if( obj[mac]["StartTime"] == undefined )
//                            obj[mac]["StartTime"] = time;
//                        else
//                           if( obj[mac]["StartTime"] > time )
//                              obj[mac]["StartTime"] = time;

                        if( time < lastMinute )
                            continue;

                        /*
                        if( DETAIL[ mac ] == undefined )
                            DETAIL[ mac ] = [];
                        DETAIL[ mac ].push( msg );
                        */

                        //calculate only data from the last minute
                        obj[mac]["InFrames"]       += msg[COL.DL_PACKET_COUNT.id];
                        obj[mac]["OutFrames"]      += msg[COL.UL_PACKET_COUNT.id];
                        obj[mac]["InBytes"]        += msg[COL.DL_DATA_VOLUME.id];
                        obj[mac]["OutBytes"]       += msg[COL.UL_DATA_VOLUME.id];
                        obj[mac]["TotalBytes"]     += msg[COL.DATA_VOLUME.id];
                    }

                    var arr = [];
                    //retain only the machines updating in the last 5 minutes
                    for( var i in obj ){
                        if( obj[i]["LastTime"] >= last5Minute )
                            arr.push( obj[i] );
                    }

                    arr.sort(function (a, b) {
                        return b["TotalBytes"] - a["TotalBytes"];
                    });

                    for (var i = 0; i < arr.length; i++)
                        arr[i]["#"] = i + 1;

                    //Format data
                    for (var i in obj) {
                        var fun = "createPopupReport('mac_real'," //collection
                            + COL.MAC_SRC.id  //key 
                            +",'" + i //id
                            +"','MAC: " + i //title 
                            +"', undefined " //probe_id
                            + ", true" //no_group
                            + ", true" //no_override_when_reload
                            + " )";

                        //convert to time string
//                        obj[i]["StartTime"]   = moment(obj[i]["StartTime"]).format( "YYYY/MM/DD HH:mm:ss" );
                        obj[i]["LastTime"]    = moment(obj[i]["LastTime"]).format( "MM/DD HH:mm:ss" );
                        obj[i]["InFrames"]   = MMTDrop.tools.formatLocaleNumber(obj[i]["InFrames"]);
                        obj[i]["OutFrames"]  = MMTDrop.tools.formatLocaleNumber(obj[i]["OutFrames"]);
                        obj[i]["InBytes"]    = MMTDrop.tools.formatDataVolume(obj[i]["InBytes"]);
                        obj[i]["OutBytes"]   = MMTDrop.tools.formatDataVolume(obj[i]["OutBytes"]);
                        obj[i]["TotalBytes"] = MMTDrop.tools.formatDataVolume(obj[i]["TotalBytes"]);

                        obj[i]["detail"]      = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';
                    }

                     var columns = [{id: "#"       , label: ""           , align:"right"},
                                  {id:"ProbeID"    , label:"Probe ID"    , align:"right"},
                                  {id:"MACAddress" , label:"MAC Address" , align:"right"},
                                  {id:"InFrames"   , label:"In Packets"  , align:"right"},
                                  {id:"OutFrames"  , label:"Out Packets" , align:"right"},
                                  {id:"InBytes"    , label:"In Bytes"    , align:"right"},
                                  {id:"OutBytes"   , label:"Out Bytes"   , align:"right"},
                                  {id:"TotalBytes" , label:"Total Bytes" , align:"right"},
//                                  {id:"StartTime"  , label:"Start Time"  , align:"right"},
                                  {id:"LastTime"   , label:"Last Seen"   , align:"right"},
                                  {id:"detail"     , label:""            , align:"center"}
                      ];
                    return {
                        data: arr,
                        columns: columns
                    };
                }
            },
            chart: {
                "order": [[0, "asc"]],
                dom: "<'row' <'col-sm-6' i><'col-sm-6' f>> <'dataTables_scrollBody overflow-auto-xy't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterEachRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();

                var table = _chart.chart;
                if( table === undefined ) return;

                //table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                    var $div = $('.dataTables_scrollBody');
                    var h = $div.getWidgetContentOfParent().height() - 110;
                    $div.css('height', h);
                    $div.css('margin-top', 10);
                    $div.css('margin-bottom', 10);
                    $div.children().filter("table").css({
                      "border-top" : "thin solid #ddd",
                      "width"      : "100%"
                    });
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
                               + ($widget.position().top ) +'px;">&nbsp;</div>');
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

    createRealtimeTrafficReport: function () {
        var _this = this;
        //get true-traffic given by mmt-probe
        var $match = {
        		//isGen: false //not for the data_total collection
        		};

        var group = { _id : {} };
        [ COL.TIMESTAMP.id , COL.FORMAT_ID.id ].forEach( function( el, index){
          group["_id"][ el ] = "$" + el;
        } );
        [ COL.UL_DATA_VOLUME.id, COL.DL_DATA_VOLUME.id, 
           COL.ACTIVE_FLOWS.id, 
           COL.UL_PACKET_COUNT.id, COL.DL_PACKET_COUNT.id, 
           COL.UL_PAYLOAD_VOLUME.id, COL.DL_PAYLOAD_VOLUME.id,
           //the total is used for No-IP
           COL.DATA_VOLUME.id,  COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id]
        .forEach( function( el, index){
          group[ el ] = {"$sum" : "$" + el};
        });
        [ COL.TIMESTAMP.id , COL.FORMAT_ID.id ].forEach( function( el, index){
          group[ el ] = {"$last" : "$"+ el};
        });
        var database = new MMTDrop.Database({collection: "data_total", action: "aggregate",
          query: [{"$match":$match},{"$group" : group}]});

        var rep = _this.createTrafficReport(database, true);


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

    createTrafficReport: function ( database) {
        const _this = this;
        const fMetric = MMTDrop.filterFactory.createMetricFilter();
        
        var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
                getDataFn: function (db) {
                    var col = fMetric.selectedOption();
                    var cols = [];


                    var period = fPeriod.getDistanceBetweenToSamples();

                    var ylabel = col.label;

                    if (col.id === MMTDrop.constants.StatsColumn.PACKET_COUNT.id) {
                        ylabel += " (pps)";
                    } else if (col.id === MMTDrop.constants.StatsColumn.ACTIVE_FLOWS.id) {
                        ylabel += " (total)";
                        period  = 1;
                    } else {
                        period /= 8; //  bit/second
                        ylabel += " (bps)";
                    }

                    if (col.id !== COL.ACTIVE_FLOWS.id) {
                        cols.push(_this.getCol(col, true)); //in
                        cols.push(_this.getCol(col, false)); //out
                        
                        //total is no-ip for report-id = 99
                        cols.push({
                            id    : col.id,
                            label : "No-IP",
                            isNoIP: true
                                //type : "line"
                        });
                    } else
                        cols.push( col );

                    var obj  = {};
                    var data = db.data();

                    for (var i in data) {
                        var msg   = data[i];
                        var proto = msg[COL.APP_ID.id];
                        var time  = msg[COL.TIMESTAMP.id];
                        var exist = true;

                        //data for this timestamp does not exist before
                        if (obj[time] == undefined) {
                            exist = false;
                            obj[time] = {};
                            obj[time][COL.TIMESTAMP.id] = time;
                        }
                        
                        for (var j in cols) {
                           var id  = cols[j].id;
                           //first time
                           if( ! exist ) 
                               obj[time][id] = 0;
                           
                           var val = ( msg[id] != undefined )? msg[id] : 0;
                           
                           //use 99 for noIP
                           //100 for IP
                           if( cols[j].isNoIP === true && msg[0] == 99 
                        		   || cols[j].isNoIP !== true && msg[0] == 100 ){
                        	   obj[time][id] += val;
                           }
                       }
                    }

                    //divide to get bit/second
                    if( period != 1 )
                       for( var time in obj ){
                          for( var j in cols )
                             obj[time][ cols[j].id  ]  /= period;
                       }
                    
                    cols.unshift( COL.TIMESTAMP );

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
                            time          : status_db.time,
                            sample_period : 1000 * fPeriod.getDistanceBetweenToSamples(),
                            probeStatus   : status_db.probeStatus
                        },
                    };
                }
            },

            chart: {
                data:{
                    type: "line"//step
                },
                color: {
                    pattern: ['orange', 'green', 'gray']
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
