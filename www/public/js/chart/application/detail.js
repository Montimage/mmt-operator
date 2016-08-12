var arr = [
    {
        id: "response_time",
        title: "Details of Flows",
        x: 0,
        y: 0,
        width: 12,
        height: 9,
        type: "success",
        userData: {
            fn: "createDetailReport"
        },
    },
];

var availableReports = {
};

var URL_PARAM = MMTDrop.tools.getURLParameters();
if( URL_PARAM.app == "All")
  delete( URL_PARAM.app );

URL_PARAM.app_id = function(){
  if( URL_PARAM._app_id != undefined )
    return URL_PARAM._app_id;

  URL_PARAM._app_id = MMTDrop.constants.getProtocolIDFromName( URL_PARAM.app );
  return URL_PARAM._app_id;
}

URL_PARAM.ts = parseInt( URL_PARAM.ts );

if( URL_PARAM.ts == 0 || isNaN( URL_PARAM.ts ) ){
  MMTDrop.tools.gotoURL( "../application" );
}

arr[0].title = "Details of Flows at " + MMTDrop.tools.formatDateTime( URL_PARAM.ts );

var COL     = MMTDrop.constants.StatsColumn;
var HTTP    = MMTDrop.constants.HttpStatsColumn;
var TLS     = MMTDrop.constants.TlsStatsColumn;
var RTP     = MMTDrop.constants.RtpStatsColumn;
var FTP     = MMTDrop.constants.FtpStatsColumn;
var FORMAT  = MMTDrop.constants.CsvFormat;

