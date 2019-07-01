const arr = [
   {
      id : "traffic",
      title : "Traffic",
      x : 0,
      y : 0,
      width : 12,
      height : 4,
      type : "success",
      userData : {
         fn : "createTrafficReport"
      }
   },
   {
      id : "user-plane",
      title : "User Plane",
      x : 0,
      y : 4,
      width : 6,
      height : 7,
      type : "success",
      userData : {
         fn : "createUserPlaneReport"
      }
   },{
      id : "control-plane-enodeb",
      title : "eNodeB",
      x : 7,
      y : 4,
      width : 6,
      height : 4,
      type : "success",
      userData : {
         fn : "createControlPlaneReporteNodeB"
      }
   },{
      id : "control-plane-mme",
      title : "MME",
      x : 7,
      y : 8,
      width : 6,
      height : 3,
      type : "success",
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

if( URL_PARAM.app == "All")
   delete( URL_PARAM.app );

if( URL_PARAM.app && URL_PARAM.ip && URL_PARAM.remote && URL_PARAM.ts && URL_PARAM.groupby )
   MMTDrop.tools.gotoURL( MMTDrop.tools.getCurrentURL().replace(/application/, "application/detail") );

URL_PARAM.app_id = function(){
   if( URL_PARAM._app_id != undefined )
      return URL_PARAM._app_id;

   URL_PARAM._app_id = MMTDrop.constants.getProtocolIDFromName( URL_PARAM.app );
   return URL_PARAM._app_id;
}

//select only TCP-based app
const APP_PATH_REGEX = {"$regex" : ".354.", "$options" : ""};

var ReportFactory = {
      formatTime : function( date ){
         return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
      },

      formatRTT : function( time ){
         return (time/1000).toFixed( 2 );
      },
      createTrafficReport: function( fPeriod ){
         var divise = function( a, b ){
            if (b == 0) return a;
            //equivalent with toFixed(2) but return a number (instanceof string)
            return Math.round( a / b );
         };
         var _this = this;
         
         //metric selector
         var options = [
            {id: "packet_delay", label: "Packet Delay" },
            {id: "pelr", label: "Packet Error Lost Rate"},
         ];
         
         var fMetric = new MMTDrop.Filter({
            id      : "qos_metric_filter" + MMTDrop.tools.getUniqueNumber(),
            label   : "Metric",
            options : options,
         }, function (opt, db){
            //how it filters database when the current selected option is @{val}
            MMTDrop.tools.reloadPage( "metric=" + opt.id );
         });
         
         
         if (URL_PARAM.metric != undefined)
            fMetric.selectedOption( {id: URL_PARAM.metric} );
         else
            fMetric.selectedOption( {id: 'packet_delay'} );
         
         
         var fApp  = MMTDrop.filterFactory.createAppFilter();
         fApp.onFilter( function( opt ){
            if( opt.label == 'All')
               MMTDrop.tools.reloadPage( "app=undefined" );
            else
               MMTDrop.tools.reloadPage( "app=" + opt.label );
         });

         var appList_db = MMTDrop.databaseFactory.createStatDB(
               {id: "app", query: {
                     //select only proto/app based on IP
                     format: MMTDrop.constants.CsvFormat.SESSION_STATS_FORMAT
                  }
               }
         );
         
         appList_db._reload = function(){
            //var $match = {isGen: false}; //select only App given by probe
            appList_db.reload( {},
               function( new_data ){
                  var selectedOption = undefined;
                  //new array
                  var arr = new_data.map( function(row, i){
                     var app = row[ COL.APP_ID.id ];
                     if( app === URL_PARAM.app )
                        selectedOption =  {id: i+1, label: app};
                     
                     return {id: i+1, label: app};
                  });
                  //add all to app list when having serval apps
                  if( arr.length > 1 )
                     arr.unshift({ id: 0, label: "All"} );
                  
                  if( selectedOption == undefined )
                     selectedOption = arr[0];

                  fApp.option( arr );
                  fApp.selectedOption( selectedOption );
                  fApp.redraw();
                  //f.attachTo( appList_db );
                  //f.filter();
               });
         }//end appList_db._reload

         //using log function to scale metric values
         //=> avoid showing long distance between smallest value and the biggest one
         function _scale(x){
            //if( -1 <= x && x <= 1 )
            //   return x;
            
            //avoid x < 1 ==> get negative value
            x += 1;
            
            x = Math.log10( x );
            //x *= sign;
            return x;
         }
         
         function _unscale( x ){
            //if( -1 <= x && x <= 1 )
            //   return x;
            
            //var sign = 1;
            //if( x < 0 ){
            //   sign = -1;
            //   x    = -x;
            //}
            
            x = Math.pow( 10, x );
            x -= 1;
            
            //x *= sign;
            //if( x === 0.01 )
            //   x = 0;
            return x;
         }
         
         var UL_METRIC, DL_METRIC; //which matric is being selected: either 'pelr' or 'packet_delay'
         var UL_EXPECT_METRIC, DL_EXPECT_METRIC;
         var AXIS_Y_TITLE;
         var DATA_PROC_FN;
         var METRIC_UNIT;
         switch( URL_PARAM.metric ){
            case "pelr":
               UL_METRIC = {id: COL.UL_RETRANSMISSION.id, label: "UL PELR"};
               DL_METRIC = {id: COL.DL_RETRANSMISSION.id, label: "DL PELR"};
               
               //theory value
               UL_EXPECT_METRIC = {id: 120, label: 'Max UL PELR'};
               DL_EXPECT_METRIC = {id: 122, label: 'Max DL PELR'};
               
               AXIS_Y_TITLE = "Packet error lost rate (%)";
               METRIC_UNIT = ' %';
               DATA_PROC_FN = function( data ){
                  data = data * 100;//percentage
                  data = _scale( data );
                  return data;
               }
               break;
               
            case "packet_delay":
            default:
               UL_METRIC = {id: COL.RTT_AVG_CLIENT.id, label: "UL Packet Delay" };
               DL_METRIC = {id: COL.RTT_AVG_SERVER.id, label: "DL Packet Delay" };
               
               UL_EXPECT_METRIC = {id: 119, label: 'Max UL Delay'};
               DL_EXPECT_METRIC = {id: 121, label: 'Max DL Delay'};
               
               AXIS_Y_TITLE = "Packet delay (ms)";
               METRIC_UNIT = " ms/flow";
               DATA_PROC_FN = function( data ){
                  data = _scale( data );
                  return data;
               }
               break;
         }
         
         //group by timestamp         
         var cols = [
            COL.UL_DATA_VOLUME, COL.DL_DATA_VOLUME,
            UL_METRIC, DL_METRIC,
            COL.UL_RETRANSMISSION, COL.DL_RETRANSMISSION ];

         var database = new MMTDrop.Database( {id: "lte-qos"} );//end new Database
         //this is called each time database is reloaded to update parameters of database
         database.updateParameter = function( _old_param ){
            //reload appList metric
            appList_db._reload();
            
            var query = {};
            if( URL_PARAM.app !== 'All' && URL_PARAM.app != undefined )
               query.app = URL_PARAM.app;
            return {query : query};
         };//end database.updateParameter

         //line chart on the top
         var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
               getDataFn: function (db) {
                  var cols = [ COL.TIMESTAMP,
                     UL_EXPECT_METRIC,
                     UL_METRIC,
                     //label: "Data Rate" must be sync with axes: {"Data Rate": "y2"}
                     {id: COL.UL_DATA_VOLUME.id, label: "UL Data Rate", type: "line"},
                     
                     DL_EXPECT_METRIC,
                     DL_METRIC,
                     {id: COL.DL_DATA_VOLUME.id, label: "DL Data Rate", type: "line"},
                  ];
                  
                  var data  = db.data();
                  var sampling = db.time.sampling / 1000; //milisecond => second
                  sampling /= 8; //bit per second

                  var get_number = function( v ){
                     if( v == null || isNaN( v )) return -1;
                     return v;
                  }

                  //calculate the avg of time 
                  var length_ul = 0, total_ul = 0, val;
                  var length_dl = 0, total_dl = 0;
                  
                  for( var i=0; i<data.length; i++ ){
                     var m = data[i];
                     if( m == undefined ){
                        console.error('Null value at index=' + i);
                        continue;
                     }
                     
                     //processing real values of the selected metric
                     m[UL_METRIC.id] = DATA_PROC_FN(m[UL_METRIC.id]);
                     m[DL_METRIC.id] = DATA_PROC_FN(m[DL_METRIC.id]);
                     
                     //processing theory values of the selected metric
                     m[UL_EXPECT_METRIC.id] = DATA_PROC_FN(m[UL_EXPECT_METRIC.id]);
                     m[DL_EXPECT_METRIC.id] = DATA_PROC_FN(m[DL_EXPECT_METRIC.id]);
                     
                     
                     //bit per second
                     m[COL.UL_DATA_VOLUME.id] /= sampling;
                     m[COL.UL_DATA_VOLUME.id] /= sampling;
                     
                     //calculate avg
                     val =  get_number( m[ UL_METRIC.id ] );
                     //val = -3
                     if( val >= 0 ){
                        total_ul  += val;
                        length_ul ++;
                     }
                     
                     val =  get_number( m[ DL_METRIC.id ] );
                     if( val >= 0 ){
                        total_dl  += val;
                        length_dl ++;
                     }
                     
                     
                     //upside down
                     [COL.DL_DATA_VOLUME.id, DL_METRIC.id, DL_EXPECT_METRIC.id]
                     .forEach( function( el ){
                        m[el] = - m[el]; 
                     });
                  }
                  
                  
                  total_ul = divise(total_ul, length_ul);
                  total_dl = divise(total_dl, length_dl);

                  var gridLines = [];
                  if( total_ul != 0 )
                     //granularity/average
                     gridLines.push( {value: total_ul, text: UL_METRIC.label + ": " + total_ul + METRIC_UNIT, position: 'start'} );
                  if( total_dl != 0 )
                     gridLines.push({value: -total_dl, text: DL_METRIC.label + ": " + total_dl + METRIC_UNIT, position: 'start'});
                  
                  var $widget = $("#" + cLine.elemID).getWidgetParent();
                  var height = $widget.find(".grid-stack-item-content").innerHeight();
                  height -= $widget.find(".filter-bar").outerHeight(true) + 15;

                  
                  function _findMax( data, index ){
                     var max = 0.0001;
                     for( var i=0; i<data.length; i++ )
                        if( data[i][index] > max )
                           max = data[i][index];
                     return max;
                  }
                  
                  function _findMin( data, index ){
                     var min = -0.0001;
                     for( var i=0; i<data.length; i++ )
                        if( data[i][index] < min )
                           min = data[i][index];
                     return min;
                  }
                  
                  var yMax  = _findMax( data, UL_METRIC.id ),
                      yMin  = _findMin( data, DL_METRIC.id ),
                      _yMax = _findMax( data, UL_EXPECT_METRIC.id ),
                      _yMin = _findMin( data, DL_EXPECT_METRIC.id ),
                      y2Max = _findMax( data, COL.UL_DATA_VOLUME.id ),
                      y2Min = _findMin( data, COL.DL_DATA_VOLUME.id );
                  
                  if( yMax < _yMax )
                     yMax = _yMax;
                  if( yMin > _yMin )
                     yMin = _yMin;
                  //console.log(yMin, yMax, y2Min, y2Max);
                  //get same proportion for y and y2 axis
                  //fix y, change y2 to get the same proportion
                  var propo  = yMax / yMin;
                  var new_y2Max = y2Min * propo;
                  if( new_y2Max < y2Max )
                     y2Min = y2Max / propo;
                  else
                     y2Max = new_y2Max;
                     
                  //this must be true: (y2Max/y2Min == yMax/yMin)
                  //console.log(yMin, yMax, y2Min, y2Max, (y2Max/y2Min == yMax/yMin));
                  
                  return {
                     data    : data,
                     columns : cols,
                     ylabel  : AXIS_Y_TITLE,
                     height  : height,
                     //when data is not available at a moment, we need to add a zero point to represent it
                     addZeroPoints:{
                        time_id       : COL.TIMESTAMP.id,
                        time          : status_db.time,
                        sample_period : db.time.sampling,
                        probeStatus   : status_db.probeStatus
                    },
                    //other parameter for the c3js line chart
                    chart   : {
                        //show avg lines of time
                        grid: {
                           y: {
                              lines : gridLines
                           }
                        },
                        //synchronize zero line of two axis: y and y2
                        axis: {
                           y : {
                              min: yMin,
                              max: yMax
                           },
                           y2: {
                              min: y2Min,
                              max: y2Max
                           }
                        } 
                           
                     }
                  };
               }
            },
   
            //c3js options
            chart: {
               data:{
                  type: "area",
                  axes: {
                     "UL Data Rate": "y2",
                     "DL Data Rate": "y2"
                  },
                  onclick: function( d, element ){
                     //loadDetail( d.x.getTime() );
                  },
                  selection: {
                     enabled: true,
                     multiple: false
                  },
               },
               color: {
                  pattern: [ 'LightBlue', 'DeepSkyBlue', 'green', 'Plum', 'violet', 'red']
               },
               grid: {
                  x: {
                     show: false
                  },
               },
               axis: {
                  x: {
                     tick: {
                        format: _this.formatTime,
                     }
                  },
                  y: {
                     show : true,
                     tick:{
                        count: 7,
                        //override the default format
                        format: function( v ){
                           if( v < 0 ) 
                              v = -v;
                           v = _unscale( v );
                           if( v < 0.1 )
                              return Math.round( v * 1e4 ) / 1e4;
                           
                           return  MMTDrop.tools.formatDataVolume(v);
                        }
                     },
                     padding: {top: 0, bottom: 0},
                  },
                  y2: {
                     show : true,
                     label: {
                        text: "Data Rate (bps)",
                        position: "outer"
                     },
                     tick: {
                        count: 7,
                        format: function( v ){
                           if( v < 0 ) 
                              v = -v;
                           return MMTDrop.tools.formatDataVolume( v, true );
                        }
                     },
                     padding: {top: 0, bottom: 0},
                  }
               },
               zoom: {
                  enabled: true,
                  rescale: true
               },
               tooltip:{
                  format: {
                     title:  _this.formatTime
                  }
               },
            },
            afterEachRender: function (_chart) {
               var chart = _chart.chart;
               // Add event listener for opening and closing details
               //console.log(_chart.chart.axis.range())
               //_chart.chart.axis.range( {max: {y: 600, y2: 100}, min: {y: -100, y2: 0}} )
               
               //translate oX line to zero
               //select the x axis
               
               d3.select(chart.element)
                  .select('.' + c3.chart.internal.fn.CLASS.axisX)
                  .transition()
                  // and translate it to the y = 0 position
                 .attr('transform', "translate(" + 0 + "," + chart.internal.y(0) + ")")
            }
         });


         var report = new MMTDrop.Report(
               // title
               null,
               database,
               // filers
               [fMetric, fApp],
               // charts
               [
                  {
                     charts: [cLine],
                     width: 12
                  }
               ],
               [{object: cLine}]
         );

         return report;
      },
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
                        {id: GTP.TEIDs.id,        align: "right", label:"TEIDs"},
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
                        {id: COL.DATA_VOLUME.id,  align: "right", label: "Data (B)", format: MMTDrop.tools.formatLocaleNumber },
                        {id: COL.PACKET_COUNT.id, align: "right", label: "#Packet", format: MMTDrop.tools.formatLocaleNumber}, 
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