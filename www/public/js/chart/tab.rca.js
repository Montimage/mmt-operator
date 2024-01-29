var arr = [
   {
      id: "security",
      title: "RCA",
      x: 0,
      y: 6,
      width: 12,
      height: 8,
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

var dataValues =[];
var middleIndex = undefined;


var ReportFactory = {};
ReportFactory.createRcaReport = function(fPeriod){
   const COL = MMTDrop.constants.SecurityColumn;
   const database = new MMTDrop.Database({
      collection: "report",  //name of collection which must be inside "mmt-data" database
      action: "find",
      no_group : true, 
      query: [],
      no_override_when_reload: true, 
      raw: true,
   }, function( data ){
      //got data from DB
      console.log(data)
      dataValues = data
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
      const $match = { _id: {$gt: 0}};

      return {query: [{$match: $match}]};
   };

   var cLine = MMTDrop.chartFactory.createXY({
      //columns: [MMTDrop.constants.StatsColumn.APP_PATH]
      getData: {
         getDataFn: function (db) {
            var data = db.data();
            // console.log(data[0])
            if(data[0].id!==0){
               data.unshift({"_id":0,"KnownIncidentID":"0"}) //in this way the graph starts always in the origin if no point with x=0 is present
            }
            // valuesToPush = [{"_id":10,"KnownIncidentID":0},{"_id":11,"KnownIncidentID":0},{"_id":12,"KnownIncidentID":0},{"_id":13,"KnownIncidentID":3},{"_id":14,"KnownIncidentID":3},{"_id":15,"KnownIncidentID":0},{"_id":16,"KnownIncidentID":0}]
            // data.push(...valuesToPush)
            dataValues = data;
            console.log(dataValues)

            //data is an array whose element is in form
            //   {_id: 2, KnownIncidentID: 0, ... }
            var $widget = $("#" + cLine.elemID).getWidgetParent();
            $widget.find(".filter-bar").height(25);
            var height = $widget.find(".grid-stack-item-content").innerHeight();
            height -= $widget.find(".filter-bar").outerHeight(true) + 20;

            return {
               data   : data,
               //columns[0] is Ox
               columns: [{id: "_id", label: "id"}, {id:"KnownIncidentID", label:"Incident"}],
               // ylabel : "Type of incident occured",
               height : height, //fulfill the widget
               //this "chart" option will override the "chart" option few lines below
               // chart  : { axis : {x: { tick: {count: 20}} }}
            };
         },
      },
      //options for the chart: https://c3js.org/reference.html
      //note: the options may be slightly different as we use the version v0.4.11 - 2016-05-01
      chart: {
         data:{
            type: "step",
            labels: {
               format: function (v, id, i, j) {
                  var previousKnownIncidentID = dataValues[i - 1] ? dataValues[i - 1]["KnownIncidentID"] : undefined;
                  if (v === 0 && (i === 0 || (i > 0 && v != previousKnownIncidentID))) {
                     return null;
                  } else if (v!==0 && i > 0 && v != previousKnownIncidentID) {
                     return v;
                  } else {
                     return null; 
                  }
               }
               
            }
         },
         subchart: {
            show: true
        },
         axis: {
            x: {
               type: "indexed", //see https://c3js.org/reference.html#axis-x-type
               tick: {
                  fit: true,
                  centered: true,
                  format: function(val){
                     // var currentData = dataValues[parseIval - 1];
                     let intVal = parseInt(val)
                     if(!!dataValues[intVal-1] && !!dataValues[intVal]){
                        var currentData = dataValues[intVal - 1];
                        if (!!currentData && currentData.KnownIncidentID !== dataValues[intVal].KnownIncidentID) {
                           console.log('cambio current id' + currentData._id);
                           return parseInt(currentData._id);
                        }
                     }
                     // console.log(dataValues); return parseInt(val)
                  },
                  count: 20,
                  // culling:{
                  //    max: 10
                  // }
               },
               min: 0,
               max: 80,
               label: {
                  text: 'Occurance time',
                  position: 'outer-center'
               }
            },
            y:{
               tick:{
                  // format: function(val) {return parseInt(val)},
                  format: d3.format('d'),
                  values: [0,1,2,3]
               },
               padding: {
                  top: 50
               },
               label: {
                  text: 'Type of incident occured',
                  position: 'outer-middle'
               }
            }
         },
         grid: {
            x: {
               show: false
            }
         },
         tooltip:{
            format: {
               title:  function(val){
                  return "Detection point n " + val
               },
               value: function( value ){
                  return "Incident of type " + value;
               }
            }
         },
         zoom: {
            enabled: true,
            rescale: true
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

