const arr = [
   {
      id : "user-plane",
      title : "User Plane",
      x : 0,
      y : 0,
      width : 6,
      height : 7,
      type : "success",
      userData : {
         fn : "createUserPlaneReport"
      }
   },{
      id : "control-plane-enodeb",
      title : "Control Plane: eNodeB",
      x : 7,
      y : 0,
      width : 6,
      height : 4,
      type : "warning",
      userData : {
         fn : "createControlPlaneReporteNodeB"
      }
   },{
      id : "control-plane-mme",
      title : "Control Plane: MME",
      x : 7,
      y : 4,
      width : 6,
      height : 3,
      type : "danger",
      userData : {
         fn : "createControlPlaneReportMME"
      }
   }];

const availableReports = {};

var isShowAlert = false;

MMTDrop.callback = {
      chart : {
         afterRender : function(){
            //hide loading
            loading.onChartLoad();
            if( URL_PARAM.func ){
               if( isShowAlert )
                  return;
               isShowAlert = true;
               setTimeout( function(){
                  eval( decodeURI( URL_PARAM.func ));
               }, 200 );
            }
         }
      }
};

var ReportFactory = {
      createUserPlaneReport : function ( fPeriod ) {

         const database = MMTDrop.databaseFactory.createStatDB( {
            collection : "data_gtp",
            action : "aggregate",
            query : [],
            raw : true
         });

         database.updateParameter = function( param ){
            //mongoDB aggregate
            const group = { _id : {} };
            [  COL.PROBE_ID.id, GTP.IMSI.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.PROBE_ID.id, GTP.IMSI.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            [ GTP.TEIDs.id, COL.IP_SRC.id ].forEach( function( el ){
               group[ el ] = {$addToSet : "$" + el };
            })

            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            const project = {};
            [ COL.PROBE_ID.id, COL.IP_SRC.id, COL.DATA_VOLUME.id, COL.PACKET_COUNT.id, GTP.IMSI.id ].forEach( function( el, index){
               project[ el ] = 1;
            });

            [ GTP.TEIDs.id ].forEach( function( el ){
               project[ el ] = {
                     $reduce: {
                        input: "$" + el,
                        initialValue: [],
                        in: { $setUnion: [ "$$value", "$$this" ] }
                     }
               };
            });

            param.query = [{$group: group}, {$project: project}];
         }


         const detailDB = MMTDrop.databaseFactory.createStatDB( {
            collection : "data_gtp",
            action : "aggregate",
            query : [],
            raw : true
         } );

         detailDB.updateParameter = function( param ){

            //mongoDB aggregate
            const group = { _id : {} };
            [  COL.PROBE_ID.id, GTP.IP_SRC.id, GTP.IP_DST.id, COL.IP_SRC.id, COL.IP_DST.id, GTP.TEIDs.id  ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [  COL.TIMESTAMP.id, COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id, GTP.IP_DST.id, COL.IP_DST.id, GTP.IMSI.id, GTP.TEIDs.id, GTP.ENB_NAME.id, GTP.MME_NAME.id, COL.DST_LOCATION.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            //value of match will be filled by UE's IP when user click on one row
            const match = {};
            var o = detailDB.__param;
            switch( o.type ){
            case "IP":
               match[ COL.IP_SRC.id ] = o.data;
               break;
            case "IMSI":
               match[ GTP.IMSI.id ] = o.data;
               break;
            case "TEID":
               match[ GTP.TEIDs.id ] = {"$elemMatch": { "$eq": o.data }};
               break;
            }

            param.query = [{$match: match}, {$group: group}];
         }

         detailDB.afterReload( function( data ){
            const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
            $detailDlg.$title.html("Detail of UE: " + detailDB.__param.type + "=" + detailDB.__param.data );
            $detailDlg.$content.html('<table id="detail-ue" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
            //console.log($("#detail-ue").html());
            $detailDlg.modal();

            $('#detail-ue').DataTable( {
               data: data,
               columns: [
                  { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
                  { data: GTP.IMSI.id,         title: "UE IMSI"},
                  { data: COL.IP_SRC.id,       title: "UE IP"},
                  { data: GTP.IP_SRC.id,       title: "eNb IP" },
                  { data: GTP.ENB_NAME.id,     title: "eNb Name" },
                  { data: GTP.MME_NAME.id,     title: "MME Name" },
                  { data: GTP.IP_DST.id,       title: "GW" },
                  { data: COL.IP_DST.id,       title: "IP Dest." },
                  { data: COL.DST_LOCATION.id, title: "Contry Dest." },
                  { data: GTP.TEIDs.id,        title: "TEIDs",   type: "num", className: "text-right", 
                     render: function( arr ){
                        arr = arr.sort( function( a, b ){ return a - b; });
                        return arr.join("; ");
                     }
                  },
                  { data: COL.DATA_VOLUME.id,  title: "Data (B)", type: "num", className: "text-right", render: MMTDrop.tools.formatLocaleNumber },
                  { data: COL.PACKET_COUNT.id, title: "#Packets", type: "num", className: "text-right", render: MMTDrop.tools.formatLocaleNumber },
                  ]
            });
         })

         //when user click on an IP
         window.showDetailUE = function( type, data ){
            detailDB.__param = {type: type, data: data};
            detailDB.reload();
            return false;
         };

         const cTable = MMTDrop.chartFactory
         .createTable( {
            getData : {
               getDataFn : function ( db ) {
                  const arr = db.data();
                  for( var i=0; i<arr.length; i++ ){
                     var msg = arr[i];

                     msg["count"] = msg[GTP.TEIDs.id].length ;

                     msg[ GTP.TEIDs.id ] = msg[ GTP.TEIDs.id ]
                     .sort( function( a, b ){
                        return a-b;
                     } )
                     .map( function( teid ){
                        return '<a title="Click to show detail of this TEID" onclick="showDetailUE(\'TEID\','+ teid +')">' + teid + '</a>';
                     })
                     .join("; ");


                     var fun = "createPopupReport('gtp'," //collection
                        + GTP.IMSI.id  //key 
                        +",'" + msg[ GTP.IMSI.id ] //id
                     +"','IMSI: " + msg[ GTP.IMSI.id ] //title 
                     + "' )";

                     msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;

                     //console.log( msg[ COL.IP_SRC.id ] );
                     var IPs = msg[ COL.IP_SRC.id ];

                     if( ! Array.isArray( IPs ))
                        IPs = [ IPs ];

                     msg[ COL.IP_SRC.id ] =  IPs.map( function( ip ){
                        return '<a title="Click to show detail of this IP" onclick="showDetailUE(\'IP\',\''+ ip +'\')">' + ip + '</a>';
                     }).join("; ");

                     var data = msg[ GTP.IMSI.id ];
                     if( data == null )
                        data = "_unknown";
                     msg[ GTP.IMSI.id ] = '<a title="Click to show detail of this IMSI" onclick="showDetailUE(\'IMSI\',\''+ data +'\')">' + data + '</a>'
                  }
                  return {
                     columns : [
                        GTP.IMSI,
                        {id: COL.IP_SRC.id,                       label: "IPs of UE"},
                        {id: COL.DATA_VOLUME.id,  align: "right", label: "Data (B)", format: MMTDrop.tools.formatLocaleNumber},
                        {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet",  format: MMTDrop.tools.formatLocaleNumber},
                        //{id: "count",             align: "right", label:"#TEIDs"},
                        {id: GTP.TEIDs.id,                        label:"TEIDs"},
                        {id: "graph"}
                        ],
                        data : arr
                  };
               }
            },
            chart : {
               "order" : [ [0, "asc"]],
               "paging": false,
               "scrollCollapse": true,
               "scrollY": "20px",
               dom : "<'row' <'col-sm-9'i><'col-sm-3'f>><'dataTable_UE't>",
            },
            afterEachRender : function ( _chart ) {
               var $widget = $("#" + _chart.elemID).getWidgetParent();
               // /configuration of interface: arrange components
               // hide the filers of report (not the one of Datatable)
               $( "#report_filters" ).hide();

               var table = _chart.chart;
               if ( table == undefined )
                  return;

               table.on( "draw.dt", function () {
                  console.log( "redraw" );
                  var $div = $( '.dataTable_UE' );
                  var h = $div.parents().filter( ".grid-stack-item-content" )
                  .height() - 110;
                  $div.find(".dataTables_scrollBody").css({
                     'max-height' : h,
                     'height' : h,
                     "border-top" : "thin solid #ddd"
                  })
                  .find(".table").css({
                     "border-top": "none"
                  });
               });

               // resize when changing window size
               $widget.on("widget-resized", null, table, function (event, widget) {
                  if (event.data){
                     event.data.api().draw(false);
                  }
               });
               $widget.trigger("widget-resized", [$widget]);
            }
         } );

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
                     charts : [ cTable],
                     width : 12
                  }, ],

                  //order of data flux
                  [
                     {
                        object : cTable
                     }] );

         return report;
      }
,

createControlPlaneReportMME: function(){
   //mongoDB aggregate
   const group = { _id : {} };
   [  COL.PROBE_ID.id, GTP.MME_NAME.id ].forEach( function( el, index){
      group["_id"][ el ] = "$" + el;
   });
   [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
      group[ el ] = {"$sum" : "$" + el};
   });
   [ COL.PROBE_ID.id, GTP.MME_NAME.id, COL.IP_DST.id, COL.MAC_DST.id ].forEach( function( el, index){
      group[ el ] = {"$first" : "$"+ el};
   });


   const database = MMTDrop.databaseFactory.createStatDB( {
      collection : "data_sctp",
      action : "aggregate",
      query : [{$group: group}],
      raw: true
   });


   const detailDB = MMTDrop.databaseFactory.createStatDB( {
      collection : "data_sctp",
      action : "aggregate",
      query : [],
      raw : true
   } );

   detailDB.updateParameter = function( param ){
      param.period = status_db.time;
      param.period_groupby = fPeriod.selectedOption().id;

      //value of match will be filled by UE's IP when user click on one row
      const match = {};
      match[ GTP.MME_NAME.id ] = detailDB.__mme_name;


      const group = { _id : {} };
      [  COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.APP_PATH.id ].forEach( function( el, index){
         group["_id"][ el ] = "$" + el;
      });
      [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
         group[ el ] = {"$sum" : "$" + el};
      });
      [ COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id, , COL.APP_PATH.id, GTP.ENB_NAME.id ].forEach( function( el, index){
         group[ el ] = {"$first" : "$"+ el};
      });

      param.query = [{$match: match}, {$group: group}];
   }

   detailDB.afterReload( function( data ){
      const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
      $detailDlg.$title.html("Detail of control plane traffic of MME " + detailDB.__mme_name );
      $detailDlg.$content.html('<table id="detail-mme" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
      $detailDlg.modal();

      $('#detail-mme').DataTable( {
         data: data,
         columns: [
            { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
            { data: COL.IP_DST.id,       title: "MME's IP" },
            { data: COL.MAC_DST.id,      title: "MME's MAC" },
            { data: GTP.ENB_NAME.id,     title: "eNodeB" },
            { data: COL.IP_SRC.id,       title: "eNodeB's IP" },
            { data: COL.MAC_SRC.id,      title: "eNodeB's MAC" },
            { data: COL.APP_PATH.id,     title: "Proto Hierarchy", render: function( path ){
               //remove unk proto
               if( path.endsWith(".0"))
                  path = path.substr(0, path.length - 2 );
               return MMTDrop.constants.getPathFriendlyName( path );
            }},
            { data: COL.DATA_VOLUME.id,  title: "Data (B)", type: "num",  className: "text-right" },
            { data: COL.PACKET_COUNT.id, title: "#Packets",  type: "num", className: "text-right" },
            ]
      });
      //console.log( data );
   })

   //when user click on an IP
   window.showDetaileMME = function( mme_name ){
      if( mme_name != "" ){
         detailDB.__mme_name = mme_name;
         detailDB.reload();
      }
      return false;
   };

   const cTable = MMTDrop.chartFactory
   .createTable({
      getData : {
         getDataFn : function ( db ) {
            const arr = db.data();
            for( var i=0; i<arr.length; i++ ){
               var msg = arr[i];

               var fun = "createPopupReport('sctp'," //collection
                  + GTP.MME_NAME.id  //key 
                  +",'" + msg[ GTP.MME_NAME.id ] //id
               +"','MME: " + msg[ GTP.MME_NAME.id ] //title 
               + "' )";

               msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;
            }

            return {
               columns : [
                  {id: GTP.MME_NAME.id, label: "Name", format: function( val ){
                     return '<a title="Click to show detail of this MME" onclick="showDetaileMME(\''+ val +'\')">' + val + '</a>';;
                  }},
                  {id: COL.IP_DST.id, label: "IP"},
                  {id: COL.MAC_DST.id, label: "MAC"},
                  {id: COL.DATA_VOLUME.id,  align: "right", label: "Data (B)", format: MMTDrop.tools.formatLocaleNumber},
                  {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet", format: MMTDrop.tools.formatLocaleNumber}, 
                  {id: "graph"}
                  ],
                  data : arr
            };
         }
      },
      chart : {
         "order" : [ [ 0, "asc"]],
         dom : "<'row' <'col-sm-9'i><'col-sm-3'f>><'dataTables_MME't>",
      },
      afterEachRender : function ( _chart ) {
         var $widget = $("#" + _chart.elemID).getWidgetParent();
         // /configuration of interface: arrange components
         // hide the filers of report (not the one of Datatable)
         $( "#report_filters" ).hide();

         var table = _chart.chart;
         if ( table == undefined )
            return;

         table.on( "draw.dt", function () {
            console.log( "redraw" );
            var $div = $( '.dataTable_MME' );
            var h = $div.parents().filter( ".grid-stack-item-content" )
            .height() - 110;
            $div.find(".dataTables_scrollBody").css({
               'max-height' : h,
               'height' : h,
               "border-top" : "thin solid #ddd"
            })
            .find(".table").css({
               "border-top": "none"
            });
         });

         // resize when changing window size
         $widget.on("widget-resized", null, table, function (event, widget) {
            if (event.data){
               event.data.api().draw(false);
            }
         });
         $widget.trigger("widget-resized", [$widget]);
      }
   });

   return new MMTDrop.Report(
         null,
         database,
         [],
         [ {
            charts : [ cTable],
            width : 12
         }, ],

         //order of data flux
         [{object : cTable }]
   );
},


createControlPlaneReporteNodeB: function(){
   //mongoDB aggregate
   const group = { _id : {} };
   [  COL.PROBE_ID.id, GTP.MME_NAME.id ].forEach( function( el, index){
      group["_id"][ el ] = "$" + el;
   });
   [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
      group[ el ] = {"$sum" : "$" + el};
   });
   [ COL.PROBE_ID.id, COL.IP_SRC.id, COL.MAC_SRC.id, GTP.ENB_NAME.id ].forEach( function( el, index){
      group[ el ] = {"$first" : "$"+ el};
   });


   const database = MMTDrop.databaseFactory.createStatDB( {
      collection : "data_sctp",
      action : "aggregate",
      query : [{$group: group}],
      raw : true
   });

   const detailDB = MMTDrop.databaseFactory.createStatDB( {
      collection : "data_sctp",
      action : "aggregate",
      query : [],
      raw : true
   } );
   detailDB.updateParameter = function( param ){
      param.period = status_db.time;
      param.period_groupby = fPeriod.selectedOption().id;

      //value of match will be filled by UE's IP when user click on one row
      const match = {};
      match[ GTP.ENB_NAME.id ] = detailDB.__enb_name;

      const group = { _id : {} };
      [  COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.APP_PATH.id ].forEach( function( el, index){
         group["_id"][ el ] = "$" + el;
      });
      [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
         group[ el ] = {"$sum" : "$" + el};
      });
      [ COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id, COL.APP_PATH.id, GTP.MME_NAME.id ].forEach( function( el, index){
         group[ el ] = {"$first" : "$"+ el};
      });

      param.query = [{$match: match}, {$group: group}];
   }

   detailDB.afterReload( function( data ){
      const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
      $detailDlg.$title.html("Detail of control plane traffic of eNodeB: " + detailDB.__enb_name );
      $detailDlg.$content.html('<table id="detail-enodeb" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
      $detailDlg.modal();

      $('#detail-enodeb').DataTable( {
         data: data,
         columns: [
            { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
            { data: COL.IP_SRC.id,       title: "eNodeB's IP" },
            { data: COL.MAC_SRC.id,      title: "eNodeB's MAC" },
            { data: GTP.MME_NAME.id,     title: "MME" },
            { data: COL.IP_DST.id,       title: "MME's MAC" },
            { data: COL.MAC_DST.id,      title: "MME's MAC" },
            { data: COL.APP_PATH.id,     title: "Proto Hierarchy", render: function( path ){
               //remove unk proto
               if( path.endsWith(".0"))
                  path = path.substr(0, path.length - 2 );
               return MMTDrop.constants.getPathFriendlyName( path );
            }},
            { data: COL.DATA_VOLUME.id,  title: "Data (B)", type: "num", className: "text-right" },
            { data: COL.PACKET_COUNT.id, title: "#Packets", type: "num", className: "text-right" },
            ]
      });
      //console.log( data );
   })

   //when user click on an IP
   window.showDetaileNodeB = function( enb_name ){
      detailDB.__enb_name = enb_name;
      detailDB.reload();
      return false;
   };

   const cTable = MMTDrop.chartFactory
   .createTable({
      getData : {
         getDataFn : function ( db ) {
            const arr = db.data();
            return {
               columns : [
                  {id: GTP.ENB_NAME.id, label: "Name", format: function(val){
                     return '<a title="Click to show detail of this eNodeB" onclick="showDetaileNodeB(\''+ val +'\')">' + val + '</a>';
                  }},
                  {id: COL.IP_SRC.id, label: "IP of eNodeB"},
                  {id: COL.MAC_SRC.id, label: "MAC of eNodeB"},
                  {id: COL.DATA_VOLUME.id,  align: "right", label: "Data (B)"},
                  {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet"}, 
                  {id: "graph", format : function(val, msg){
                     var fun = "createPopupReport('sctp'," //collection
                        + GTP.ENB_NAME.id  //key 
                        +",'" + msg[ GTP.ENB_NAME.id ] //id
                     +"','eNodeB: " + msg[ GTP.ENB_NAME.id ] //title 
                     + "' )";

                     return '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;
                  }}
                  ],
                  data : arr
            };
         }
      },
      chart : {
         "order" : [ [ 0, "asc"]],
         "paging": false,
         dom : "<'row' <'col-sm-9'i><'col-sm-3'f>><'dataTables_eNodeB't>",
      },
      afterEachRender : function ( _chart ) {
         var $widget = $("#" + _chart.elemID).getWidgetParent();
         // /configuration of interface: arrange components
         // hide the filers of report (not the one of Datatable)
         $( "#report_filters" ).hide();

         var table = _chart.chart;
         if ( table == undefined )
            return;

         table.on( "draw.dt", function () {
            console.log( "redraw" );
            var $div = $( '.dataTable_UE' );
            var h = $div.parents().filter( ".grid-stack-item-content" )
            .height() - 110;
            $div.find(".dataTables_scrollBody").css({
               'max-height' : h,
               'height' : h,
               "border-top" : "thin solid #ddd"
            })
            .find(".table").css({
               "border-top": "none"
            });
         });

         // resize when changing window size
         $widget.on("widget-resized", null, table, function (event, widget) {
            if (event.data){
               event.data.api().draw(false);
            }
         });
         $widget.trigger("widget-resized", [$widget]);
      }
   } );

   return new MMTDrop.Report(
         // title
         null,
         database,
         [],
         [ {
            charts : [ cTable],
            width : 12
         }, ],

         [{object: cTable}] 
   );
}
}