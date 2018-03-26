const arr = [
   {
      id : "user-plane",
      title : "User Plane",
      x : 0,
      y : 7,
      width : 6,
      height : 10,
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
      height : 6,
      type : "warning",
      userData : {
         fn : "createControlPlaneReporteNodeB"
      }
   },{
      id : "control-plane-mme",
      title : "Control Plane: MME",
      x : 7,
      y : 6,
      width : 6,
      height : 4,
      type : "danger",
      userData : {
         fn : "createControlPlaneReportMME"
      }
   }];

const availableReports = {};

MMTDrop.callback = {
      chart : {
         afterRender : loading.onChartLoad
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
            [  COL.PROBE_ID.id, GTP.IP_SRC.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            group["teid"] = {$addToSet : "$" + GTP.TEIDs.id };
            
            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            const project = {};
            [ COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id, COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               project[ el ] = 1;
            });
            
            project.teid = {
               $reduce: {
                 input: "$teid",
                 initialValue: [],
                 in: { $setUnion: [ "$$value", "$$this" ] }
               }
             };
            
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
            [  COL.TIMESTAMP.id, COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id, GTP.IP_DST.id, COL.IP_DST.id, GTP.TEIDs.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            //value of match will be filled by UE's IP when user click on one row
            const match = {};
            match[ GTP.IP_SRC.id ] = detailDB.__ip;
            param.query = [{$match: match}, {$group: group}];
         }

         detailDB.afterReload( function( data ){
            const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
            $detailDlg.$title.html("Detail of UE: " + detailDB.__ip );
            $detailDlg.$content.html('<table id="detail-ue" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
            //console.log($("#detail-ue").html());
            $detailDlg.modal();

            $('#detail-ue').DataTable( {
               data: data,
               columns: [
                  { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
                  { data: COL.IP_SRC.id,       title: "eNodeB" },
                  { data: COL.IP_DST.id,       title: "GW" },
                  { data: GTP.IP_DST.id,       title: "Destination" },
                  { data: GTP.TEIDs.id,        title: "TEIDs",           type: "num", className: "text-right", 
                     render: function( arr ){
                        return arr.sort( function( a, b ){ return a - b; }).join(", ");
                     }
                  },
                  { data: COL.DATA_VOLUME.id,  title: "Data Volume (B)", type: "num", className: "text-right" },
                  { data: COL.PACKET_COUNT.id, title: "Packets Count",   type: "num", className: "text-right" },
                  ]
            });
         })

         //when user click on an IP
         window.showDetailUE = function( dom ){
            const IP = $(dom).text();
            console.log( IP );
            if( IP != "" ){
               detailDB.__ip = IP;
               detailDB.reload();
            }
            return false;
         };

         const cTable = MMTDrop.chartFactory
         .createTable( {
            getData : {
               getDataFn : function ( db ) {
                  const arr = db.data();
                  for( var i=0; i<arr.length; i++ ){
                     var msg = arr[i];

                     var fun = "createPopupReport('gtp'," //collection
                        + GTP.IP_SRC.id  //key 
                        +",'" + msg[ GTP.IP_SRC.id ] //id
                     +"','IP: " + msg[ GTP.IP_SRC.id ] //title 
                     + "' )";

                     msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;

                     msg[ GTP.IP_SRC.id ] = '<a title="Click to show detail of this IP" onclick="showDetailUE(this)">' + msg[ GTP.IP_SRC.id ] + '</a>';
                     
                     var teids = msg["teid"].sort( function( a, b ){
                        return a-b;
                     } ).join(", ")
                     msg[ "teid" ] = '<a href="#" title="'+ teids +'">' + msg["teid"].length + '</a>';
                  }
                  return {
                     columns : [
                        {id: GTP.IP_SRC.id, label: "IP of UE"},
                        {id: COL.DATA_VOLUME.id,  align: "right", label: "Data Volume (B)"},
                        {id: COL.PACKET_COUNT.id, align: "right", label: "Packet Count"}, 
                        {id: "teid", label:"TEID Count"},
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
      const database = MMTDrop.databaseFactory.createStatDB( {
         collection : "data_sctp",
         action : "aggregate",
         query : [],
         raw : true
      });
      database.updateParameter = function( param ){
         //mongoDB aggregate
         const group = { _id : {} };
         [  COL.PROBE_ID.id, COL.IP_DST.id ].forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
         });
         [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
         });
         [ COL.PROBE_ID.id, COL.IP_DST.id, COL.MAC_DST.id ].forEach( function( el, index){
            group[ el ] = {"$first" : "$"+ el};
         });

         param.period = status_db.time, 
         param.period_groupby = fPeriod.selectedOption().id, 

         param.query = [{$group: group}];
      };
      
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
         match[ COL.IP_DST.id ] = detailDB.__ip;
         
         const group = { _id : {} };
         [  COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id ].forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
         });
         [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
         });
         [ COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id ].forEach( function( el, index){
            group[ el ] = {"$first" : "$"+ el};
         });
         
         param.query = [{$match: match}, {$group: group}];
      }

      detailDB.afterReload( function( data ){
         const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
         $detailDlg.$title.html("Detail of control plane traffic of MME " + detailDB.__ip );
         $detailDlg.$content.html('<table id="detail-mme" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
         $detailDlg.modal();

         $('#detail-mme').DataTable( {
            data: data,
            columns: [
               { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
               { data: COL.IP_DST.id,       title: "MME's IP" },
               { data: COL.MAC_DST.id,      title: "MME's MAC" },
               { data: COL.IP_SRC.id,       title: "eNodeB's IP" },
               { data: COL.MAC_SRC.id,      title: "eNodeB's MAC" },
               { data: COL.DATA_VOLUME.id,  title: "Data Volume (B)", type: "num", className: "text-right" },
               { data: COL.PACKET_COUNT.id, title: "Packets Count",   type: "num", className: "text-right" },
               ]
         });
         //console.log( data );
      })

      //when user click on an IP
      window.showDetaileMME = function( dom ){
         const IP = $(dom).text();
         console.log( IP );
         if( IP != "" ){
            detailDB.__ip = IP;
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
                     + COL.IP_DST.id  //key 
                     +",'" + msg[ COL.IP_DST.id ] //id
                  +"','IP: " + msg[ COL.IP_DST.id ] //title 
                  + "' )";

                  msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;

                  msg[ COL.IP_DST.id ] = '<a title="Click to show detail of this IP" onclick="showDetaileMME(this)">' + msg[ COL.IP_DST.id ] + '</a>';
               }
               return {
                  columns : [
                     {id: COL.IP_DST.id, label: "IP of MME"},
                     {id: COL.MAC_DST.id, label: "MAC of MME"},
                     {id: COL.DATA_VOLUME.id,  align: "right", label: "Data Volume (B)"},
                     {id: COL.PACKET_COUNT.id, align: "right", label: "Packet Count"}, 
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
      } );

      return new MMTDrop.Report(
         null,
         database,
         [],
         [ {
               charts : [ cTable],
               width : 12
            }, ],

          [{ object : cTable }] 
      );
   },
   
   
   createControlPlaneReporteNodeB: function(){
      const database = MMTDrop.databaseFactory.createStatDB( {
         collection : "data_sctp",
         action : "aggregate",
         query : [],
         raw : true
      });
      database.updateParameter = function( param ){
         //mongoDB aggregate
         const group = { _id : {} };
         [  COL.PROBE_ID.id, COL.IP_SRC.id ].forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
         });
         [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
         });
         [ COL.PROBE_ID.id, COL.IP_SRC.id, COL.MAC_SRC.id ].forEach( function( el, index){
            group[ el ] = {"$first" : "$"+ el};
         });

         param.period = status_db.time, 
         param.period_groupby = fPeriod.selectedOption().id, 

         param.query = [{$group: group}];
      };
      
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
         match[ COL.IP_SRC.id ] = detailDB.__ip;
         
         const group = { _id : {} };
         [  COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id ].forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
         });
         [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
         });
         [ COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id ].forEach( function( el, index){
            group[ el ] = {"$first" : "$"+ el};
         });
         
         param.query = [{$match: match}, {$group: group}];
      }

      detailDB.afterReload( function( data ){
         const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
         $detailDlg.$title.html("Detail of control plane traffic of eNodeB " + detailDB.__ip );
         $detailDlg.$content.html('<table id="detail-enodeb" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
         $detailDlg.modal();

         $('#detail-enodeb').DataTable( {
            data: data,
            columns: [
               { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
               { data: COL.IP_SRC.id,       title: "eNodeB's IP" },
               { data: COL.MAC_SRC.id,      title: "eNodeB's MAC" },
               { data: COL.IP_DST.id,       title: "MME's MAC" },
               { data: COL.MAC_DST.id,      title: "MME's MAC" },
               { data: COL.DATA_VOLUME.id,  title: "Data Volume (B)", type: "num", className: "text-right" },
               { data: COL.PACKET_COUNT.id, title: "Packets Count",   type: "num", className: "text-right" },
               ]
         });
         //console.log( data );
      })

      //when user click on an IP
      window.showDetaileNodeB = function( dom ){
         const IP = $(dom).text();
         console.log( IP );
         if( IP != "" ){
            detailDB.__ip = IP;
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
                     + COL.IP_SRC.id  //key 
                     +",'" + msg[ COL.IP_SRC.id ] //id
                  +"','IP: " + msg[ COL.IP_SRC.id ] //title 
                  + "' )";

                  msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;

                  msg[ COL.IP_SRC.id ] = '<a title="Click to show detail of this IP" onclick="showDetaileNodeB(this)">' + msg[ COL.IP_SRC.id ] + '</a>';
               }
               return {
                  columns : [
                     {id: COL.IP_SRC.id, label: "IP of eNodeB"},
                     {id: COL.MAC_SRC.id, label: "MAC of eNodeB"},
                     {id: COL.DATA_VOLUME.id,  align: "right", label: "Data Volume (B)"},
                     {id: COL.PACKET_COUNT.id, align: "right", label: "Packet Count"}, 
                     {id: "graph"}
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

          [{ object : cTable }] 
      );
   }
}