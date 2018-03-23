const arr = [
   {
      id : "user-plane",
      title : "User Plane",
      x : 0,
      y : 7,
      width : 6,
      height : 8,
      type : "success",
      userData : {
         fn : "createUserPlaneReport"
      }
   },{
      id : "control-plane",
      title : "Control Plane",
      x : 7,
      y : 7,
      width : 6,
      height : 8,
      type : "warning",
      userData : {
         fn : "createControlPlaneReport"
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
            const teidCount = { _id: {}};
            [  COL.PROBE_ID.id, GTP.IP_SRC.id, GTP.TEID_1.id, GTP.TEID_2.id
               ].forEach( function( el, index){
                  teidCount["_id"][ el ] = "$" + el;
               });

            teidCount["teid"] = {"$sum": 1};

            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               teidCount[ el ] = {"$sum" : "$" + el};
            });
            [ COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id ].forEach( function( el, index){
               teidCount[ el ] = {"$first" : "$"+ el};
            });

            const group = { _id : {} };
            [  COL.PROBE_ID.id, GTP.IP_SRC.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id, "teid" ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            param.period = status_db.time, 
            param.period_groupby = fPeriod.selectedOption().id, 

            param.query = [{$group: teidCount}, {$group: group}];
            //param.query = [{$match : $match.match}, {$group: group}, {$sort: sort}, {$limit: 100}];
         }


         const detailUEDB = MMTDrop.databaseFactory.createStatDB( {
            collection : "data_gtp",
            action : "aggregate",
            query : [],
            raw : true
         } );
         detailUEDB.updateParameter = function( param ){

            //mongoDB aggregate
            const group = { _id : {} };
            [  COL.PROBE_ID.id, GTP.IP_SRC.id, GTP.IP_DST.id, COL.IP_SRC.id, COL.IP_DST.id, GTP.TEID_1.id, GTP.TEID_2.id  ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            });
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [  COL.TIMESTAMP.id, COL.PROBE_ID.id, GTP.IP_SRC.id, COL.IP_SRC.id, GTP.IP_DST.id, COL.IP_DST.id, GTP.TEID_1.id, GTP.TEID_2.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });

            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;

            //value of match will be filled by UE's IP when user click on one row
            const match = {};
            match[ GTP.IP_SRC.id ] = detailUEDB.__ip;
            param.query = [{$match: match}, {$group: group}];
         }

         detailUEDB.afterReload( function( data ){
            const $detailDlg = MMTDrop.tools.getModalWindow("ue-detail");
            $detailDlg.$title.html("Detail of UE: " + detailUEDB.__ip );
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
                  { data: GTP.TEID_1.id,       title: "TEID 1",          type: "num", className: "text-right" },
                  { data: GTP.TEID_2.id,       title: "TEID 2",          type: "num", className: "text-right" },
                  { data: COL.DATA_VOLUME.id,  title: "Data Volume (B)", type: "num", className: "text-right" },
                  { data: COL.PACKET_COUNT.id, title: "Packets Count",   type: "num", className: "text-right" },
                  ]
            });
            console.log( data );
         })

         //when user click on an IP
         window.showDetailUE = function( dom ){
            const IP = $(dom).text();
            console.log( IP );
            if( IP != "" ){
               detailUEDB.__ip = IP;
               detailUEDB.reload();
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
               "order" : [
                  [
                     0, "asc"]],
                     dom : "<'row' <'col-sm-9'<'#mmt-verdict-total'>><'col-sm-3'f>><'dataTables_scrollBody overflow-auto-xy row-cursor-pointer't><'row'<'col-sm-3'l><'col-sm-9'p>>",
            },
            afterEachRender : function ( _chart ) {
               // /configuration of interface: arrange components
               // hide the filers of report (not the one of Datatable)
               $( "#report_filters" ).hide();

               var table = _chart.chart;
               if ( table == undefined )
                  return;

               table.on( "draw.dt", function () {
                  var $div = $( '.dataTables_scrollBody' );
                  var h = $div.parents().filter( ".grid-stack-item-content" )
                  .height() - 120;
                  $div.css( 'height', h );
                  $div.css( 'margin-top', 10 );
                  $div.css( 'margin-bottom', 10 );
                  $div.children().filter( "table" ).css( "border-top",
                  "thin solid #ddd" );
               } );

               // jump to the last page of table
               table.api().page( 'last' );

               // show 10 items/page
               table.DataTable().page.len( 10 ).draw( false ); // either 5, 10,
               // 25, 50, 100

               // resize when changing window size
               $( window ).resize( function () {
                  if ( table )
                     table.api().draw( false );
               } );
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
                  charts : [
                     cTable],
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
   createControlPlaneReport: function(){
      
   }
}