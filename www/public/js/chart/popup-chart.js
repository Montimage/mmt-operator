
//load a popup graph represeting trafic of last 5 minutes of an IP/APP/MAC/Profile/...

function createTrafficReport( collection, key, id ){
   var getCol = function (col, isIn) {
      var COL = MMTDrop.constants.StatsColumn;

      var tmp = "PAYLOAD_VOLUME";
      if (col.id == COL.DATA_VOLUME.id)
         tmp = "DATA_VOLUME";
      else if (col.id == COL.PACKET_COUNT.id)
         tmp = "PACKET_COUNT";

      var label;
      if (isIn) {
         label = "In";
         tmp = "DL_" + tmp;
      } else {
         label = "Out";
         tmp = "UL_" + tmp;
      }
      return {
         id   : COL[tmp].id,
         label: label,
         total: 0, //total data IN/OUT
         //type: "area"
      };
   }

   var formatTime = function( date ){
      return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
   };

   var fMetric  = MMTDrop.filterFactory.createMetricFilter();
   var COL      = MMTDrop.constants.StatsColumn;



   var group = { _id : {} };
   [ COL.TIMESTAMP.id , COL.FORMAT_ID.id ].forEach( function( el, index){
      group["_id"][ el ] = "$" + el;
   } );
   [ COL.UL_DATA_VOLUME.id, COL.DL_DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.UL_PACKET_COUNT.id, COL.DL_PACKET_COUNT.id, COL.UL_PAYLOAD_VOLUME.id, COL.DL_PAYLOAD_VOLUME.id ].forEach( function( el, index){
      group[ el ] = {"$sum" : "$" + el};
   });
   [ COL.TIMESTAMP.id , COL.FORMAT_ID.id ].forEach( function( el, index){
      group[ el ] = {"$last" : "$"+ el};
   });
   var match = {};
   if( key !== "match")
      match[ key ] = id;
   else
      match = JSON.parse( id );

   var query = [{"$match" : match}, {"$group" : group}];
   var database = new MMTDrop.Database({collection: "data_" + collection, action: "aggregate",
      query: query});


   var cLine = MMTDrop.chartFactory.createTimeline({
      getData: {
         getDataFn: function (db) {
            var col = fMetric.selectedOption();
            var cols = [];

            var period = fPeriod.getDistanceBetweenToSamples();

            var ylabel = col.label;
            col.total  = 0;

            if (col.id === MMTDrop.constants.StatsColumn.PACKET_COUNT.id) {
               ylabel += " (pps)";
            } else if (col.id === MMTDrop.constants.StatsColumn.ACTIVE_FLOWS.id) {
               ylabel += " (total)";
               period  = 1;
            } else {
               period /= 8; //  bit/second
               ylabel += " (bps)";
            }

            if (col.id !== COL.ACTIVE_FLOWS.id) {
               //dir = 1: incoming, -1 outgoing, 0: All
               cols.push( getCol(col, true)); //in
               cols.push( getCol(col, false)); //out
            } else
               cols.push(col);

            var obj  = {};
            var data = db.data();

            for (var i in data) {
               var msg   = data[i];
               var time  = msg[COL.TIMESTAMP.id];
               var exist = true;

               //data for this timestamp does not exist before
               if (obj[time] == undefined) {
                  exist = false;
                  obj[time] = {};
                  obj[time][COL.TIMESTAMP.id] = time;
               }


               for (var j in cols) {
                  var id = cols[j].id;

                  cols[j].total += msg[ id ];

                  if( msg[id] == undefined )
                     msg[id] = 0;

                  if (exist)
                     obj[time][id] += msg[id] / period;
                  else
                     obj[time][id] = msg[id] / period;
               }
            }

            for (var j in cols)
               if (col.id === COL.DATA_VOLUME.id || col.id === COL.PAYLOAD_VOLUME.id)
                  cols[j].label += " ("+ MMTDrop.tools.formatDataVolume( cols[j].total ) +"B)";
               else
                  cols[j].label += " ("+ MMTDrop.tools.formatLocaleNumber( cols[j].total ) +")";

            //first columns is timestamp
            cols.unshift(COL.TIMESTAMP);

            var $widget = $("#" + cLine.elemID).getWidgetParent();
            var height  = $widget.find(".grid-stack-item-content").innerHeight();
            height     -= $widget.find(".filter-bar").outerHeight(true) + 15;

            return {
               data    : obj,
               columns : cols,
               ylabel  : ylabel,
               height  : height,
               addZeroPoints:{
                  time_id       : 3,
                  time          : status_db.time,
                  sample_period : 1000 * fPeriod.getDistanceBetweenToSamples(),
                  probeStatus   : {}//data.length == 0 ? {} : status_db.probeStatus
               },
            };
         }
      },

      chart: {
         data:{
            type: "line"//step
         },
         color: {
            pattern: ['orange', 'green']
         },
         grid: {
            x: {
               show: false
            },
            y: {
               show: true
            }
         },
         axis: {
            x: {
               tick: {
                  format: formatTime,
               }
            },
         },
         zoom: {
            enabled: false,
            rescale: false
         },
         tooltip:{
            format: {
               title:  formatTime,
               name : function (name, ratio, id, index) {
                  return name.split(" ")[0]; //return only In/Out
               }
            }
         },
      },

      afterRender: function (chart) {
         //register resize handle
         var $widget = $("#" + chart.elemID).getWidgetParent();
         $widget.on("widget-resized", function (event, $widget) {
            var height = $widget.find(".grid-stack-item-content").innerHeight();
            height -= $widget.find(".filter-bar").outerHeight(true) + 15;
            chart.chart.resize({
               height: height
            });
         });
      }
   });


   var dataFlow = [{
      object: fMetric,
      effect: [{object: cLine}]
   }];

   var report = new MMTDrop.Report(
         // title
         "",
         // database
         database,
         // filers
         [fMetric],
         //charts
         [
            {
               charts: [cLine],
               width: 12
            },
            ],
            //order of data flux
            dataFlow
   );
   return report;
}



