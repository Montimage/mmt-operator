var arr = [
   {
      id: "security",
      title: "RCA",
      x: 0,
      y: 6,
      width: 12,
      height: 7,
      type: "info",
      userData: {
         fn: "createRcaReport"
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
ReportFactory.createRcaReport = function(fPeriod){
   const COL = MMTDrop.constants.SecurityColumn;
   const database = new MMTDrop.Database({
      collection: "rca",
      action: "aggregate",
      no_group : true, 
      no_override_when_reload: false, 
      raw: true,
   }, function( data ){
   console.log(data)
   
   
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

