var arr = [
    {
        id: "response_time",
        title: "Transactions Details",
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
      var COL     = MMTDrop.constants.StatsColumn;
      var HTTP    = MMTDrop.constants.HttpStatsColumn;
      var TLS     = MMTDrop.constants.TlsStatsColumn;
      var RTP     = MMTDrop.constants.RtpStatsColumn;
      var FORMAT  = MMTDrop.constants.CsvFormat;

      var $match = {};
      $match[COL.TIMESTAMP.id ] = URL_PARAM.ts;
      //only session protocols
      $match[COL.FORMAT_ID.id ] = MMTDrop.constants.CsvFormat.STATS_FORMAT;
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


      var database = MMTDrop.databaseFactory.createStatDB({ collection: "data_session", action : "find", query: [{$match: $match}], period_groupby: URL_PARAM.groupby, no_override_when_reload: true });

      var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var columns = [{id: COL.START_TIME.id, label: "Start Time", align:"left"},
                                   {id: COL.PORT_SRC.id  , label: "Src. Port" , align:"right"},
                                   {id: COL.PORT_DEST.id  , label: "Dst. Port" , align:"right"},
                                   {id: COL.APP_PATH.id  , label: "Proto. Path"    , align:"left"},
                                  ];

                    var colSum = [

                        //{id: COL.RTT.id                , label: "NRT (ms)"    , align:"right"},
                        //{id: HTTP.RESPONSE_TIME.id     , label: "ART (ms)"    , align:"right"},
                        //{id: HTTP.DATA_TRANSFER_TIME.id, label: "ART (ms)"    , align:"right"},
                        //{id: COL.UL_DATA_VOLUME.id     , label: "Up. (B)"     , align:"right"},
                        //{id: COL.UL_PACKET_COUNT.id    , label: "Up. (pkt)"   , align:"right"},
                        //{id: COL.DL_DATA_VOLUME.id     , label: "Down. (B)"   , align:"right"},
                        //{id: COL.DL_PACKET_COUNT.id    , label: "Down. (pkt)" , align:"right"},

                        //{id: COL.RETRANSMISSION_COUNT.id, label: "#Retran. (pkt)"   , align:"right"},
                    ];
                    var otherCols = [
                        { id: HTTP.METHOD.id   , label: HTTP.METHOD.label},
                        { id: HTTP.URI.id      , label: HTTP.URI.label},
                        { id: HTTP.RESPONSE.id , label: HTTP.RESPONSE.label},
                        { id: HTTP.MIME_TYPE.id, label: "MIME"     , align:"left"},
                        { id: HTTP.REFERER.id  , label: "Referer"  , align:"left"},
                    ];

                    function formatString( str, len ){
                      len = len || 50;
                      if( len > str.length )
                        return str;
                      var new_str = str.substr( 0, len ) + "...";
                      return '<span title="'+ str +'">'+ new_str +'</span>';
                    }
                    var data = db.data();

                    var arr = [];
                    var havingOther = false;

                    for( var i in data){
                        var msg     = data[i];

                        var format  = msg [ COL.FORMAT_TYPE.id ];
                        var obj     = {};

                        obj[ COL.START_TIME.id ]    = moment( msg[COL.START_TIME.id] ).format("YYYY/MM/DD HH:mm:ss");
                        obj[ COL.APP_PATH.id ]      = MMTDrop.constants.getPathFriendlyName( msg[ COL.APP_PATH.id ] );
                        obj[ COL.UL_DATA_VOLUME.id] = msg[ COL.UL_DATA_VOLUME.id];
                        obj[ COL.DL_DATA_VOLUME.id] = msg[ COL.DL_DATA_VOLUME.id];
                        obj[ COL.IP_SRC.id]         = msg[ COL.IP_SRC.id]; // ip
                        obj[ COL.PORT_SRC.id ]      = msg[ COL.PORT_SRC.id ];
                        obj[ COL.PORT_DEST.id ]     = msg[ COL.PORT_DEST.id ];

                        for( var j in colSum ){
                                var val = msg[ colSum[j].id ];
                                if( val == undefined )
                                    val = 0;
                            obj[ colSum[j].id ] = val;
                        }

                        obj.EURT = msg[ COL.RTT.id ] + msg[ HTTP.RESPONSE_TIME.id ] + msg[ HTTP.DATA_TRANSFER_TIME.id ];

                        for( var i in otherCols ){
                            var c   = otherCols[i];
                            var val = msg[ c.id ];
                            if( val != undefined && val != ""){
                                obj[ c.id ]  = formatString( val );
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
                                if( arr[j][ c.id ] == undefined )
                                    arr[j][ c.id ] = "";
                        }
                    }

                    columns = columns.concat( [
                      {id:"EURT", label: "EURT (ms)", align: "right"}
                    ]);
                    columns = columns.concat( colSum );
                    columns.unshift( {id: "index", label: ""});

                    for( var i=0; i<arr.length; i++ ){
                        arr[i][ COL.UL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( arr[i][ COL.UL_DATA_VOLUME.id ] );
                        arr[i][ COL.DL_DATA_VOLUME.id ] = MMTDrop.tools.formatDataVolume( arr[i][ COL.DL_DATA_VOLUME.id ] );
                        arr[i].index = i+1;

                        arr[i][ "EURT" ] = self.formatRTT( arr[i][ "EURT" ] );

                        arr[i][ "EURT" ] = '<a onclick="loadDetail()">' + arr[i][ "EURT" ] + '</a>'
                    }
                  return {
                      data: arr,
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
                    var h = $div.getWidgetContentOfParent().height() - 120;
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
          [{object: cTable}]
      );
      return report;
    },
}


function loadDetail( msg ) {

    if ($("#modalWindow").length === 0) {
      var modal = '<div class="modal modal-wide fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">' +
          '<div class="modal-dialog">' +
          '<div class="modal-content" >' +
          '<div class="modal-header">' +
          '<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>' +
          '<h4 class="modal-title">Detail</h4>' +
          '</div>' +
          '<div class="modal-body code-json">' +
          '<div id="detailItem"/>' +
          '<div id="popupTable"/>' +
          '</div>' +
          '</div></div></div>';

      $("body").append($(modal));
    }

    $("#detailItem").html('<strong>Interval: </strong> from ');
    $("#modalWindow").modal();
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
