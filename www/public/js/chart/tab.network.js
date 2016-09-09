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
        id: "top_profile",
        title: "Top Profiles",
        x: 6,
        y: 0,
        width: 6,
        height: 9,
        type: "success",
        userData: {
            fn: "createTopProfileReport"
        },
    },
    {
        id: "top_location",
        title: "Top Geo Locations",
        x: 0,
        y: 9,
        width: 6,
        height: 9,
        type: "warning",
        userData: {
            fn: "createTopLocationReport"
        },
    },
    {
        id: "top_link",
        title: "Top Links",
        x: 6,
        y: 9,
        width: 6,
        height: 9,
        type: "danger",
        userData: {
            fn: "createTopLinkReport"
        },
    },
];

var availableReports = {
    "createTopUserReport"     : "Top Users",
    "createTopLocationReport" : "Top Geo Locations"
};


function getHMTL( tag ){
    var html = tag[0];
    for( var i=1; i<tag.length; i++)
        html += ' <i class="fa fa-angle-right"/> ' + tag[i];
    return html;
}

//change title of each report
var param = MMTDrop.tools.getURLParameters();
//top profile => detail of 1 profile (list app) => one app
if( param.profile ){
  arr[1].title =  param.profile + " &#10095; "
  if( param.app )
    arr[1].title += param.app;
  else
    arr[1].title += "Top Apps/Protos"
}

//when all paramerters are selected
//==> only one report is shown
if( param.profile && param.app && param.link )
  arr = [{
      id: "detail_location",
      title: "Details",
      x: 0,
      y: 0,
      width: 12,
      height: 6,
      type: "success",
      userData: {
          fn: "createDetailReport"
      },
  },]


//MongoDB match expression
var get_match_query = function( p ){
  var param = MMTDrop.tools.getURLParameters();
  var $match = {};
  if( param.loc )
    $match[ COL.DST_LOCATION.id ] = param.loc;
  if( param.profile )
    $match[ COL.PROFILE_ID.id ] = MMTDrop.constants.getCategoryIdFromName( param.profile );
  if( param.app )
    $match[ COL.APP_ID.id ] = MMTDrop.constants.getProtocolIDFromName( param.app );
  if( param.ip )
    $match[ COL.IP_SRC.id ] = param.ip;
  if( param.link ){
    var link = param.link.split(",");
    $match[ COL.IP_SRC.id ]  = {$in: link};
    $match[ COL.IP_DEST.id ] = {$in: link};
  }

  if( _.isEmpty( $match ))
    return null;
  return {$match: $match};
}

