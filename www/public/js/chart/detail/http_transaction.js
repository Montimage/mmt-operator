var arr = [
    {
        id: "realtime",
        title: "Transaction Details",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createDetailReport"
        },
    }
];


//create reports
var URL      = MMTDrop.tools.getURLParameters();
var ReportFactory = {
  createDetailReport : function( fPeriod ){
    fPeriod.hide();
    fAutoReload.hide();

    var id = URL.id;
    if( !isNaN(id) )
      id = parseInt(id);

    //this fuction (createTrafficReport) is created in common.js in order to be used by all tabs to popup the report created by itself
  }
}
