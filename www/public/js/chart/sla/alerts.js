var arr = [
    {
        id: "security",
        title: "SLA/Incident Alerts",
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


ReportFactory.createSecurityRealtimeReport = function (fPeriod) {
   /*
    var database = new MMTDrop.Database({
        format: MMTDrop.constants.CsvFormat.SECURITY_FORMAT,
        userData: {
            type: "security"
        }
    }, null, false);
*/
   
    const database = new MMTDrop.Database({collection: "metrics_alerts", 
       query:[], action: "aggregate", raw: true, no_group: true, no_override_when_reload: true });
    
    database.updateParameter = function(){
       const $match = {};
       $match[ "0" ] = {"$gte": status_db.time.begin, "$lt" : status_db.time.end };
       //$match[ 1 ] = URL_PARAM.app_id(); //app id
       $match[ "2" ] = URL_PARAM.probe_id;
       $match[ "3" ] = URL_PARAM.metric_id;
       
       return {query: [{$match: $match}] } 
    }

    var cTable = MMTDrop.chartFactory.createTable( {
       getData: {
          getDataFn: function (db ){
             const data = db.data();
             for( var i=0; i<data.length; i++ )
                data[ i ][ 0 ] = MMTDrop.tools.formatDateTime( data[ i ][ 0 ] );
             return {
                columns: [{id: 0, label: "Timestamp"}, 
                          //{id: 1, label: "App ID"},
                          {id: 2, label: "Comp. ID", align: "right"},
                          {id: 3, label: "Metric ID"},
                          {id: 4, label: "Type"},
                          {id: 5, label: "Priority"},
                          {id: 6, label: "Threshold"},
                          {id: 7, label: "Value"}],
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
