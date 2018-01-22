var arr = [
    {
        id: "security",
        title: "SLA/Authentication",
        x: 0,
        y: 7,
        width: 12,
        height: 8,
        type: "danger",
        userData: {
            fn: "createSecurityRealtimeReport"
        }
    }
];


var availableReports = {
    "createNodeReport":     "Security",
}

MMTDrop.callback = {
    chart : {
        afterRender : loading.onChartLoad
    }
};

var ReportFactory = {};

//a function to disable 2factors
if( URL_PARAM.disable2factors != undefined ){
   var data = {"name":"admin", "password":"12345", "tenant":"SYS"};
   MMTDrop.tools.proxy("http://demo.37.48.247.117.xip.io/api/security/authentication/login&data=" + JSON.stringify(data), {
      //data
   }, "POST", {
      success: function( session ){
         //switch to 2factors
         MMTDrop.tools.proxy("http://demo.37.48.247.117.xip.io/api/security/v1/userManagement/identity/LH/dummy1/switchTwoFactor?enabled=false", {
            //data
         }, "PUT", {
            success: function( session ){
               MMTDrop.alert.success("Disabled successfully to 2factors authentication", 4000 );
            }
         }, {
           "Content-Type": "application/json"
         });
      }
   });
}
//end

ReportFactory.createSecurityRealtimeReport = function (fPeriod) {
   /*
    var database = new MMTDrop.Database({
        format: MMTDrop.constants.CsvFormat.SECURITY_FORMAT,
        userData: {
            type: "security"
        }
    }, null, false);
*/
   
    const database = new MMTDrop.Database({collection: "metrics_authentication", 
       query:[], action: "find", raw: true, no_group: true, no_override_when_reload: true });
    
    database.updateParameter = function(){
       const $match = {};
       $match[ "ts" ] = {"$gte": status_db.time.begin };//, "$lt" : status_db.time.end };
       //$match[ 1 ] = URL_PARAM.app_id(); //app id
       
       return {query: [{$match: $match}, {$sort: {"ts": -1}}, {$limit: 100}] } 
    }

    var cTable = MMTDrop.chartFactory.createTable( {
       getData: {
          getDataFn: function (db ){
             const data = db.data();
             for( var i=0; i<data.length; i++ )
                data[ i ][ "ts" ] = MMTDrop.tools.formatDateTime( data[ i ][ "ts" ] );
             return {
                columns: [{id: "ts", label: "Timestamp"}, 
                          {id: "user", label: "User", align: "right"},
                          {id: "ip", label: "IP"},
                          {id: "ua", label: "User-Agent"}],
                data   : data
             }
          }
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
                width: 12
                },
					 ],

        //order of data flux
        [{object: cTable}]
    );

    return report;
}
