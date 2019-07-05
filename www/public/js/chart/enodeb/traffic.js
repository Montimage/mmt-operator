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

function _getName( name ){
   if( name == undefined )
      return '<i class="fa fa-spinner fa-pulse fa-fw"></i><span class="sr-only">Loading...</span>';
   return name;
}

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
         
         var fMetric = MMTDrop.filterFactory.createMetricFilter();
         fMetric.onFilter(function () {
            cLine.redraw();
         });

         //metric selector
         var options = [
            {id: "packet_delay", label: "Packet Delay" },
            {id: "pelr", label: "Packet Error Lost Rate"},
         ];
         
         const fMetricQos = new MMTDrop.Filter({
            id      : "qos_metric_filter" + MMTDrop.tools.getUniqueNumber(),
            label   : "QoS",
            options : options,
            useFullURI: false,
         }, function (opt, db){
            //how it filters database when the current selected option is @{val}
            //MMTDrop.tools.reloadPage( "metric=" + opt.id );
            cLine.redraw();
         });
         
         
         if (URL_PARAM.metric != undefined)
            fMetricQos.selectedOption( {id: URL_PARAM.metric} );
         
         
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

         
       //using log function to scale metric values
         //=> avoid showing long distance between smallest value and the biggest one
         function _scale(x){
            //avoid x < 1 ==> get negative value
            x += 1;
            x = Math.log10( x );
            return x;
         }
         
         function _unscale( x ){            
            x = Math.pow( 10, x );
            x -= 1;
            return x;
         }
         
         //line chart on the top
         var cLine = MMTDrop.chartFactory.createTimeline({
            getData: {
               getDataFn: function (db) {
                  var sampling = db.time.sampling / 1000; //milisecond => second
                  
                  var UL_QOS_METRIC, DL_QOS_METRIC; //which matric is being selected: either 'pelr' or 'packet_delay'
                  var UL_EXPECT_QOS_METRIC, DL_EXPECT_QOS_METRIC;
                  var AXIS_Y_TITLE;
                  var DATA_PROC_FN;
                  var METRIC_UNIT;
                  switch( fMetricQos.selectedOption().id ){
                     case "pelr":
                        UL_QOS_METRIC = {id: COL.UL_RETRANSMISSION.id, label: "UL PELR"};
                        DL_QOS_METRIC = {id: COL.DL_RETRANSMISSION.id, label: "DL PELR"};
                        
                        //theory value
                        UL_EXPECT_QOS_METRIC = {id: 120, label: 'Max UL PELR'};
                        DL_EXPECT_QOS_METRIC = {id: 122, label: 'Max DL PELR'};
                        
                        AXIS_Y_TITLE = "Packet error lost rate (% per second)";
                        METRIC_UNIT = ' %';
                        DATA_PROC_FN = function( data ){
                           data = data * 100;//percentage
                           data /= sampling; //percentage of pelr per second
                           data = _scale( data );
                           return data;
                        }
                        break;
                        
                     case "packet_delay":
                     default:
                        UL_QOS_METRIC = {id: COL.RTT_AVG_CLIENT.id, label: "UL Packet Delay" };
                        DL_QOS_METRIC = {id: COL.RTT_AVG_SERVER.id, label: "DL Packet Delay" };
                        
                        UL_EXPECT_QOS_METRIC = {id: 119, label: 'Max UL Delay'};
                        DL_EXPECT_QOS_METRIC = {id: 121, label: 'Max DL Delay'};
                        
                        AXIS_Y_TITLE = "Packet delay (ms)";
                        METRIC_UNIT = " ms/flow";
                        DATA_PROC_FN = function( data ){
                           data = _scale( data );
                           return data;
                        }
                        break;
                  }
                  
                  var UL_METRIC, DL_METRIC;
                  var AXIS_Y2_TITLE;
                  var DATA_PROC_FN2;
                  switch( fMetric.selectedOption().id ){
                     case COL.PACKET_COUNT.id:
                        UL_METRIC = COL.UL_PACKET_COUNT;
                        DL_METRIC = COL.DL_PACKET_COUNT;
                        AXIS_Y2_TITLE = 'Packet Rate (pps)';
                        DATA_PROC_FN2 = function( v ){
                           return v / sampling;
                        };
                        break;
                        
                     case COL.PAYLOAD_VOLUME.id:
                        UL_METRIC = COL.UL_PAYLOAD_VOLUME;
                        DL_METRIC = COL.DL_PAYLOAD_VOLUME;
                        AXIS_Y2_TITLE = 'Data Rate (bps)';
                        DATA_PROC_FN2 = function( v ){
                           return v*8 / sampling; //*8bit per second
                        };
                        break;
                        
                     case COL.ACTIVE_FLOWS.id:
                        UL_METRIC = {id: COL.ACTIVE_FLOWS.id, label: 'UL Sessions'};
                        //minus to differ from UL_METRIC
                        DL_METRIC = {id: -COL.ACTIVE_FLOWS.id, label: 'DL Sessions'};
                        AXIS_Y2_TITLE = 'Session Count (total)';
                        DATA_PROC_FN2 = function( v ){
                           return v/2;
                        }
                        break;
                        
                     case COL.DATA_VOLUME.id:
                     default:
                        UL_METRIC = COL.UL_DATA_VOLUME;
                        DL_METRIC = COL.DL_DATA_VOLUME;
                        AXIS_Y2_TITLE = 'Data Rate (bps)';
                        DATA_PROC_FN2 = function( v ){
                           return v*8 / sampling; //*8bit per second
                        };
                        break;
                  }
                  
                  //group by timestamp         
                  var cols = [ COL.TIMESTAMP,
                     UL_EXPECT_QOS_METRIC,
                     UL_QOS_METRIC,
                     //label: "Data Rate" must be sync with axes: {"Data Rate": "y2"}
                     {id: UL_METRIC.id, label: UL_METRIC.label, type: "line"},
                     
                     DL_EXPECT_QOS_METRIC,
                     DL_QOS_METRIC,
                     {id: DL_METRIC.id, label: DL_METRIC.label, type: "line"},
                  ];
                  
                  var data  = db.data();
                  

                  var get_number = function( v ){
                     if( v == null || isNaN( v )) return -1;
                     return v;
                  }

                  //calculate the avg of time 
                  var length_ul = 0, total_ul = 0, val;
                  var length_dl = 0, total_dl = 0;
                  
                  var arr = [];
                  
                  for( var i=0; i<data.length; i++ ){
                     var m = data[i];
                     var o = {};
                     
                     arr.push( o );
                     
                     //copy m to o
                     for( var j=0; j<cols.length; j++)
                        o[ cols[j].id ] = m[ cols[j].id ];
                     
                     //processing real values of the selected metric
                     o[UL_QOS_METRIC.id] = DATA_PROC_FN(m[UL_QOS_METRIC.id]);
                     o[DL_QOS_METRIC.id] = DATA_PROC_FN(m[DL_QOS_METRIC.id]);
                     
                     //processing theory values of the selected metric
                     o[UL_EXPECT_QOS_METRIC.id] = DATA_PROC_FN(m[UL_EXPECT_QOS_METRIC.id]);
                     o[DL_EXPECT_QOS_METRIC.id] = DATA_PROC_FN(m[DL_EXPECT_QOS_METRIC.id]);
                     
                     
                     //specific processing for DL_METRIC = COL.ACTIVE_FLOWS.id
                     if( DL_METRIC.id == - COL.ACTIVE_FLOWS.id ){
                        o[UL_METRIC.id] = DATA_PROC_FN2( m[COL.ACTIVE_FLOWS.id] ) ;
                        o[DL_METRIC.id] = DATA_PROC_FN2( m[COL.ACTIVE_FLOWS.id] ) ;
                     } else {
                        o[UL_METRIC.id] = DATA_PROC_FN2( o[UL_METRIC.id] );
                        o[DL_METRIC.id] = DATA_PROC_FN2( o[DL_METRIC.id] );
                     }
                     
                     
                     
                     //calculate avg
                     val =  get_number( m[ UL_QOS_METRIC.id ] );
                     //val = -3
                     if( val >= 0 ){
                        total_ul  += val;
                        length_ul ++;
                     }
                     
                     val =  get_number( m[ DL_QOS_METRIC.id ] );
                     if( val >= 0 ){
                        total_dl  += val;
                        length_dl ++;
                     }
                     
                     
                     //upside down
                     [DL_METRIC.id, DL_QOS_METRIC.id, DL_EXPECT_QOS_METRIC.id]
                     .forEach( function( el ){
                        o[el] = - o[el]; 
                     });
                  }
                  
                  
                  total_ul = divise(total_ul, length_ul);
                  total_dl = divise(total_dl, length_dl);

                  var gridLines = [];
                  if( total_ul != 0 )
                     //granularity/average
                     gridLines.push( {value: _scale(total_ul), text: UL_QOS_METRIC.label + ": " + total_ul + METRIC_UNIT, position: 'start'} );
                  if( total_dl != 0 )
                     gridLines.push({value: - _scale(total_dl), text: DL_QOS_METRIC.label + ": " + total_dl + METRIC_UNIT, position: 'start'});
                  
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
                  
                  var yUL  = _findMax( arr, UL_QOS_METRIC.id ),
                      yDL  = _findMin( arr, DL_QOS_METRIC.id ),
                      _yUL = _findMax( arr, UL_EXPECT_QOS_METRIC.id ),
                      _yDL = _findMin( arr, DL_EXPECT_QOS_METRIC.id ),
                      y2UL = _findMax( arr, UL_METRIC.id ),
                      y2DL = _findMin( arr, DL_METRIC.id );
                  
                  if( yUL < _yUL )
                     yUL = _yUL;
                  if( yDL > _yDL )
                     yDL = _yDL;
                  
                  //console.log(yDL, yUL, y2DL, y2UL);
                  //get same proportion for y and y2 axis
                  //fix y, change y2 to get the same proportion
                  var propo  = yUL / yDL;
                  
                  //ensure proportion is 1:4
                  // as ussually UL is less than DL
                  if( propo > -1/4 ){
                     propo = -1/4;
                     //keep y2DL
                     yUL = yDL * propo;
                  } else if ( propo < -4/1 ){
                     propo = -4;
                     //keep y2UL
                     yDL = yUL/propo;
                  }
                     
                  var new_y2Max = y2DL * propo;
                  if( new_y2Max < y2UL )
                     y2DL = y2UL / propo;
                  else
                     y2UL = new_y2Max;
                  
                  var axes = {};
                  axes[ UL_METRIC.label ] = "y2";
                  axes[ DL_METRIC.label ] = "y2";
                  
                  //this must be true: (y2Max/y2Min == yMax/yMin)
                  //console.log(yMin, yMax, y2Min, y2Max, (y2Max/y2Min == yMax/yMin));
                  
                  return {
                     data    : arr,
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
                        data:{
                          axes: axes,
                        },  
                        //show avg lines of time
                        grid: {
                           y: {
                              lines : gridLines
                           }
                        },
                        //synchronize zero line of two axis: y and y2
                        axis: {
                           y : {
                              min: yDL,
                              max: yUL
                           },
                           y2: {
                              min: y2DL,
                              max: y2UL,
                              label: {
                                 text: AXIS_Y2_TITLE,
                              }
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
                  onclick: function( d, element ){
                     //loadDetail( d.x.getTime() );
                  },
                  selection: {
                     enabled: true,
                     multiple: false
                  },
               },
               color: {
                  pattern: [ 'PowderBlue', 'DeepSkyBlue', 'green', 'Lavender', 'violet', 'red']
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
                           if( v == 0 )
                              return v;
                           
                           var symbol = '\u2191'; //up
                           if( v < 0 ){
                              v = -v;
                              symbol = '\u2193'; //down
                           }
                           v = _unscale( v );
                           if( v < 0.1 )
                              return Math.round( v * 1e4 ) / 1e4;
                           
                           return MMTDrop.tools.formatDataVolume(v);
                        }
                     },
                     padding: {top: 0, bottom: 0},
                  },
                  y2: {
                     show : true,
                     label: {
                        position: "outer"
                     },
                     tick: {
                        count: 7,
                        format: function( v ){
                           var symbol = '\u2191'; //up
                           if( v < 0 ){
                              v = -v;
                              symbol = '\u2193'; //down
                           }
                           return  MMTDrop.tools.formatDataVolume( v );
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
               
               d3.select( chart.element )
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
               [fMetricQos, fApp, fMetric],
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
               group[ el ] = {"$last" : "$"+ el};
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
                     msg[ GTP.IMSI.id ] = '<a title="Click to show detail of this IMSI" onclick="showDetailUE(\'IMSI\',\''+ data +'\')">' + _getName(data) + '</a>'
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
            [ COL.PROBE_ID.id, COL.TIMESTAMP.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });
            [ COL.IP_SRC.id, COL.IP_DST.id, COL.MAC_SRC.id, COL.MAC_DST.id, , COL.APP_PATH.id, GTP.ENB_NAME.id ].forEach( function( el, index){
               group[ el ] = {"$last" : "$"+ el};
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

                     msg.graph = '<a title="Click to show graph" onclick="'+ fun +'"><i class="fa fa-line-chart" aria-hidden="true"></i></a>';
                  }

                  return {
                     columns : [
                        {id: GTP.MME_NAME.id, label: "Name", format: function( val ){
                           return '<a title="Click to show detail of this MME" onclick="showDetaileMME(\''+ val +'\')">' + _getName(val) + '</a>';;
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
                           return '<a title="Click to show detail of this eNodeB" onclick="showDetaileNodeB(\''+ val +'\')">' + _getName(val) + '</a>';
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