//limit number of rows of a table/number of pies per chart
var LIMIT_SIZE=500;
//create reports
var ReportFactory = {
    /**
     *
     * @param   {[[Type]]}              Detail report of (1) one application/protocol and (2) one local IP and (3) one remote IP
     * @returns {object|string|boolean} [[Description]]
     */
    createDetailReport: function ( ) {
        var self    = this;
        var FORMAT  = MMTDrop.constants.CsvFormat;

        var database = MMTDrop.databaseFactory.createStatDB( {collection: "data_detail", action: "find", no_group : true });
        //this is called each time database is reloaded
        database.updateParameter = function( param ){
          var $match = get_match_query();
          //query by app_id
          if( $match != undefined ){
            param.query = [$match];
          }
        }

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    HISTORY = [];
                    var columns = [{id: COL.START_TIME.id, label: "Start Time"     , align:"left"},
                                   {id: COL.TIMESTAMP.id , label: "Timestamp"      , align:"left"},
                                   {id: COL.IP_DEST.id   , label: "Remote Address" , align:"left"},
                                  COL.APP_PATH];

                    var colSum = [
                        {id: COL.UL_DATA_VOLUME.id, label: "Upload (B)"  , align:"right"},
                        {id: COL.DL_DATA_VOLUME.id, label: "Download (B)", align:"right"},
                    ];
                    var HTTPCols = [
                        { id: HTTP.CONTENT_LENGTH.id, label: "File Size (B)", align: "right"},
                        { id: HTTP.URI.id      , label: HTTP.URI.label},
                        { id: HTTP.METHOD.id   , label: HTTP.METHOD.label},
                        { id: HTTP.RESPONSE.id , label: HTTP.RESPONSE.label},
                        { id: HTTP.MIME_TYPE.id, label: "MIME"     , align:"left"},
                        { id: HTTP.REFERER.id  , label: "Referer"  , align:"left"},

                    ];
                    var SSLCols = [];
                    var RTPCols = [ SSL.SERVER_NAME ];
                    var FTPCols = [
                      FTP.CONNNECTION_TYPE,
                      FTP.USERNAME,
                      FTP.PASSWORD,
                      FTP.FILE_NAME,
                      {id: FTP.FILE_SIZE.id, label: "File Size (B)", align: "right"}
                    ];
                    var otherCols = [];

                    var data = db.data();

                    var arr = [];
                    var havingOther = false;
                    var type = 0;

                    for( var i in data){
                      var msg     = data[i];

                      var format  = msg [ COL.FORMAT_TYPE.id ];
                      var obj     = {};
                      HISTORY.push( msg );

                      obj[ COL.START_TIME.id ]    = moment( msg[COL.START_TIME.id] ).format("YYYY/MM/DD HH:mm:ss");
                      obj[ COL.TIMESTAMP.id ]     = moment( msg[COL.TIMESTAMP.id] ).format("YYYY/MM/DD HH:mm:ss");
                      obj[ COL.APP_PATH.id ]      = MMTDrop.constants.getPathFriendlyName( msg[ COL.APP_PATH.id ] );
                      obj[ COL.FORMAT_TYPE.id ]   = msg[ COL.FORMAT_TYPE.id ];
                      var host =  "";
                      if( type == 0 || type == undefined)
                        type = msg[ COL.FORMAT_TYPE.id ];

                      //HTTP
                      if( type == 1)
                        host =  msg[ HTTP.HOSTNAME.id ];
                      else if( type == 2)
                        host = msg[ SSL.SERVER_NAME.id ];

                      if( host != undefined && host != "" && host !=  msg[COL.IP_DEST.id] ){
                              obj[COL.IP_DEST.id]  = host;
                      }else
                          obj[COL.IP_DEST.id]  = msg[COL.IP_DEST.id]; // ip

                      for( var j in colSum ){
                              var val = msg[ colSum[j].id ];
                              if( val == undefined )
                                  val = 0;
                          obj[ colSum[j].id ] = val;
                      }
                      if( type == 1 )
                        otherCols = HTTPCols;
                      else if ( type == 2 )
                        otherCols = SSLCols;
                      else if ( type == 3 )
                        otherCols = RTPCols;
                      else if ( type == 4 )
                        otherCols = FTPCols;

                      for( var i in otherCols ){
                          var c   = otherCols[i];
                          var val = msg[ c.id ];
                          if( val != undefined && val !== "" && val !== 0 && val !== -1){
                            //if( val == 0 ) val = ""
                            obj[ c.id ]  = MMTDrop.tools.formatString( val, 50 );
                            c.havingData = true;
                          }
                      }

                      arr.push( obj );
                    }

                    for( var i in otherCols ){
                        var c = otherCols[i];
                        if( c.havingData === true ){
                            colSum.push( c );
                            //default value for the rows that have not data of this c
                            for( var j in arr )
                                if( arr[j][ c.id ] == undefined || arr[j][ c.id ] == "null" || arr[j][ c.id ] == "(null)" )
                                    arr[j][ c.id ] = "";
                        }
                    }

                    columns = columns.concat( colSum  );
                    columns.unshift( {id: "index", label: ""});

                    //sort by Download
                    arr.sort( function( a, b ){
                      return b[ COL.DL_DATA_VOLUME.id ] -  a[ COL.DL_DATA_VOLUME.id ];
                    })

                    for( var i=0; i<arr.length; i++ ){
                      var msg = arr[i];
                        msg.index = (i+1);
                        msg[ COL.UL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( msg[ COL.UL_DATA_VOLUME.id ] );
                        msg[ COL.DL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( msg[ COL.DL_DATA_VOLUME.id ] );

                        //HTTP
                        if( msg[ COL.FORMAT_TYPE.id ] == 1 ){
                          if( msg[ HTTP.CONTENT_LENGTH.id ] > 0 )
                            msg[ HTTP.CONTENT_LENGTH.id ] = MMTDrop.tools.formatDataVolume( msg[ HTTP.CONTENT_LENGTH.id ] );
                          else {
                            msg[ HTTP.CONTENT_LENGTH.id ] = "";
                          }
                        }
                        //FTP
                        else if( msg[ COL.FORMAT_TYPE.id ] === 4 ){
                          if( msg[ FTP.CONNNECTION_TYPE.id ] == 1 )
                            msg[ FTP.CONNNECTION_TYPE.id ] = "Connection";
                          else
                            msg[ FTP.CONNNECTION_TYPE.id ] = "Data";
                          msg[ FTP.FILE_SIZE.id ] = MMTDrop.tools.formatDataVolume( msg[ FTP.FILE_SIZE.id ] );

                          if( msg[FTP.USERNAME.id] == 0 ) msg[FTP.USERNAME.id] = "";
                          if( msg[FTP.PASSWORD.id] == 0 ) msg[FTP.PASSWORD.id] = "";
                        }
                    }
                    return {
                        data   : arr,
                        columns: columns,
                    };
                }
            },
            chart: {
                "paging": true,
                "info"  : true,
                //"dom"   : '<"detail-table table-inside-table row-cursor-default" t><<"col-sm-3"i><"col-sm-3"f><"col-sm-6"p>>',
                dom: "<'dataTables_wrapper form-inline dt-bootstrap no-footer'"
                  + "<'row' <'col-sm-6' i> <'col-sm-6' f> >"
                  + "<'dataTables_mix overflow-auto-xy't>"
                  + "<'row'<'col-sm-3'l><'col-sm-9'p>> >",
                "scrollY" : "300px",
                "scrollX" : true,
                "scrollCollapse": true,
                deferRender: true,
            },

            afterEachRender: function (_chart) {
                var table = _chart.chart;
                if( table === undefined ) return;

                table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                  //scrolldiv contain table( header+content) + info + search box + paging
                    var $div = $('.dataTables_mix');
                    var h = $div.getWidgetContentOfParent().height() - 90;
                    $div.css('height', h);

                    //scrolldiv contains only body of table
                    $div.find(".dataTables_scrollBody").css({
                          "max-height"   : (h-50) + "px",
                          "border-bottom": "thin solid #ddd"
                        });
                });
                table.trigger("draw.dt");

                var $widget = $("#" + _chart.elemID).getWidgetParent();
                //resize when changing window size
                $widget.on("widget-resized", null, table, function (event, widget) {
                    if (event.data){
                        event.data.api().draw(false);
                    }
                });
                $widget.trigger("widget-resized", [$widget]);
            }
        });

        var report = new MMTDrop.Report(
            // title
            null,
            // database
            database,
            // filers
          [],
            //charts
          [
            {
                charts: [cTable],
                width: 12
            },
           ],
            //order of data flux
            [{ object:cTable }]
        );
        return report;

    },

    createTopProfileReport: function (filter, ip) {
        var self = this;
        //mongoDB aggregate
        var group  = { _id : {} };

        [ COL.PROFILE_ID.id ].forEach( function( el, index){
          group["_id"][ el ] = "$" + el;
        } );
        [ COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id ].forEach( function( el, index){
          group[ el ] = {"$sum" : "$" + el};
        });
        [ COL.TIMESTAMP.id ,COL.PROBE_ID.id, COL.FORMAT_ID.id, COL.PROFILE_ID.id].forEach( function( el, index){
          group[ el ] = {"$first" : "$"+ el};
        } );

        var query_by_app = URL_PARAM.profile!== undefined;
        //param.raw = true;

        //isGen:false => select only app/proto given by mmt-probe
        //mmt-operator generates also parent protos of them to get hierarchy
        var database = MMTDrop.databaseFactory.createStatDB( {collection: "data_session", action: "aggregate", query: [{$match:{isGen: false}},{$group: group}]} );

        //this is called each time database is reloaded
        database.updateParameter = function( param ){
          var $match = get_match_query();
          //query by app_id
          if( $match != undefined ){
            param.query = [$match, {$group: group}];

            group._id = {};
            [ COL.APP_ID.id ].forEach( function( el, index){
              group["_id"][ el ] = "$" + el;
            });

            [ COL.APP_ID.id].forEach( function( el, index){
              group[ el ] = {"$first" : "$"+ el};
            } );
          }
          return param;
        }
        var fProbe   = MMTDrop.filterFactory.createProbeFilter();
        var fMetric  = MMTDrop.filterFactory.createMetricFilter();

        var cPie = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = fMetric.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    var obj = {};
                    if( query_by_app )
                      obj = db.stat.splitDataByApp();
                    else
                      obj = db.stat.splitDataByClass();

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

                        var name = "";
                        if( query_by_app )
                          name = MMTDrop.constants.getProtocolNameFromID(cls);
                        else
                          name = MMTDrop.constants.getCategoryNameFromID(cls);

                        data.push({
                            "key": name,
                            "val": v,
                            "cls": cls,
                        });

                        cPie.dataLegend.data[name] = {val: v, cls: cls};
                        cPie.dataLegend.dataTotal += v;
                    }


                    data.sort(function (a, b) {
                        return b.val - a.val;
                    });

                    var top = 7;
                    if( cPie.showAll === true && data.length > LIMIT_SIZE ){
                        top = LIMIT_SIZE;
                        cPie.showAll = false;
                    }

                    if( data.length > top+2 && cPie.showAll !== true){
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
                            cPie.dataLegend.data[o.key] = {val: o.val, cls: o.cls};
                        }
                    }
                    cPie.dataLegend.length = data.length;

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
            bgPercentage:{
                table : ".tbl-top-profiles",
                column: 4, //index of column, start from 1
                css   : "bg-img-1-red-pixel"
            },
            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-condensed tbl-top-profiles"
                });
                $table.appendTo($("#" + _chart.elemID));
                var title = "Profile";
                if( query_by_app ) title = "Application/Protocol"
                $("<thead><tr><th></th><th width='50%'>"+ title +"</th><th>" + legend.label + "</th><th>Percent</th><th></th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    if( key == "Other")
                        continue;

                    i++;
                    var val = legend.data[key].val;
                    var cls = parseInt( legend.data[key].cls );

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

                      var $a = null;
                      if( query_by_app ){
                        if( legend.length == 1 && key == MMTDrop.tools.getURLParameters("app") ){
                          $("<td>",{
                            html : key
                          }).appendTo($tr);
                        }else{
                          $a = $("<a>", {
                             href : MMTDrop.tools.getCurrentURL(["loc", "link", "ip", "profile"], "app=" + key ),
                             title: "click to show detail of this application/protocol",
                             text : key,
                           });
                           $("<td>").append($a).appendTo( $tr );
                         }
                      }else{
                       $a = $("<a>", {
                          href : MMTDrop.tools.getCurrentURL(["loc", "link", "ip"], "profile=" + key ),
                          title: "click to show detail of this profile",
                          text : key,

                        });
                        $("<td>").append($a).appendTo($tr);
                      }

                    $("<td>", {align: "right"}).text(  MMTDrop.tools.formatDataVolume( val ) ).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text": Math.round(val * 10000 / legend.dataTotal) / 100 + "%"
                    }).appendTo($tr);

                    var fun = "";
                    if( query_by_app ){
                      fun = "createPopupReport('app'," //collection
                        + COL.APP_ID.id  +","
                        + cls
                        + ",'Appcation/Protocol: " + key +"')";

                        $("<td>",{
                          "align" : "center",
                          "html"  : '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
                        }).appendTo($tr);

                    }else{
                      var match = {isGen: false};
                      match[ COL.PROFILE_ID.id ] = cls;
                      match = JSON.stringify( match );

                      fun = "createPopupReport('app'," //collection
                        + "'match',"
                        + "this.getAttribute('match')"
                        + ",'Profile: " + key +"')";


                        $("<td>",{
                          "align" : "center",
                          "html"  : '<a title="Click to show graph" onclick="'+ fun +'" match=\''+ match +'\'><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
                        }).appendTo($tr);
                    }


                }
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

                    $("<td>").appendTo($tr);

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
                    ).append(
                      $("<td>")
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]],
                    "scrollY": "240px",
                    "scrollCollapse": true,
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
    createTopLinkReport: function (filter) {
        var self = this;
        //mongoDB aggregate
        var group = { _id : {} };
        [ COL.IP_SRC.id , COL.IP_DEST.id ].forEach( function( el, index){
          group["_id"][ el ] = "$" + el;
        } );
        [ COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id ].forEach( function( el, index){
          group[ el ] = {"$sum" : "$" + el};
        });
        [ COL.TIMESTAMP.id ,COL.PROBE_ID.id, COL.FORMAT_ID.id, COL.IP_SRC.id, COL.IP_DEST.id ].forEach( function( el, index){
          group[ el ] = {"$first" : "$"+ el};
        } );

        var database = MMTDrop.databaseFactory.createStatDB( {collection: "data_session", action: "aggregate", query: [{$group: group}]} );
        database.updateParameter = function( param ){
          var $match = get_match_query();
          if( $match != undefined ){
            param.query = [$match, {$group: group}];
          }
        }

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
                        "label"    : col.label.substr(0, col.label.indexOf(" ")),
                        "data"     : {}
                    };

                    var db_data  = db.data();
                    var sperator = " &#x21cb; ";
                    for( var i=0; i< db_data.length; i++){
                        var val     = db_data[i][ col.id ];
                        var ip_src  = db_data[i][ COL.IP_SRC.id ] ;
                        var ip_dst  = db_data[i][ COL.IP_DEST.id ];
                        var name    = ip_src + sperator + ip_dst;
                        var in_name = ip_dst + sperator + ip_src;

                        //as we do not care dst-src or src-dst
                        //=> if there exists a link dst-src ==> use that
                        if( cPie.dataLegend.data[ in_name ] != undefined ){
                          name = in_name;
                        }else if( cPie.dataLegend.data[name] === undefined )
                            cPie.dataLegend.data[name] = {val: 0, ips: [ip_src, ip_dst]};

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


                    if( cPie.showAll === true && data.length > LIMIT_SIZE ){
                        top = LIMIT_SIZE;
                        cPie.showAll = false;
                    }

                    if( data.length > top+2 && cPie.showAll !== true){
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
                    cPie.dataLegend.length = data.length;

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
            bgPercentage:{
                table : ".tbl-top-link",
                column: 4, //index of column, start from 1
                css   : "bg-img-1-red-pixel"
            },
            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed tbl-top-link"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th>Links</th><th width='20%'>" + legend.label + "</th><th width='20%'>Percent</th><th></th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    if (key == "Other")
                        continue;
                    i++;
                    var val = legend.data[key].val;
                    var ips = legend.data[key].ips;

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

                    var link = ips.join(",");
                    if( legend.length == 1 && link == MMTDrop.tools.getURLParameters("link") ){
                      $("<td>",{
                        html : key
                      }).appendTo($tr);
                    }else{
                      var $label = $("<a>", {
                          html : key,
                          title: "click to show detail of this user",
                          href : MMTDrop.tools.getCurrentURL(["loc", "profile", "ip", "app"], "link="+ link)
                      });

                      $("<td>").append($label).appendTo($tr);
                    }

                    $("<td>", {
                        "text" : MMTDrop.tools.formatDataVolume( val ),
                        "align": "right"
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);

                    var $match = {};
                    $match[ COL.IP_SRC.id ]  = {$in: ips};
                    $match[ COL.IP_DEST.id ] = {$in: ips};
                    $match = JSON.stringify( $match );

                    var fun = "createPopupReport('link'," //collection
                        + "'match',"
                        + "this.getAttribute('match')"
                        + ",'Link: " + key +"')";
                    $("<td>",{
                      "align" : "center",
                      "html"  : '<a title="Click to show graph" onclick="'+ fun +'" match=\''+ $match +'\'><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
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

                    if( i <= 10 ){
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
                    }
                    else
                        $("<td>").append("Other").appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "html":  MMTDrop.tools.formatDataVolume( val ),
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);

                    $("<td>").appendTo($tr);

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
                    ).append(
                      $("<td>")
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]],
                    "scrollY": "240px",
                    "scrollCollapse": true,
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
        //mongoDB aggregate
        var group = { _id : {} };

        [ COL.IP_SRC.id ].forEach( function( el, index){
          group["_id"][ el ] = "$" + el;
        } );
        [ COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id ].forEach( function( el, index){
          group[ el ] = {"$sum" : "$" + el};
        });
        [ COL.TIMESTAMP.id ,COL.PROBE_ID.id, COL.FORMAT_ID.id, COL.IP_SRC.id, COL.MAC_SRC.id ].forEach( function( el, index){
          group[ el ] = {"$first" : "$"+ el};
        } );

        var database = MMTDrop.databaseFactory.createStatDB( {collection: "data_session", action: "aggregate", query: [{$group: group}]} );
        //this is call each time database is reloaded
        database.updateParameter = function( param ){
          var $match = get_match_query();
          if( $match != undefined ){
            param.query = [$match, {$group: group}];
          }
        }

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
                        "label"    : col.label.substr(0, col.label.indexOf(" ")),
                        "data"     : {}
                    };

                    var db_data = db.data();

                    for( var i=0; i< db_data.length; i++){
                        var val  = db_data[i][ col.id ];
                        var name = db_data[i][ COL.IP_SRC.id ];
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


                    if( cPie.showAll === true && data.length >= LIMIT_SIZE ){
                        top = LIMIT_SIZE;
                        cPie.showAll = false;
                    }

                    if( data.length > top+2 && cPie.showAll !== true){
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
                    cPie.dataLegend.length = data.length;
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
            bgPercentage:{
                table : ".tbl-top-users",
                column: 5, //index of column, start from 1
                css   : "bg-img-1-red-pixel"
            },
            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed tbl-top-users"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th width='40%'>Local IP</th><th width='20%'>MAC</th><th width='15%'>" + legend.label + "</th><th width='15%'>Percent</th><th> </th></tr>").appendTo($table);
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
                    if( legend.length == 1 && key == MMTDrop.tools.getURLParameters("ip") ){
                      $("<td>",{
                        html : key
                      }).appendTo($tr);
                    }else{
                      var $label = $("<a>", {
                          text : key,
                          title: "click to show detail of this user",
                          href : MMTDrop.tools.getCurrentURL(["loc", "profile", "link", "app"], "ip="+ key)
                      });

                      $("<td>", {align: "left"}).append($label).appendTo($tr);
                    }

                    $("<td>", {
                        "text" : mac,
                        "align": "left"
                    }).appendTo($tr);


                    $("<td>", {
                        "text" : MMTDrop.tools.formatDataVolume( val ),
                        "align": "right"
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);

                    var fun = "createPopupReport('ip'," //collection
                        + COL.IP_SRC.id +",'"
                        + key
                        + "','IP: " + key +"')";

                    $("<td>",{
                      "align" : "center",
                      "html"  : '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
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

                    if( i <= 10 ){
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
                    }
                    else
                        $("<td>").append("Other").appendTo($tr);

                    $("<td>").appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "html":  MMTDrop.tools.formatDataVolume( val ),
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);

                    $("<td>").appendTo( $tr );

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
                    ).append(
                      $("<td>")
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[4, "desc"]],
                    "scrollY": "240px",
                    "scrollCollapse": true,
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
    createTopLocationReport: function(filter, ip, userData){
        var self = this;
        var COL  = MMTDrop.constants.StatsColumn;

        //mongoDB aggregate
        var group = { _id : {} };

        [ COL.DST_LOCATION.id ].forEach( function( el, index){
          group["_id"][ el ] = "$" + el;
        } );
        [ COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id ].forEach( function( el, index){
          group[ el ] = {"$sum" : "$" + el};
        });
        [ COL.TIMESTAMP.id ,COL.PROBE_ID.id, COL.FORMAT_ID.id, COL.DST_LOCATION.id ].forEach( function( el, index){
          group[ el ] = {"$first" : "$"+ el};
        } );


        var database = MMTDrop.databaseFactory.createStatDB( {collection: "data_session", action: "aggregate", query: [{$group: group}]} );
        //this is called each time database is reloaded
        database.updateParameter = function( param ){
          var $match       = get_match_query();
          if( $match != undefined ){
            param.query = [$match, {$group: group}];
          }
        }

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
                        "label"    : col.label.substr(0, col.label.indexOf(" ")),
                        "data"     : {}
                    };

                    var db_data = db.data();

                    for( var i=0; i< db_data.length; i++){
                        var val  = db_data[i][ col.id ];
                        var name = db_data[i][ COL.DST_LOCATION.id ];

                        if( cPie.dataLegend.data[name] === undefined )
                            cPie.dataLegend.data[name] = {mac: name, val: 0};

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

                    if( cPie.showAll === true && data.length >= LIMIT_SIZE ){
                        top = LIMIT_SIZE;
                        cPie.showAll = false;
                    }

                    if( data.length > top+2 && cPie.showAll !== true){
                        var val = 0;

                        //update data
                        for (var i=top; i<data.length; i++ ){
                            var msg = data[i];
                            val += msg.val;

                            //remove
                            delete( cPie.dataLegend.data[ msg.key ]);
                        }

                        //reset dataLegend
                        cPie.dataLegend.data["Other"] = {val: val};

                        data[top] = {
                            key: "Other",
                            val: val
                        };
                        data.length = top+1;
                    }
                    cPie.dataLegend.length = data.length;
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
            bgPercentage:{
                table : ".tbl-top-locations",
                column: 4, //index of column, start from 1
                css   : "bg-img-1-red-pixel"
            },
            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed tbl-top-locations"
                });
                $table.appendTo($("#" + _chart.elemID));
                $("<thead><tr><th></th><th>Location</th><th width='20%'>" + legend.label + "</th><th width='20%'>Percent</th><th></th></tr>").appendTo($table);
                var i = 0;
                for (var key in legend.data) {
                    if (key == "Other")
                        continue;
                    i++;
                    var val = legend.data[key].val;
                    // var mac = legend.data[key].mac;

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
                            // var id = $(this).data("id");
                            // chart.toggle(id);
                            //$(this).css("background-color", chart.color(id) );
                        })
                        .appendTo($tr);

                    if( legend.length == 1 && key == MMTDrop.tools.getURLParameters("loc") ){
                      $("<td>",{
                        html : key
                      }).appendTo($tr);
                    }else{
                      var $label = $("<a>", {
                          text : key,
                          title: "click to show detail of this location",
                          href : MMTDrop.tools.getCurrentURL(["ip","link","profile", "app"], "loc=" + key),
                      });

                      $("<td>", {align: "left"}).append($label).appendTo($tr);
                    }


                    $("<td>", {
                        "text" : MMTDrop.tools.formatDataVolume( val ),
                        "align": "right"
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);


                    var fun = "createPopupReport('location'," //collection
                        + COL.DST_LOCATION.id +",'"
                        + key
                        + "','Location: " + key +"')";

                    $("<td>",{
                      "align" : "center",
                      "html"  : '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
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

                    if( i <= 10 ){
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
                    }
                    else
                        $("<td>").append("Other").appendTo($tr);

                    // $("<td>").appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "html":  MMTDrop.tools.formatDataVolume( val ),
                    }).appendTo($tr);

                    var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
                    $("<td>", {
                        "align": "right",
                        "text" : percent

                    }).appendTo($tr);

                    $("<td>").appendTo( $tr );

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
                    // ).append(
                    //     $("<td>", {
                    //     })
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
                    ).append(
                      $("<td>")
                    )
                ).appendTo($table);

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    // order: [[4, "desc"]],
                    order: [[3, "desc"]],
                    "scrollY": "240px",
                    "scrollCollapse": true,
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
    }

}


//show hierarchy URL parameters on toolbar
$( breadcrumbs.loadDataFromURL );