function createPopupReport( collection, key, id, title, probe_id, no_group, no_override_when_reload  ){

   var formatTime = function( date ){
      return moment( (new Date(date)).getTime() ).format( fPeriod.getTimeFormat() );
   };
   var rep   = createTrafficReport( collection, key, id );
   var $modal = MMTDrop.tools.getModalWindow("_pop_report");
   $modal.$title.html("Traffic of " + title + " (in period from "+ formatTime( status_db.time.begin )  +" to "+
         formatTime( status_db.time.end )  +")" );
   $modal.$content.html('<div id="_pop_report_graphs" style="height: 200px; width: 100%" class="">'
         +'<div class="center-block loading text-center" style="width: 100px; margin-top: 150px"> <i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>'
         +'<span class="sr-only">Loading...</span></div>'
         +'</di>');
   $modal.modal();
   //first draw of graph to get a blank one
   rep.renderTo("_pop_report_graphs");

   var param = {period: status_db.time, period_groupby: fPeriod.selectedOption().id};

   if( probe_id != undefined ){
      param.probe = [ probe_id ];

      var $match = {};
      $match[ COL.PROBE_ID.id ] =  probe_id ;
      param.query = [{$match: $match}];
   }

   if( no_group != undefined )
      param.no_group = no_group;
   if( no_override_when_reload != undefined )
      param.no_override_when_reload = no_override_when_reload;
   
   //reload the chart to draw a real data getting from server
   setTimeout( function(){
      rep.database.reload( param , function(new_data, rep){
         //for each element in dataFlow array
         for( var j in rep.dataFlow ){
            var filter = rep.dataFlow[ j ];
            if(!filter) return;

            filter = filter.object;
            if (filter instanceof MMTDrop.Filter)
               filter.filter();
            else if( filter ){ //chart
               filter.attachTo( rep.database );
               filter.redraw();
            }
         }
      }, rep);
   }, 1000);
   return rep;
}