//create reports
var ReportFactory = {
    formatRTT : function( time ){
        return MMTDrop.tools.formatDataVolume( time/1000 );
    },
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    createDetailReport: function (filter) {
      fPeriod.hide();
      fAutoReload.hide();

      var self    = this;

      var database = MMTDrop.databaseFactory.createStatDB({ collection: "data_session", action : "aggregate",
                      period_groupby: URL_PARAM.groupby, no_override_when_reload: true, raw:true });
      database.updateParameter = function( _old_param ){

        //get list of transactions at the moment URL_PARAM.ts;
        var $match = {};
        $match[COL.TIMESTAMP.id ] = URL_PARAM.ts;
        //only session protocols
        $match[COL.FORMAT_ID.id ] = MMTDrop.constants.CsvFormat.STATS_FORMAT;
        //only on TCP: ETH.VLAN?.IP?.*.TCP
        $match[ COL.APP_PATH.id ] = {"$regex" : "^99(\\.\\d+){0,3}.354", "$options" : ""};

        if (URL_PARAM.probe_id )
          $match[ COL.APP_ID.id ] = URL_PARAM.probe_id;
        if (URL_PARAM.app_id() )
          $match[ COL.APP_ID.id ] = URL_PARAM.app_id();
        if (URL_PARAM.ip )
          $match[ COL.IP_SRC.id ] = URL_PARAM.ip;
        if (URL_PARAM.remote )
          $match[ COL.IP_DEST.id ] = URL_PARAM.remote;

        var col_id = COL.IP_DEST.id;
        if( URL_PARAM.remote )//when an IP is selected ==> group by APP
          col_id = COL.APP_ID.id;
        var $group = {};
        $group._id = "$" + COL.SESSION_ID.id;
        $group[ COL.SESSION_ID.id ] = {$first : "$" + COL.SESSION_ID.id};
        return {query: [{$match: $match}, {$group: $group}]};
      }

      var trans_db = MMTDrop.databaseFactory.createStatDB({ collection: "data_session", action : "aggregate",
                      period_groupby: URL_PARAM.groupby });

      database.afterReload(
        //this is called when database is reloaded successfully
        //==> we get list of flows based on the id_list returned by database
        function( id_list ){
          var id_arr = [];
          for( var i in id_list )
            id_arr.push( id_list[i][ COL.SESSION_ID.id ] );

          //get list of transactions at the moment URL_PARAM.ts;
          var $match = {};
          $match[ COL.SESSION_ID.id ] = {$in : id_arr};
          var $group = {};
          $group._id = "$" + COL.SESSION_ID.id;

          [ COL.UL_DATA_VOLUME.id, COL.DL_DATA_VOLUME.id, COL.UL_PACKET_COUNT.id,
               COL.DL_PACKET_COUNT.id, COL.UL_PAYLOAD_VOLUME.id, COL.DL_PAYLOAD_VOLUME.id,
               COL.ACTIVE_FLOWS.id, COL.DATA_VOLUME.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id,
               COL.RTT.id, COL.RTT_AVG_CLIENT.id, COL.RTT_AVG_SERVER.id,
               COL.RTT_MAX_CLIENT.id, COL.RTT_MAX_SERVER.id,
               COL.RTT_MIN_CLIENT.id, COL.RTT_MIN_SERVER.id,
               COL.RETRANSMISSION_COUNT.id,
               COL.DATA_TRANSFER_TIME.id,
               HTTP.RESPONSE_TIME.id, HTTP.TRANSACTIONS_COUNT.id, HTTP.INTERACTION_TIME.id,
               FTP.RESPONSE_TIME.id
          ].forEach( function( el, index){
            $group[ el ] = {"$sum" : "$" + el};
            //group._total["$sum"].push( "$" + el );
          });
          [ COL.APP_ID.id, COL.APP_PATH.id, COL.IP_SRC.id, COL.IP_DEST.id, COL.START_TIME.id,
            COL.PORT_SRC.id, COL.PORT_DEST.id,
            COL.SRC_LOCATION.id, COL.DST_LOCATION.id,

          ].forEach( function( el, index){
            $group[ el ] = {"$first" : "$"+ el};
          } );
          [ COL.TIMESTAMP.id,
            HTTP.CONTENT_CLASS.id, HTTP.HOSTNAME.id, HTTP.MIME_TYPE.id, HTTP.REFERER.id, HTTP.CDN_FLAG.id,
            HTTP.URI.id, HTTP.METHOD.id, HTTP.RESPONSE.id, HTTP.CONTENT_LENGTH.id, HTTP.REQUEST_INDICATOR.id,

            TLS.SERVER_NAME.id,

            FTP.CONNNECTION_TYPE.id, FTP.USERNAME.id, FTP.PASSWORD.id, FTP.FILE_SIZE.id, FTP.FILE_NAME.id,
            FTP.DIRECTION.id, FTP.CONTROL_SESSION_ID.id,

          ].forEach( function( el, index){
            $group[ el ] = {"$last" : "$"+ el};
          } );

          trans_db.reload( {query: [{$match: $match}, {$group: $group}]}, function( data ){
            cTable.attachTo( trans_db );
            cTable.redraw();
          });
      });

      var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var columns = [{id: COL.START_TIME.id            , label: "Start Time"     , align:"left"},
                                   {id: COL.TIMESTAMP.id             , label: "Last Updated"   , align:"left"},
                                   {id: COL.IP_SRC.id                , label: "Local"          , align:"left"},
                                   {id: COL.IP_DEST.id               , label: "Remote"         , align:"left"},
                                   {id: COL.APP_PATH.id              , label: "Proto. Path"    , align:"left"},
                                   {id: COL.UL_PACKET_COUNT.id       , label: "#Up. (pkt)"     , align:"right"},
                                   {id: COL.DL_PACKET_COUNT.id       , label: "#Down. (pkt)"   , align:"right"},
                                   {id: COL.RETRANSMISSION_COUNT.id  , label: "#Retran."       , align:"right"},
                                   {id:"EURT"                        , label: "EURT"           , align: "right"}
                                  ];

                    var otherCols = [
                        { id: HTTP.METHOD.id   , label: HTTP.METHOD.label},
                        { id: HTTP.URI.id      , label: HTTP.URI.label, class: "truncate"},
                        { id: HTTP.RESPONSE.id , label: HTTP.RESPONSE.label},
                        { id: HTTP.MIME_TYPE.id, label: "MIME"     , align:"left"},
                        { id: HTTP.REFERER.id  , label: "Referer"  , align:"left"},
                    ];


                    var data        = db.data();
                    //sort by timestamp
                    data.sort( function( a, b ){
                      var d = a[ COL.TIMESTAMP.id ] - b[ COL.TIMESTAMP.id ];
                      if( d == 0 )
                        return a[ COL.START_TIME.id ] - b[ COL.START_TIME.id ];
                      return d;
                    });
                    window._HISTORY = data;
                    var arr = [];
                    var havingOther = false;

                    for( var i=0; i<data.length; i++){
                        var msg     = data[i];

                        var format  = msg [ COL.FORMAT_TYPE.id ];
                        var obj     = {};
                        obj.index   = i+1;
                        obj[ COL.START_TIME.id ]    = MMTDrop.tools.formatDateTime( msg[COL.START_TIME.id] );
                        obj[ COL.TIMESTAMP.id ]     = MMTDrop.tools.formatDateTime( msg[COL.TIMESTAMP.id] );
                        obj[ COL.APP_PATH.id ]      = MMTDrop.constants.getPathFriendlyName( msg[ COL.APP_PATH.id ] );

                        obj[ COL.UL_DATA_VOLUME.id] = MMTDrop.tools.formatDataVolume( msg[ COL.UL_DATA_VOLUME.id] );
                        obj[ COL.DL_DATA_VOLUME.id] = MMTDrop.tools.formatDataVolume( msg[ COL.DL_DATA_VOLUME.id] );

                        obj[ COL.IP_SRC.id]         = msg[ COL.IP_SRC.id] + ":" + msg[ COL.PORT_SRC.id ]; // ip
                        obj[ COL.IP_DEST.id ]      = msg[ COL.IP_DEST.id] + ":" + msg[ COL.PORT_DEST.id ];


                        obj[ COL.UL_PACKET_COUNT.id] = MMTDrop.tools.formatLocaleNumber( msg[ COL.UL_PACKET_COUNT.id] );
                        obj[ COL.DL_PACKET_COUNT.id] = MMTDrop.tools.formatLocaleNumber( msg[ COL.DL_PACKET_COUNT.id] );
                        obj[ COL.RETRANSMISSION_COUNT.id] = MMTDrop.tools.formatLocaleNumber( msg[ COL.RETRANSMISSION_COUNT.id] );

                        msg[ HTTP.RESPONSE_TIME.id ]     /= 1000; //usec => msec
                        msg[ COL.DATA_TRANSFER_TIME.id ] /= 1000;
                        msg[ COL.RTT.id ]                /= 1000;

                        var val = msg[ COL.RTT.id ] + msg[ HTTP.RESPONSE_TIME.id ] + msg[ COL.DATA_TRANSFER_TIME.id ];
                        var label = MMTDrop.tools.formatInterval( val/1000 );// /1000 : msec => second
                        obj.EURT = '<a onclick="loadDetail('+ i +')">' + label + '</a>';
                        if( URL_PARAM.EURT && val > URL_PARAM.EURT )
                          obj.EURT = '<a onclick="loadDetail('+ i +')" style="color: red;">' + label + '</a>';

                        for( var j in otherCols ){
                            var c   = otherCols[j];
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
                        if( c.havingData === true ){
                            columns.push( c );
                            //default value for the rows that have not data of this c
                            for( var j in arr )
                                if( arr[j][ c.id ] == undefined )
                                    arr[j][ c.id ] = "";
                        }
                    }

                    columns.unshift( {id: "index", label: ""});



                  return {
                      data   : arr,
                      columns: columns
                  };
                }
            },
            chart: {
                "paging": false,
                "info"  : true,
                "scrollY": "290px",
                "scrollX": true,
                "scrollCollapse": true,
                deferRender: true,
            },
            afterEachRender: function( _chart ){
              var $widget = $("#" + _chart.elemID).getWidgetParent();

                var table = _chart.chart;
                if( table === undefined ) return;
                //table.DataTable().columns.adjust();
                table.on("draw.dt", function () {
                    var $div = $('.dataTables_scrollBody');
                    var h = $div.getWidgetContentOfParent().height() - 130;
                    $div.css({'height': h + "px",
                        'max-height'  : h + "px",
                        'border'      : "thin solid #ddd"});
                    //$div.css('margin-top', 10);
                    //$div.css('margin-bottom', 10);
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

                //data table has only one row => show its details
                if( window._HISTORY.length == 1 )
                  loadDetail(0);
            }
        });

      var report = new MMTDrop.Report(
          // title
          null,
          database,
				[],
				[
          {
              charts: [cTable],
              width: 12
          },
				 ],

          //order of data flux
          []
      );
      return report;
    },
}

