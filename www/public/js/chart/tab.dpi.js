var arr = [
    {
        id: "realtime",
        title: "Protocol Hierarchy",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createNodeReport"
        },
    }
];

var availableReports = {
    "createNodeReport": "Protocol Hierarchy",
}



MMTDrop.setOptions({
    format_payload: true
});


//create reports

const LIMIT_SELECT_APP = 5;
var ReportFactory = {
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    createNodeReport: function ( fPeriod ) {
        var _this     = this;

        //this database will be reloaded when user clicks on one row of the left-tree
        //it will be given the parameter corresponding to the selected protocols
        var detail_db = new MMTDrop.Database({collection : "data_app", action : "aggregate"});



        var $match = {isGen: false};
        
        var $group = {_id : {} };
        [ COL.PROBE_ID.id ].forEach( function( el, index){
          $group["_id"][ el ] = "$" + el;
        } );
        $group["_id"]["app_paths"] = { "path" : "$app_paths.path" };
        
        [ COL.DATA_VOLUME.id, COL.PAYLOAD_VOLUME.id, COL.PACKET_COUNT.id, COL.ACTIVE_FLOWS.id
        ].forEach( function( el, index){
          $group[ el ] = {"$sum" : "$" + el};
        });
        [ COL.PROBE_ID.id, COL.APP_ID.id ].forEach( function( el, index){
          $group[ el ] = {"$last" : "$"+ el};
        } );
        $group[COL.APP_PATH.id] = {"$first" : "$app_paths.path"};
        $group[COL.APP_ID.id] = {"$first" : "$app_paths.app"};

        var database = new MMTDrop.Database({collection : "data_app", action: "aggregate", query: [{$match : $match}, { $unwind : "$app_paths" }, {$group: $group} ]} );

        var cTree = MMTDrop.chartFactory.createTree({
            getData: {
                getDataFn: function (db) {
                    var args = [{
                        id: COL.PACKET_COUNT.id,
                        label: "Packets"
                    }];

                    //if (fProbe.selectedOption().id != 0)
                        args.push({
                            id: COL.DATA_VOLUME.id,
                            label: "Data (B)"
                        });

                    var group =  {
                        id: MMTDrop.constants.StatsColumn.APP_PATH.id,
                        label: "Name"
                    };

                    var label = "";
                    if (args.length == 1)
                        label = args[0].label;

                    //id of columns tobe sumUp
                    var cols = [];
                    for (var i in args)
                        cols.push(args[i].id);

                    var data = db.data();
                    cTree.data = data;
                    var obj = MMTDrop.tools.sumByGroups( data,
                        cols, [group.id,
						 MMTDrop.constants.StatsColumn.PROBE_ID.id]);

                    //splite data by probes
                    //probes is an object each key is a probeId and value of key is msg containing this probeId
                    var probes = db.stat.getProbes();
                    var nProbe = probes.length;

                    var APP = {};
                    var data = [];
                    for (var path in obj) {
                        var o = {};
                        o[group.id] = path;
                        APP[ MMTDrop.constants.getAppIdFromPath( path ) ] = 0;

                        var isZero = true;

                        for (var i in args) {
                            var oo = {};
                            var temp = 0;
                            for (var prob in obj[path]) {
                                temp = obj[path][prob][args[i].id];

                                if (!isNaN(temp) && parseInt(temp) != 0)
                                    isZero = false;

                                if( args[i].id == COL.DATA_VOLUME.id)
                                    temp = MMTDrop.tools.formatDataVolume( temp );

                                oo[prob] = temp;
                            }
                            //asign to value if there is only one probe
                            if (nProbe == 1)
                                o[args[i].id] = temp;
                            else
                                o[args[i].id] = oo;
                        }

                        //only add the item o if there data number != 0
                        if (isZero == false)
                            data.push(o);
                    }

                    //calculate total unique app/proto
                    //console.log( APP );
                    cTree.totalProtocols = 0;
                    for( var app in APP )
                        if( app != -1)  //_other
                            cTree.totalProtocols ++;


                    //columns to show. The first column is APP_PATH
                    var columns = [group];

                    for (var i in args) {
                        if (nProbe == 1)
                            columns.push(args[i]);
                        else {
                            columns.push({
                                id: args[i].id,
                                label: args[i].label,
                                probes: probes
                            });
                        }
                    }

                    return {
                        data: data,
                        columns: columns,
                        probes: probes,
                        ylabel: label
                    };

                }
            },
            click: function ( app_path_arr ) {
                if (Array.isArray( app_path_arr ) == false)
                    return;

                //clear the chart
                if( app_path_arr.length == 0 ){
                    detail_db.data([]);
                    cLine.attachTo( detail_db );
                    cLine.redraw();
                    return;
                }

                //show spinner
                waiting.show();
                
                if( app_path_arr.length > LIMIT_SELECT_APP ){
                    app_path_arr.length = LIMIT_SELECT_APP;
                }

                //load data corresponding to the selected apps
                var $match = {isGen: false};
                $match[ "app_paths.path" ] = (app_path_arr.length == 1) ? app_path_arr[0] : {$in : app_path_arr };

                var $group = {_id : {} };
                [ COL.TIMESTAMP.id, COL.PROBE_ID.id ].forEach( function( el, index){
                  $group["_id"][ el ] = "$" + el;
                } );
                $group["_id"]["app_paths"] = { "path" : "$app_paths.path" };
                
                [ COL.DATA_VOLUME.id, COL.PAYLOAD_VOLUME.id, COL.PACKET_COUNT.id, COL.ACTIVE_FLOWS.id
                ].forEach( function( el, index){
                  $group[ el ] = {"$sum" : "$" + el};
                });
                [ COL.PROBE_ID.id, COL.TIMESTAMP.id ].forEach( function( el, index){
                  $group[ el ] = {"$last" : "$"+ el};
                } );
                $group[ COL.APP_PATH.id ] = {"$first" : "$app_paths.path"};
                $group[ COL.APP_ID.id ]   = {"$first" : "$app_paths.app"};
                //sort by asc of timestamp
                var $sort ={};
                [ COL.TIMESTAMP.id ].forEach( function( el, index){
                  $sort[ el ] = 1;
                } );
                var db_options = {period: status_db.time, period_groupby: fPeriod.selectedOption().id, query : [{ $unwind : "$app_paths" }, {$match: $match},  {$group: $group}, {$sort: $sort}] };

                detail_db.reload( db_options, function( new_data ){
                    cLine.attachTo( detail_db );
                    cLine.redraw();
                } );
            },
            afterEachRender: function (_chart) {
                //show total of detected protocol/app
                if( _chart.totalProtocols == undefined )
                    _chart.totalProtocols = 0;
                var str = _chart.totalProtocols +" distinct protocols/applications";

                $("#" + _chart.elemID).append('<div style="font-size:12px; margin-top: 10px; color:green">'+ str +'</div>');

                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, _chart.chart, function (event, widget) {
                    var chart = $("table.treetable tbody");
                    var height = widget.find(".grid-stack-item-content").innerHeight();
                    height -= widget.find(".filter-bar").outerHeight(true) + 80;
                    chart.css({
                        "max-height": height,
                        "height"    : height
                    });
                });
                $widget.trigger("widget-resized", [$widget]);
            }
        });

        var cLine = MMTDrop.chartFactory.createTimeline({
            //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
            getData: {
                getDataFn: function (db) {
                    var colToSum = fMetric.selectedOption().id;
                    var colsToGroup = [MMTDrop.constants.StatsColumn.TIMESTAMP.id,
						                 MMTDrop.constants.StatsColumn.APP_PATH.id];

                    var data = db.data();

                    data = MMTDrop.tools.sumByGroups(data, [colToSum], colsToGroup);

                    var arr = [];
                    var header = [];

                    for (var time in data) {
                        var o = {};
                        o[MMTDrop.constants.StatsColumn.TIMESTAMP.id] = parseInt( time );

                        var msg = data[time];
                        for (var path in msg) {
                            o[path] = msg[path][colToSum];
                            if (header.indexOf(path) == -1)
                                header.push(path);
                        }
                        arr.push(o);
                    }

                    var time_id = 3;
                    var period_sampling = 1000 * fPeriod.getDistanceBetweenToSamples();

                    var columns = [MMTDrop.constants.StatsColumn.TIMESTAMP];
                    for (var i = 0; i < header.length; i++) {
                        var path = header[i];
                        columns.push({
                            id: path,
                            label: MMTDrop.constants.getPathFriendlyName(path)
                        });
                    }

                    var $widget = $("#" + cLine.elemID).getWidgetParent();
                    var height = $widget.find(".grid-stack-item-content").innerHeight();
                        height -= $widget.find(".filter-bar").outerHeight(true) + 15;

                    return {
                        data: arr,
                        columns: columns,
                        ylabel : fMetric.selectedOption().label + " (total)",
                        height : height,
                        addZeroPoints:{
                            time_id       : 3,
                            time          : status_db.time,
                            sample_period : 1000 * fPeriod.getDistanceBetweenToSamples(),
                            probeStatus   : status_db.probeStatus,
                        },
                    };
                },
            },
            chart: {
                data:{
                    type: "line"
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
                tooltip:{
                    format: {
                        title:  _this.formatTime
                    }
                },
            },
            afterEachRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, _chart.chart, function (event, widget) {
                    var chart = event.data;
                    var height = $widget.find(".grid-stack-item-content").innerHeight();
                    height -= $widget.find(".filter-bar").outerHeight(true) + 15;
                    chart.resize({
                        height: height
                    });
                });


                $(".col-md-4").css("width", "200px !important;");
                
                //hide spinner
                waiting.hide();
            }
        });

        var fMetric = MMTDrop.filterFactory.createMetricFilter();

        //redraw cLine when changing fMetric
        fMetric.onFilter(function () {
            cLine.redraw();
        });
        var report = new MMTDrop.Report(
            // title
            "",

            // database
            database,

            // filers
					[fMetric],

            //charts
					[
                {
                    charts: [cTree],
                    width: 4
                },
                {
                    charts: [cLine],
                    width: 8
                },
					 ],

            //order of data flux
            [{  object: cTree }]
        );
        return report;
    },
}
