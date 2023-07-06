var arr = [
  {
    id: "security",

    title: "Remediation",

    x: 0,

    y: 7,

    width: 12,

    height: 7,

    type: "info",

    userData: {
      fn: "createRemediationReport",
    },
  },
];

console.log("line 15");

var availableReports = {
  createNodeReport: "Security",
};

console.log("line 19");

var ReportFactory = {};

//When does it activate with a table?

MMTDrop.callback = {
  chart: {
    afterRender: loading.onChartLoad,
  },
};

ReportFactory.createRemediationReport = function (fPeriod) {
  console.log("line 42");
  // var form_config = {
  //   type : "<div>",
  //   attr : {
  //     style : "margin: 40px 10px 10px 0px"
  //   },
  //   children: [
     
    
  //     //buttons
  //     {
  //       type  : "<div>",
  //       label : "",
  //       attr  : {
  //         class : ""
  //       },
  //       children : [{
  //         type: "<input>",
  //         attr: {
  //           type : "submit",
  //           id   : "conf-db-btnSave",
  //           class: "'sancus-button",
  //           value: 'Save'
  //         }
  //       }]
  //     }//end buttons
  //   ]
    
  // };


  const database = new MMTDrop.Database({
    collection: "remediation",

    query: [],

    action: "aggregate",//aggregate

    raw: true,

    no_group: true,

    no_override_when_reload: true,
  }, function( data ){
    //got data from DB
    console.log("Data from db"+ data)
    //do any processing here if need
    return data;
 }, false);


  database.updateParameter = function (_old_param) {
    fProbe.hide()
    console.log( fPeriod.selectedOption().id )
    console.log( fProbe.selectedOption().id )

    const $match = {
     	//"value" : {"$gt": 1}

    };

    //$match[ 1 ] = URL_PARAM.app_id(); //app id

    //$match["2"] = URL_PARAM.probe_id;

    //s$match["3"] = URL_PARAM.metric_id;

    return { query: [{ $match: $match }] };
  };

  var cTable = MMTDrop.chartFactory.createTable({
    getData: {
      getDataFn: function (db) {
        const data = db.data();

        console.log("Database data: " + data);

       
        for (var i = 0; i < data.length; i++){
          //data[i]["button"] ='<button type="button" onclick="f()">Click me!</button>';
          //data[i]["button"] = "<a href='/sancus/remediation?value=" + data[i]["value"] + "'>button</a>"

          //data[i]["button"] = "<a href='/sancus/remediation?value=" + data[i]["value"] + "&description="+data[i]["description"]+"'>button</a>"
          //data[i]["button"]="<a class='sancus-button' href='/sancus/remediation?value=" + data[i]["value"] + "'>button</a>

          //data[i]["button"]= "<a href='/sancus/remediation'>bottone</a>"
          data[i]["description"];
          data[i]["button"]='<button type="button"  class="sancus-button" >Send to Orchestrator</button>';
          // <a>http:/ /localhost:8080/sancus/remediation</a>
        }
     
            $(".sancus-button").on("click", function(){
              console.log("Button pressed!!!");
  
      
    });
        return {
          columns: [
            //{id: 1, label: "App ID"},

            { id: "CID", label: "CID" },
            {id : "description", label: "description"}   ,       
            {id : "attack", label: "attack"} ,        

            {id : "button", label: "click"}],

          data: data,
        };
      },
    },

    chart: {
      //order: [[1, "asc"]],

      dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><'row-cursor-pointer't><'row'<'col-sm-3'i><'col-sm-9'p>>",

      deferRender: true,
    },
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

