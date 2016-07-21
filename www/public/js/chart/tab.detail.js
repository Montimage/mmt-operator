var arr = [
    {
        id: "realtime",
        title: "Traffic",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createTrafficReport"
        },
    }
];


//create reports
var URL      = MMTDrop.tools.getURLParameters();
arr[0].title = "Traffic of " + URL.title;

var ReportFactory = {
  createTrafficReport : function( fPeriod ){
    var id = URL.id;
    if( !isNaN(id) )
      id = parseInt(id);

    //this fuction (createTrafficReport) is created in common.js in order to be used by all tabs to popup the report created by itself
    return createTrafficReport( URL.collection, URL.key, id );
  }
}
