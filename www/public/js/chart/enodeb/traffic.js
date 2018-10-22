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

var isShowAlert = false;

MMTDrop.callback = {
      chart : {
         afterRender : function(){
            //hide loading
            loading.onChartLoad();
            if( URL_PARAM.elem ){
               if( isShowAlert )
                  return;
               isShowAlert = true;
               setTimeout( function(){
                  if( $("a:contains('"+  URL_PARAM.elem +"')").length == 0 )
                     MMTDrop.alert.error("Not found any element having<br/> IP = " + URL_PARAM.elem );
                  else
                     $("a:contains('"+  URL_PARAM.elem +"')").click();
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
            [  COL.PROBE_ID.id, GTP.IP_SRC.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.PROBE_ID.id, GTP.IP_SRC.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            [ GTP.TEIDs.id, COL.IP_SRC.id ].forEach( function( el ){
               group[ el ] = {$addToSet : "$" + el };
            })
            
            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            const project = {};
            [ COL.PROBE_ID.id, GTP.IP_SRC.id, COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               project[ el ] = 1;
            });
            
            project[GTP.TEIDs.id  ] = {
               $reduce: {
                 input: "$" + GTP.TEIDs.id,
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
                  { data: COL.DATA_VOLUME.id,  title: "Data (B)", type: "num", className: "text-right" },
                  { data: COL.PACKET_COUNT.id, title: "#Packets",   type: "num", className: "text-right" },
                  ]
            });
         })

         //when user click on an IP
         window.showDetailUE = function( IP ){
            if( IP != "" ){
               detailDB.__ip = IP;
               detailDB.reload();
            }
            return false;
         };
         
         ///
         const teidDB = MMTDrop.databaseFactory.createStatDB( {
            collection : "data_gtp",
            action : "aggregate",
            query : [],
            raw : true
         } );
         
         teidDB.updateParameter = function( param ){
            //mongoDB aggregate
            const group = { _id : {} };
            [  COL.PROBE_ID.id, COL.TIMESTAMP.id, GTP.IP_SRC.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [  COL.TIMESTAMP.id, GTP.IP_SRC.id, GTP.TEIDs.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });
            
            [ GTP.TEIDs.id ].forEach( function( el ){
               group[ el ] = {$addToSet : "$" + el };
            })
            
            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            const project = {};
            [ COL.PROBE_ID.id, COL.TIMESTAMP.id, GTP.IP_SRC.id, COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               project[ el ] = 1;
            });
            
            project[GTP.TEIDs.id  ] = {
               $reduce: {
                 input: "$" + GTP.TEIDs.id,
                 initialValue: [],
                 in: { $setUnion: [ "$$value", "$$this" ] }
               }
             };
            
            param.query = [{$group: group}, {$project: project}];

            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            //value of match will be filled by UE's IP when user click on one row
            const match = {};
            match[ GTP.IP_SRC.id ] = teidDB.__ip;
            param.query = [{$match: match}, {$group: group}, {$project: project}];
         }

         teidDB.afterReload( function( data ){
            const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
            $detailDlg.$title.html("TEIDs of UE: " + teidDB.__ip );
            $detailDlg.$content.html('<table id="detail-ue" class="table table-striped table-bordered table-condensed dataTable no-footer" width="100%"></table>');
            //console.log($("#detail-ue").html());
            $detailDlg.modal();

            $('#detail-ue').DataTable( {
               data: data,
               columns: [
                  { data: COL.TIMESTAMP.id,    title: "Timestamp", render: MMTDrop.tools.formatDateTime },
                  { data: GTP.TEIDs.id,        title: "#TEIDs", type: "num", className: "text-right",
                     render: function( arr ){ return arr.length; }
                  },
                  { data: GTP.TEIDs.id,        title: "TEIDs", className: "text-right", 
                     render: function( arr ){
                        return arr.sort( function( a, b ){ return a - b; }).join("; ");
                     }
                  },
                  { data: COL.DATA_VOLUME.id,  title: "Data (B)", type: "num", className: "text-right" },
                  { data: COL.PACKET_COUNT.id, title: "#Packets",   type: "num", className: "text-right" },
                  ]
            });
         });
         
         window.showDetailTEID = function( IP ){
            if( IP != "" ){
               teidDB.__ip = IP;
               teidDB.reload();
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

                     var teids = msg[ GTP.TEIDs.id ].sort( function( a, b ){
                        return a-b;
                     } ).join(", ");
                     
                     msg[ GTP.TEIDs.id ] = '<a title="'+ teids +'" onclick="showDetailTEID(\''+ msg[ GTP.IP_SRC.id ] +'\')" >' + msg[GTP.TEIDs.id].length + '</a>';
                     
                     var fun = "createPopupReport('gtp'," //collection
                        + GTP.IP_SRC.id  //key 
                        +",'" + msg[ GTP.IP_SRC.id ] //id
                     +"','IP: " + msg[ GTP.IP_SRC.id ] //title 
                     + "' )";
                     
                     msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';;

                     msg[ GTP.IP_SRC.id ] = '<a title="Click to show detail of this IP" onclick="showDetailUE(\''+ msg[ GTP.IP_SRC.id ] +'\')">' + msg[ GTP.IP_SRC.id ] + '</a>';
                  }
                  return {
                     columns : [
                        {id: GTP.IP_SRC.id, label: "IP of UE"},
                        {id: COL.DATA_VOLUME.id,  align: "right", label: "Data(B)"},
                        {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet"}, 
                        {id: GTP.TEIDs.id, label:"#TEIDs"},
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
      //2 steps:
      //- get list of MME IPs from data_gtp collection
      //- select on data_sctp the documents having IPs as the same as the ones get from step1
      
      const database = MMTDrop.databaseFactory.createStatDB( {
         collection : "data_gtp",
         action : "aggregate",
         query : [{"$group": {"_id": "$" + COL.IP_DST.id, "ip": {"$first": "$" + COL.IP_DST.id}}}],
         raw : true
      });
      
      const databaseSCTP = MMTDrop.databaseFactory.createStatDB( {
         collection : "data_sctp",
         action : "aggregate",
         query : [],
         raw : true
      });
      database.afterReload( function( data ){
       //list of IPs
         const ipList = [];
         for( var i=0; i<data.length; i++ )
            ipList.push( data[i].ip );
         
         const match = {};
         match[ COL.IP_DST.id ] = {"$in": ipList};
         
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

         const param = {};
         param.period = status_db.time, 
         param.period_groupby = fPeriod.selectedOption().id, 

         param.query = [{$match: match},{$group: group}];
         
         databaseSCTP.reload( param, function(){
            cTable.attachTo( databaseSCTP );
            cTable.redraw();
         });
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
         match[ COL.IP_DST.id ] = detailDB.__ip;
         
         const group = { _id : {} };
         [  COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.APP_PATH.id ].forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
         });
         [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
         });
         [ COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id, , COL.APP_PATH.id ].forEach( function( el, index){
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
                     {id: COL.DATA_VOLUME.id,  align: "right", label: "Data (B)"},
                     {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet"}, 
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

          [] 
      );
   },
   
   
   createControlPlaneReporteNodeB: function(){
      //2 steps:
      //- get list of eNodeB IPs from data_gtp collection
      //- select on data_sctp the documents having IPs as the same as the ones get from step1
      
      const database = MMTDrop.databaseFactory.createStatDB( {
         collection : "data_gtp",
         action : "aggregate",
         query : [{"$group": {"_id": "$" + COL.IP_SRC.id, "ip": {"$first": "$" + COL.IP_SRC.id}}}],
         raw : true
      });
      
      const databaseSCTP = MMTDrop.databaseFactory.createStatDB( {
         collection : "data_sctp",
         action : "aggregate",
         query : [],
         raw : true
      });
      database.afterReload( function( data ){
         //list of IPs
         const ipList = [];
         for( var i=0; i<data.length; i++ )
            ipList.push( data[i].ip );
         
         const match = {};
         match[ COL.IP_SRC.id ] = {"$in": ipList};
         
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

         const param = {};
         param.period = status_db.time, 
         param.period_groupby = fPeriod.selectedOption().id, 

         param.query = [{$match: match},{$group: group}];
         
         databaseSCTP.reload( param, function(){
            cTable.attachTo( databaseSCTP );
            cTable.redraw();
         });
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
         match[ COL.IP_SRC.id ] = detailDB.__ip;
         
         const group = { _id : {} };
         [  COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.APP_PATH.id ].forEach( function( el, index){
            group["_id"][ el ] = "$" + el;
         });
         [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
            group[ el ] = {"$sum" : "$" + el};
         });
         [ COL.PROBE_ID.id, COL.TIMESTAMP.id, COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id, COL.APP_PATH.id ].forEach( function( el, index){
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
                     {id: COL.DATA_VOLUME.id,  align: "right", label: "Data (B)"},
                     {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet"}, 
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

         [] 
      );
   }
}