function createBar( opt ){
  var chart_opt =  {
      bindto: "CHANGE",
      size: {
        height: 100
      },
      padding:{
        top: 0,
        right: 30
      },
      data: {
        columns : [["CHANGE"]],
        groups  : [["CHANGE"]],
        type    : "bar",
        //order: 'desc' // stack order by sum of values descendantly.
        //order: 'asc'  // stack order by sum of values ascendantly.
        order: null   // stack order by data definition.
      },
      color: {
        pattern: ['violet', 'orange', 'DeepSkyBlue']
      },
      axis: {
        rotated: true,
        y : {
          tick : {
            format: function( val ){
              return MMTDrop.tools.formatDataVolume( val );
            },
            count: 5
          },
          label: {
            text    : "CHANGE",
            position: 'outter-right'
          },
          min: 0,
          padding: {
            top   : 0,
            bottom: 0
          }
        },
        x : {
          type      : 'category',
          categories: ["CHANGE"],
        }
      },
      grid: {
        y: {
          show : true,
        }
      },
      bar: {
        width: 30
      },
      tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
              var $$ = this, config = $$.config,
                  titleFormat = config.tooltip_format_title || defaultTitleFormat,
                  nameFormat  = config.tooltip_format_name  || function (name) { return name; },
                  valueFormat = config.tooltip_format_value || defaultValueFormat,
                  text, i, title, value, name, bgcolor;
              for (i = 0; i < d.length; i++) {
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
        grouped: true
      }
    };

    chart_opt = MMTDrop.tools.mergeObjects( chart_opt, opt );
    return c3.generate( chart_opt );
}//end createBar;


