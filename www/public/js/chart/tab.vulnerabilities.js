var arr = [
   {
     id: "vulnerabilities",
 
     title: "Vulnerabilities",
 
     x: 0,
 
     y: 7,
 
     width: 12,
 
     height: 7,
 
     type: "info",
 
     userData: {
       fn: "createVulnerabilitiesReport",
     },
   }
   
 ];
 
 
 var availableReports = {
   createNodeReport: "Vulnerabilities",
 };
 
 
 var ReportFactory = {};
 
 //When does it activate with a table?
 
 MMTDrop.callback = {
   chart: {
     afterRender: loading.onChartLoad,
   },
 };
 var detailOfPopupProperty = null;
 
 
 ReportFactory.createVulnerabilitiesReport = function (fPeriod) {
   const COL = MMTDrop.constants.RemediationColumn;
 
 
 
   const database = new MMTDrop.Database({
     collection: "CivCollection",
 
     query: [],
 
     action: "aggregate",//aggregate
 
     raw: true,
 
     no_group: true,
 
     no_override_when_reload: true,
   }, function( data ){
     //got data from DB
     console.log("Data from db"+ JSON.stringify( data ))
     //do any processing here if need
     return data;
  }, false);
 
  
 
 
   database.updateParameter = function (_old_param) {
     fProbe.hide()
     console.log( fPeriod.selectedOption().id )
     console.log( fProbe.selectedOption().id )
 
     const $match = {
 
     };
     const $group   = {    _id: {      vulnerability_id: "$vulnerability_id"     },    count: { $sum: 1 } ,  "device":{ $first: "$device" },    "vulnerability_description":{ $first: "$vulnerability_description" }, "timestamp": {$first: "$timestamp"}, "vulnerability_reference":{ $first: "$vulnerability_reference" }   }; 
     const $project = {    "_id":0 , vulnerability_id: "$_id.vulnerability_id",  device : 1,  vulnerability_description: 1 ,timestamp:1 , vulnerability_reference:1, count: 1 } ;
 
 
     return { query: [ {$match : $match},{$group : $group},{$project : $project} ] };
   };
 
   
 
   var cTable = MMTDrop.chartFactory.createTable({
     getData: {
       getDataFn: function (db) {
         const data = db.data();
 
         console.log("Database data: " + data);
 
        
        for (var i = 0; i < data.length; i++){

                data[i]["Row"]=i+1; //initialize column of rows with correct number
      
         }
 
         return {
           columns: [
             //{id: 1, label: "App ID"},
             {id : "Row",label:"Row"},
             {id : "vulnerability_description", label: "Description"}   ,       
             {id : "device", label: "Device"} ,  
             {id : "timestamp", label: "Timestamp"} ,
             {id : "vulnerability_id", label: "Vulnerability id"} ,
             {id:  "vulnerability_reference", label: "Reference"},
             {id:  "count", label: "#"}
       ],
 
           data: data,
         };
       },
     },
 
     chart: {
       //order: [[1, "asc"]],
 
       dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><'row-cursor-pointer't><'row'<'col-sm-3'i><'col-sm-9'p>>",
 
       deferRender: true,
     }
 

 
    
   });
 
       
  
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
 
         width: 12,
       },
     ],
 
     //order of data flux
 
     [{ object: cTable }]
   );
 
   return report;
 };
 