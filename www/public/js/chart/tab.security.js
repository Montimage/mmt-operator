var arr = [
   {
      id: "security",
      title: "Security Alerts",
      x: 0,
      y: 6,
      width: 12,
      height: 7,
      type: "danger",
      userData: {
         fn: "createSecurityRealtimeReport"
      }
   },{
      id: "security-distribution",
      title: "Alerts Distribution",
      x: 0,
      y: 0,
      width: 12,
      height: 5,
      type: "success",
      userData: {
         fn: "createSecurityDistributionReport"
      }
   }
];


var availableReports = {
      "createNodeReport":     "Security",
};

MMTDrop.callback = {
      chart : {
         afterRender : loading.onChartLoad
      }
};


function formatTime( date ){
   return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
}

var ReportFactory = {};
ReportFactory.createSecurityDistributionReport = function(fPeriod){
   const COL = MMTDrop.constants.SecurityColumn;
   const database = new MMTDrop.Database({
      collection: "security",
      action: "aggregate",
      no_group : true, 
      no_override_when_reload: true, 
      raw: true,
   }, function( data ){
      data.forEach( function(msg){
         switch ( fPeriod.selectedOption().id ) {
         case MMTDrop.constants.period.MINUTE:
         case MMTDrop.constants.period.HOUR:
            break;
         case MMTDrop.constants.period.HALF_DAY:
         case MMTDrop.constants.period.QUARTER_DAY:
         case MMTDrop.constants.period.DAY:
            //timeFn = "$minute";
            msg[ COL.TIMESTAMP.id ] = moment(msg[ COL.TIMESTAMP.id ]).startOf( "minute").valueOf();
            break;
         case MMTDrop.constants.period.WEEK:
         case MMTDrop.constants.period.MONTH:
            msg[ COL.TIMESTAMP.id ] = moment(msg[ COL.TIMESTAMP.id ]).startOf( "hour").valueOf();
            break;
         case MMTDrop.constants.period.YEAR:
            msg[ COL.TIMESTAMP.id ] = moment(msg[ COL.TIMESTAMP.id ]).startOf( "day").valueOf();
            break;
         default:
         }
      });
      return data;
   }, false);

   database.updateParameter = function( _old_param ){
      const $match = {};
      $match[ COL.PROBE_ID.id ]  = URL_PARAM.probe_id;
      $match[ COL.TIMESTAMP.id ] = {$gte: status_db.time.begin, $lte: status_db.time.end };

      const $group = { _id: {}};
      [ COL.PROPERTY.id, COL.TIMESTAMP.id ].forEach( function( el, index){
         $group["_id"][ el ] = "$" + el;
      } );

      $group[ COL.VERDICT_COUNT.id ] = {"$sum" : {"$ifNull": [1, "$" + COL.VERDICT_COUNT.id ]}};

      [ COL.TIMESTAMP.id, COL.PROPERTY.id ].forEach( function( el, index){
         $group[ el ] = {"$last" : "$"+ el};
      });

      return {query: [{$match: $match}, {$group : $group}, {$project: {_id: 0}}]};
   };

   var cLine = MMTDrop.chartFactory.createTimeline({
      //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
      getData: {
         getDataFn: function (db) {
            const colsToGroup = [COL.TIMESTAMP.id, COL.PROPERTY.id];
            const ylabel = "Number of alerts";
            const colToSum = COL.VERDICT_COUNT.id;
            var data = db.data();

            data = MMTDrop.tools.sumByGroups(data, [colToSum], colsToGroup);

            const arr = [];
            var header = [];

            for (var time in data) {
               var o = {};
               o[COL.TIMESTAMP.id] = parseInt( time );

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

            var columns = [COL.TIMESTAMP];

            //by increasing order of property id
            header = header.sort( function( a, b ){
               return parseInt(a) - parseInt(b);
            });
            for (var i = 0; i < header.length; i++) {
               var path = header[i];
               columns.push({
                  id: path,
                  label: "Property " + path
               });
            }

            var $widget = $("#" + cLine.elemID).getWidgetParent();
            $widget.find(".filter-bar").height(25);
            var height = $widget.find(".grid-stack-item-content").innerHeight();
            height -= $widget.find(".filter-bar").outerHeight(true) + 15;

            return {
               data   : arr,
               columns: columns,
               ylabel : ylabel,
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
                  format: formatTime
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
               title:  formatTime,
               value: function( value ){
                  return value + " alerts";
               }
            }
         },
         zoom: {
            enabled: false,
            rescale: false
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

      }
   });

   var report = new MMTDrop.Report(
         // title
         "",

         // database
         database,

         // filers
         [],

         //charts
         [
            {
               charts: [cLine],
               width: 12
            },
            ],

            //order of data flux
            [{  object: cLine }]
   );
   return report;
};

ReportFactory.createSecurityRealtimeReport = function (fPeriod) {
   const COL = MMTDrop.constants.SecurityColumn;

   //this database is used when user click on one security alert to show its detail
   const databaseDetail = new MMTDrop.Database({
      collection: "security",
      action: "aggregate",
      no_group : true, 
      raw: true,
   }, function( data ){
      if( !Array.isArray( data ) )
         return;
      for( var i=0; i<data.length; i++ ){
         const msg = data[i];
         if( typeof( msg[ COL.HISTORY.id ]) === "string" )
            msg[ COL.HISTORY.id ] = JSON.parse( msg[ COL.HISTORY.id ] );
      }
      return data;
   }, false);

   
   const database = new MMTDrop.Database({
      collection: "security",
      action: "aggregate",
      no_group : true, 
      no_override_when_reload: true, 
      raw: true,
   }, null, false);

   database.updateParameter = function( _old_param ){
      const $match = {};
      $match[ COL.PROBE_ID.id ]  = URL_PARAM.probe_id;
      $match[ COL.TIMESTAMP.id ] = {$gte: status_db.time.begin, $lte: status_db.time.end };

      const $group = { _id: {}};
      [ COL.PROPERTY.id, COL.VERDICT.id, COL.PROBE_ID.id ].forEach( function( el, index){
         $group["_id"] [ el ] = "$" + el;
      } );

      $group[ COL.VERDICT_COUNT.id ] = {"$sum" : {"$ifNull": [1, "$" + COL.VERDICT_COUNT.id ]}};

      [ COL.TIMESTAMP.id, COL.PROBE_ID.id, COL.VERDICT.id, COL.PROPERTY.id, 
         COL.TYPE.id,
         COL.DESCRIPTION.id].forEach( function( el, index){
            $group[ el ] = {"$last" : "$"+ el};
         });

      //$group.detail = {$push: {history: "$" + COL.HISTORY.id, timestamp: "$" + COL.TIMESTAMP.id }};

      return {query: [{$match: $match}, {$group : $group}, {$project: {_id: 0}}]};
   };

   var DATA    = [];
   var VERDICT = {};

   var reset = function(){
      DATA    = [];
      VERDICT = {
            "detected"      : 0,
            "not_detected"  : 0,
            "respected"     : 0,
            "not_respected" : 0,
            "unknown"       : 0
      };
   };

   reset();
   fPeriod.onChange( reset );

   function appendData( msg ){
      var key   = msg[ COL.PROBE_ID.id ] + "-" + msg[ COL.PROPERTY.id ] + "-" + msg[COL.VERDICT.id];
      var vdict = msg[ COL.VERDICT.id ];
      var ts    = msg[ COL.TIMESTAMP.id ];
      var num_verdict = 1;

      if( msg[ COL.VERDICT_COUNT.id ] > 0 )
         num_verdict = msg[ COL.VERDICT_COUNT.id ];

      VERDICT[ vdict ] += num_verdict;

      for( var i=0; i<DATA.length; i++ ){
         const obj = DATA[ i ];
         if( obj.key == key ){
            obj.verdict[ vdict ] += num_verdict;

            obj.detail.push( msg ) ;

            //update time
            obj.data[ COL.TIMESTAMP.id ] = msg[ COL.TIMESTAMP.id ];

            return i;
         }
      }

      const o = {};
      o.key              = key;
      o.index            = DATA.length;
      o.verdict          = {
            "detected"      : 0,
            "not_detected"  : 0,
            "respected"     : 0,
            "not_respected" : 0,
            "unknown"       : 0
      };
      o.verdict[ vdict ] += num_verdict ;
      o.detail           = [ msg ];
      o.data             = MMTDrop.tools.cloneData( msg );    //data to show to the table

      DATA.push( o );

      return -1;
   };

   var columnsToShow = [
      {
         id: COL.TIMESTAMP.id,
         label: "Last updated"
      },
      {
         id: COL.PROBE_ID.id,
         label: "Probe ID"
      },
      {
         id: COL.PROPERTY.id,
         label: "Property"
      },
      {
         id: COL.TYPE.id,
         label: "Type"
      },
      {
         id: COL.VERDICT.id,
         label: "Verdict"
      },
      {
         id: COL.DESCRIPTION.id,
         label: "Description" //(will be hidden)"
      }
      ];

   const getVerdictHTML = function( verdict ){
      var bootstrap_class_name = {
            "detected"      : "label-danger",
            "not_detected"  : "label-info",
            "respected"     : "label-success",
            "not_respected" : "label-warning",
            "unknown"       : "label-default"
      };
      var html = "";
      for( var v in verdict ){
         if( verdict[v] === 0 ) continue;
         if( html !== "") html += ", ";
         html += '<span class="label '+ bootstrap_class_name[v] +' mmt-verdict-label"> ' + v + '</span><span class="badge">' + verdict[v] + '</span> ';
      }
      return html;
   };

   //detail of each property
   var detailOfPopupProperty = null;
   var openingRow = null;
   var popupTable = MMTDrop.chartFactory.createTable({
      getData: {
         getDataFn: function (db) {

            var cols = [{id: "index", label:""}, COL.TIMESTAMP, COL.VERDICT, {id: "concern", label: "IP or MAC addresses of  Concerned Machines"}];

            var data = db.data();
            var arr = [];
            for( var index=0; index<data.length; index++ ){
               var msg = data[index];
               var o  = {};

               o[ "index" ] = index+1;
               var time = msg.time;
               if( time === undefined ){
                  time = MMTDrop.tools.formatDateTime( new Date( msg[COL.TIMESTAMP.id] ));
                  msg.time = time;
               }

               o[ COL.TIMESTAMP.id ] = time;
               o[ COL.VERDICT.id   ] = msg[ COL.VERDICT.id ];
               var history = msg[ COL.HISTORY.id ];

               var concernt = msg[ COL.VERDICT_COUNT.id ];

               concernt = msg.concernt ;
               if( concernt == null ){
                  concernt = "";
                  for( var i in history ){
                     var event = history[ i ].attributes;
                     for( var j in event ){
                        var atts = event[j];
                        //since mmt-security v 1.2.8, atts is an array [key, value]
                        // instead of an object {key: value}
                        if( !Array.isArray( atts )){
                           //this is for older version
                           const firstKey = Object.keys(atts)[0];
                           atts = [ firstKey, atts[ firstKey ] ];
                        }

                        const key = atts[0]; //since mmt-security v 1.2.8, the first element is key, the second one is value
                        const val = atts[1];

                        //check if key is one of the followings
                        const ipArr = ["ip.src", "ip.dst", "ethernet.src", "ethernet.dst", "s1ap.ue_ipv4", "s1ap.enb_ipv4", "s1ap.mme_ipv4"];
                        
                        if( ipArr.indexOf( key )  !== -1 ){
                           //if the att is not yet added
                           if( concernt.indexOf( val ) === -1 ){
                              //
                              if( concernt != "") concernt += ", ";
                              concernt += val;
                           }
                        }
                     }
                  }
                  msg.concernt = concernt;
               }
               o.concern = concernt;
               arr.push( o );
            }
            return {
               columns: cols,
               data   : arr
            };
         }
      },
      chart: {
         "order": [[0, "asc"]],
         dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><'row-cursor-pointer't><'row'<'col-sm-3'i><'col-sm-9'p>>",
         "deferRender": true
      },
      afterEachRender: function( _chart ){
         // Add event listener for opening and closing details
         _chart.chart.on('click', 'tr[role=row]', function () {
            var tr = $(this);
            var row = _chart.chart.api().row(tr);

            if (row.child.isShown()) {
               // This row is already open - close it
               row.child.hide();
               tr.removeClass('shown');
               openingRow = null;
            } else {
               //close the last opening
               if (openingRow) {
                  openingRow.child.hide();
                  $(openingRow.node()).removeClass('shown');
               }

               // Open this row
               var index = row.data()[0] - 1;
               var history = detailOfPopupProperty[ index ];
               if( history ) history = history[ COL.HISTORY.id ];

               var str = "";
               for( var ev in history ){
                  var event = history[ev];

                  if( typeof( event.timestamp) === "number" ){
                     event.timestamp *= 1000;
                     event.timestamp = MMTDrop.tools.formatDateTime( new Date( event.timestamp ), true );
                  }
                  event = JSON.stringify(event, function (key, val) {
                     if (typeof val === "string")
                        return "<string>" + val + "</string>";
                     if (typeof val === "number")
                        return "<number>" + val + "</number>";
                     return val;
                  })
                  .replace(/(\"<string>)/g, '<string>"').replace(/<\/string>\"/g, '"</string>')
                  .replace(/\"<number/g, "<number").replace(/number>\"/g, "number>")
                  //.replace(/\"(.+)\":/g, "<label>$1</label> :")
                  ;

                  str += "<li>" + event + "</li>";
               }

               row.child('<div id="detailTest" class="code-json"><ul>' + str + '</ul></div>').show();
               tr.addClass('shown');
               openingRow = row;
            }
            return false;
         });

      }
   });
   popupTable.attachTo( databaseDetail, false );

   var updateTotalVerdictDisplay = function(){
      $("#mmt-verdict-total").html( "<strong>Total:</strong> " + getVerdictHTML( VERDICT ) );
   };


   //this is applied for each element of data
   var getDataToShow = function( obj ){
      var msg = obj.data;
      var arr = [];
      for( var i in columnsToShow ){
         var col = columnsToShow[ i ].id;
         var val = msg[ col ];
         if( col == COL.VERDICT.id )
            val = getVerdictHTML( obj.verdict ) ;
         else if( col == COL.TIMESTAMP.id )
            val = MMTDrop.tools.formatDateTime( new Date( val ) ) ;

         if( arr.length == 0 )
            val = '<span data-index="' + obj.index + '">' + val + '</span>';
         arr.push( val );
      }
      return arr;
   };

   var cTable = MMTDrop.chartFactory.createTable({
      getData: {
         getDataFn: function (db) {
            reset();
            var arr = db.data();
            for (var i in arr)
               appendData( arr[i] );

            arr = [];
            for( var i in DATA ){
               arr.push( getDataToShow( DATA[i] ) );
            }

            var cols = [];
            for( var i=0; i<columnsToShow.length; i++)
               cols.push( {id: i, label: columnsToShow[i].label, align: "left" } );
            return {
               columns: cols,
               data   : arr
            };
         }
      },
      chart: {
         "order": [[0, "asc"]],
         dom: "<'row' <'col-sm-9'<'#mmt-verdict-total'>><'col-sm-3'f>><'dataTables_scrollBody overflow-auto-xy row-cursor-pointer't><'row'<'col-sm-3'l><'col-sm-9'p>>",
      },
      afterEachRender: function (_chart) {
         ///configuration of interface: arrange components
         //hide the filers of report (not the one of Datatable)
         $("#report_filters").hide();

         var table = _chart.chart;
         if( table == undefined )
            return;

         updateTotalVerdictDisplay();
         if( $("#modalWindow").length === 0 ){
            var modal = '<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" id="modalWindow">'
               +'<div class="modal-dialog">'
               +'<div class="modal-content" style="width: 800px">'
               +'<div class="modal-header">'
               +'<button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>'
               +'<h4 class="modal-title">Detail</h4>'
               +'</div>'
               +'<div class="modal-body code-json" id="detailItem"></div>'
               +'</div></div></div>';

            $("body").append( $(modal) );
         }

         table.on("draw.dt", function () {
            var $div = $('.dataTables_scrollBody');
            var h = $div.parents().filter(".grid-stack-item-content").height() - 120;
            $div.css('height', h);
            $div.css('margin-top', 10);
            $div.css('margin-bottom', 10);
            $div.children().filter("table").css( "border-top", "thin solid #ddd" );
         });

         //jump to the last page of table
         table.api().page('last');

         //show 10 items/page
         table.DataTable().page.len(10).draw(false); //either 5, 10, 25, 50, 100

         //resize when changing window size
         $(window).resize(function () {
            if (table)
               table.api().draw(false);
         });


         var $currentRow;
         // Add event listener for opening and closing details
         table.on('click', 'tr[role=row]', function () {
            //clear the last selected row
            //if ($currentRow)
            //$currentRow.removeClass('active');

            //popup a modal when user clicks on an item of the table
            const showModal = function (msg, data ) {
               detailOfPopupProperty = data;
               var prop = msg[ COL.PROPERTY.id ];
               var des  = msg[ COL.DESCRIPTION.id ];

               $("#detailItem").html("<strong>Property " + prop + "</strong><br/>" + des + '<br/><div id="popupTable"/>');

               popupTable.renderTo( "popupTable" );

               if( loading )
                  loading.onHide();

               $("#modalWindow").modal();
            };

            //set the current selected row
            $currentRow = $(this);
            //$currentRow.addClass('active');

            //get value of the first column == index
            var index = $currentRow.find('td:first').find("span").data("index");
            if( index == undefined )
               return;

            var item = DATA[index].detail;
            if ( item ){
               const msg = item[0];


               const $match = {};
               $match[ COL.PROBE_ID.id ]  = msg[ COL.PROBE_ID.id ];
               $match[ COL.TIMESTAMP.id ] = {$gte: status_db.time.begin, $lte: status_db.time.end };
               $match[ COL.PROPERTY.id ]  = msg[ COL.PROPERTY.id ];

               const $project = {};
               [ COL.TIMESTAMP.id, COL.VERDICT.id, COL.HISTORY.id ].forEach( function( el, index){
                  $project[ el ] = 1;
               });
               $project._id = 0;
               if( loading )
                  loading.onShowing();

               databaseDetail.reload( {query: [{$match: $match}, { $project : $project}]},
                     function( new_data ){

                  showModal( msg, new_data );   
               });
            }
            return false;
         });


      }
   });

   var indexOfNewRow = [];
   var indexToUpdate = [];
   var lastUpdateTime = (new Date()).getTime();
   //when a new message is comming, append it to the table
   function addAlerts( data ) {
      if( data === undefined || data.length === 0 )
         return;

      for( var i in data ){
         var msg = data[i];

         var index = appendData( msg );
         if( index >= 0 ){
            //the row is not yet in the list to update
            if( indexToUpdate.indexOf( index ) === -1 && indexOfNewRow.indexOf( index ) === -1 )
               indexToUpdate.push( index );
         }else
            indexOfNewRow.push( DATA.length - 1 );
      }


      var now = (new Date()).getTime();
      if( now - lastUpdateTime <= 500 )
         return;


      lastUpdateTime = now;

      updateTotalVerdictDisplay();


      var table = cTable.chart;


      for( var i in indexToUpdate  ){
         var index = indexToUpdate[ i ];

         var row_data = getDataToShow( DATA[ index ] );
         var row      = table.api().row( index );

         row.data( row_data );

         //flash the updated row
         $( row.node() ).stop().flash();;
      }
      indexToUpdate = [];

      //there are no new rows to add
      if( indexOfNewRow.length == 0 ){
         table.DataTable().columns.adjust();
         return;
      }

      for( var i in indexOfNewRow ){
         var index = indexOfNewRow[ i ];
         //need to append to the table a new row
         var new_row = getDataToShow( DATA[ index ] );

         //show msg to the table
         table.api().row.add( new_row );
      }
      indexOfNewRow = [];

      var inLastPage = false;
      var o = table.api().page.info();
      var currentPage = o.page;

      if (currentPage == (o.pages - 1))
         inLastPage = true;

      table.DataTable().columns.adjust();
      table.api().draw(false);

      //console.log(" in the last page:" + inLastPage);
      if (inLastPage) {
         //scroll to bottom --> last item being added
         $('.dataTables_scrollBody').scrollTop(10000000);

         table.api().page("last");
         table.api().draw(false);
      }

      //console.log(new Date() + "  Add a new Row");
   };

   window.addAlerts = addAlerts;

   //update report received from server
   /* Disable this part to avoid show alerts in realtime
    io().on('security',  function( arr ){

      console.log("new alerts " + arr.length );

      var autoreload = MMTDrop.tools.localStorage.get("autoreload", false);
      if( autoreload === false ) return;

      for( var i=0; i<arr.length; i++)
        if( typeof(arr[ i][ COL.HISTORY.id ]) === "string")
          arr[ i][ COL.HISTORY.id ] = JSON.parse( arr[ i][ COL.HISTORY.id ] );

      addAlerts( arr );
    });
    */

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
               charts: [cTable],
               width: 12
            },
            ],

            //order of data flux
            [{object: cTable}]
   );

   return report;
}