function loadDetail( index ) {

    if ($("#modalWindow").length === 0) {
      var modal = '<div class="modal modal-wide fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">' +
          '<div class="modal-dialog">' +
          '<div class="modal-content" >' +
          '<div class="modal-header">' +
          '<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>' +
          '<h4 class="modal-title">Flow Details</h4>' +
          '</div>' +
          '<div class="text-center sub-title"></div>' +
          '<div class="modal-body code-json">' +
          '<div id="detailItem" class="row"/>' +
          '</div></div></div>';
      $("body").append($(modal));
    }
    var msg  = _HISTORY[ index ];

    $("#modalWindow .sub-title").html(
              "<strong>Start time: </strong>" + MMTDrop.tools.formatDateTime( msg[ COL.START_TIME.id ])
              + ", <strong>Last Updated: </strong>" + MMTDrop.tools.formatDateTime( msg[ COL.TIMESTAMP.id ]) + "<br/>"
              + '<strong>Local: </strong>' + msg[ COL.IP_SRC.id ] + ":" + msg[ COL.PORT_SRC.id ]
              + ', <strong>Application: </strong>' + MMTDrop.constants.getPathFriendlyName( msg[ COL.APP_PATH.id ])
              + ', <strong>Remote: </strong>' + msg[ COL.IP_DEST.id ] + ":" + msg[ COL.PORT_DEST.id ] )

    var cols = [ COL.MAC_SRC, COL.MAC_DEST, COL.DST_LOCATION, COL.IP_SRC_INIT_CONNECTION ];
    cols     = MMTDrop.tools.mergeObjects(cols, HTTP);
    cols     = MMTDrop.tools.mergeObjects(cols, TLS);
    cols     = MMTDrop.tools.mergeObjects(cols, FTP);
    cols     = MMTDrop.tools.mergeObjects(cols, RTP);
    var other_dom = [];
    var exclude   = [ HTTP.RESPONSE_TIME.id, COL.DATA_TRANSFER_TIME.id, HTTP.TRANSACTIONS_COUNT.id, FTP.RESPONSE_TIME.id ];
    for( var i in cols ){
      var c   = cols[ i ];
      var val = msg[ c.id ];
      if( val == undefined || val === "" || exclude.indexOf( c.id ) != -1 )
        continue;
      if( c.id == HTTP.INTERACTION_TIME.id && val == 0 )
        continue;
      switch ( c.id ) {
        case COL.IP_SRC_INIT_CONNECTION.id:
          val = val? "yes" : "no";
          break;
        case HTTP.REQUEST_INDICATOR.id:
          val = (val == 0)? "yes" : "no";
          break;
        case HTTP.INTERACTION_TIME.id :
          val = MMTDrop.tools.formatInterval( val/1000000 );
          break;
        case HTTP.CONTENT_LENGTH.id:
          val = (val == 0 ? "unknown" : (MMTDrop.tools.formatDataVolume( val ) + 'B'));
          break;


      }

      other_dom.push({
        type : "<tr>",
        children: [{
          type : "<td>",
          attr : {
            width: '20%',
            style: "width:20%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;",
            title: val,
            text : c.label
          }
        },{
          type : "<td>",
          attr : {
            width: '80%',
            style: "width:80%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;",
            title: val,
            text : val
          }
        }]
      });
    }//end for


    var dom_cfg = {
      type    : "<div>",
      children: [{
        type : "<div>",
        attr : {
          class : "col-sm-6",
        },
        children: [{
          type : "<div>",
          attr : {
            text  : "Performance",
            id    : "detail_perf_header",
            style : "font-weight:bold"
          }
        },{
          type : "<div>",
          attr : {
            id    : "detail_perf_chart",
            style : "height: 100px"
          }
        }]
      },{
        type : "<div>",
        attr : {
          class : "col-sm-6",
        },
        children: [{
          type : "<div>",
          attr : {
            text  : "Usage",
            id    : "detail_usage_header",
            style : "font-weight:bold"
          }
        },{
          type : "<div>",
          attr : {
            id    : "detail_usage_chart",
            style : "height: 100px"
          }
        }]
      },{
        type : "<div>",
        attr : {
          class : "col-sm-6",
        },
        children: [{
          type : "<div>",
          attr : {
            text  : "TCP",
            id    : "detail_tcp_header",
            style : "font-weight:bold"
          }
        },{
          type : "<div>",
          attr : {
            id    : "detail_tcp_chart",
            style : "height: 100px"
          }
        }]
      },{
        type : "<div>",
        attr : {
          class : "col-sm-6",
        },
        children: [{
          type : "<div>",
          attr : {
            text  : "Usage",
            id    : "detail_pkt_header",
            style : "font-weight:bold"
          }
        },{
          type : "<div>",
          attr : {
            id    : "detail_pkt_chart",
            style : "height: 100px",
            //html  : 'loading ...'<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>
          }
        }]
      },{
        type : "<div>",
        attr : {
          class : "col-md-12"
        },
        children:[{
          type : "<div>",
          attr : {
            text: "Others",
            style: "font-weight:bold"
          }
        },{
          type : "<table>",
          attr : {
            class: "col-md-12 table table-striped table-bordered table-condensed nowrap",
            style: "font-size: 12px;table-layout:fixed;"
          },
          children: other_dom
        }]
      }]
    };




    $("#detailItem").html( MMTDrop.tools.createDOM( dom_cfg ) );
    function format_nu( v ){
      if( isNaN( v )) return 0;
      return v;
    };

    $("#modalWindow").modal();
    setTimeout( function(){
      createBar({
        bindto: "#detail_perf_chart",
        data: {
          columns : [["NRT", format_nu( msg[ COL.RTT.id ])/1000 ],
                     ["ART", format_nu( msg[ HTTP.RESPONSE_TIME.id ])/1000 ],
                     ["DTT", format_nu( msg[ COL.DATA_TRANSFER_TIME.id ])/1000 ]
                    ],
          groups  : [["NRT","ART","DTT"]],
        },
        axis: {
          y : {
            label: {
              text    : "Time(ms)",
            }
          },
          x : {
            categories : ["EURT"]
          }
        }
      });

      createBar({
        bindto: "#detail_usage_chart",
        data: {
          columns : [["Request", format_nu( msg[ COL.UL_DATA_VOLUME.id ]) ],
                     ["Response", format_nu( msg[ COL.DL_DATA_VOLUME.id ]) ]
                    ],
          groups  : [["Request","Response"]],
        },
        color: {
          pattern: ['green', 'orange']
        },
        axis: {
          y : {
            label: {
              text    : "Bytes",
            }
          },
          x : {
            categories : ["Bytes"]
          }
        }
      });

      createBar({
        bindto: "#detail_tcp_chart",
        data: {
          columns : [["Retrans."     , format_nu( msg[ COL.RETRANSMISSION_COUNT.id ]) ],
                     ["Out of Order", 0 ]
                    ],
          groups  : [["Retrans.","Out of Order"]],
        },
        color: {
          pattern: ['violet', 'Turquoise']
        },
        axis: {
          y : {
            label: {
              text    : "Packets",
            }
          },
          x : {
            categories : ["Packets"]
          }
        }
      });

      createBar({
        bindto: "#detail_pkt_chart",
        data: {
          columns : [["Request", format_nu( msg[ COL.UL_PACKET_COUNT.id ]) ],
                     ["Response", format_nu( msg[ COL.DL_PACKET_COUNT.id ]) ]
                    ],
          groups  : [["Request","Response"]],
        },
        color: {
          pattern: ['green', 'orange']
        },
        axis: {
          y : {
            label: {
              text : "Packets",
            }
          },
          x : {
            categories : ["Packets"]
          }
        }
      });
    }, 800 )
}


//show hierarchy URL parameters on toolbar
$( function(){
  var obj = MMTDrop.tools.getURLParameters();
  var arr = [];
  var url = null;
  var last = "";
  for( var key in obj ){
    if( key == "groupby")
      continue;
    if( key == "ts" )
      obj[key] = MMTDrop.tools.formatDateTime(new Date( parseInt(obj[key]) ));
    if (url == undefined )
      url = "/chart/application?" + key + "="+ obj[key]
    else
      url += "&"+ key + "=" + obj[key];
    arr.push( '<a href="'+ url +'" title="'+ key +'='+ obj[key] +'">' + obj[key] + '</a>' );
    last = obj[key];
  }
  if( arr.length > 0 )
    arr[ arr.length - 1 ] = last;
  breadcrumbs.setData( arr );
});
