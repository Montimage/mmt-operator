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


var ReportFactory = {};
ReportFactory.createRcaReport = function(fPeriod){
   const COL = MMTDrop.constants.SecurityColumn;
   const database = new MMTDrop.Database({
      collection: "rca",  //name of collection which must be inside "mmt-data" database
      action: "find",
      no_group : true, 
      query: [],
      no_override_when_reload: true, 
      raw: true,
   }, function( data ){
      //got data from DB
      console.log(data)
      //do any processing here if need
      return data;
   }, false);

   database.updateParameter = function( _old_param ){
     //we update here the query which specify how-to query data from the "rca" collection
     // as we used 'action: "find"', we specify the "filter" https://www.mongodb.com/docs/manual/reference/command/find/
     // if we used 'action: "aggregate"', we specify an array of "pipeline"

     //fAutoReload, fPeriod, fProbe
     //to hide fAutoReload
     //fAutoReload.hide()
     fProbe.hide()
     console.log( fPeriod.selectedOption().id )
     console.log( fProbe.selectedOption().id )

     //  example: select only the documents having  1 < _id < 10
      const $match = { _id: {$gt: 1, $lt: 10}};

      return {query: [{$match: $match}]};
   };

   var cLine = MMTDrop.chartFactory.createXY({
      //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
      getData: {
         getDataFn: function (db) {
            var data = db.data();
            //data is an array whose element is in form
            //   {_id: 2, KnownIncidentID: 0, ... }
            var $widget = $("#" + cLine.elemID).getWidgetParent();
            $widget.find(".filter-bar").height(25);
            var height = $widget.find(".grid-stack-item-content").innerHeight();
            height -= $widget.find(".filter-bar").outerHeight(true) + 15;

            return {
               data   : data,
               //columns[0] is Ox
               columns: [{id: "_id", label: "id"}, {id:"KnownIncidentID", label:"Incident"}],
               ylabel : "Incident value",
               height : height, //fulfill the widget
               //this "chart" option will override the "chart" option few lines below
               chart  : { axis : {x: { tick: {count: 20}} }}
            };
         },
      },
      //options for the chart: https://c3js.org/reference.html
      //note: the options may be slightly different as we use the version v0.4.11 - 2016-05-01
      chart: {
         data:{
            type: "line"
         },
         axis: {
            x: {
               type: "indexed", //see https://c3js.org/reference.html#axis-x-type
               tick: {
                  format: function(val){ return val},
                  count: 10,
               },
               min: 1,
               max: 10
            },
         },
         grid: {
            x: {
               show: false
            }
         },
         tooltip:{
            format: {
               title:  function(val){
                  return "Hi " + val
               },
               value: function( value ){
                  return value + " incidents";
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
   }, false);

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

