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
var detailOfPopupProperty = null;


ReportFactory.createRemediationReport = function (fPeriod) {
  console.log("line 42");
//   var form_config = {
 
//       type  : "<div>",
//       label : "",
//       attr  : {
//         class : ""
//       },
//       children : [{

//         type: "<input>",
//         attr: {
//           type : "button",
//           id   : "conf-db-btnEmpty",
//           style: "margin-right: 10px",
//           class: "btn btn-danger pull-right",
//           value: 'Empty DB'
//         }
//       }]
//     }//end buttons
  
  
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
          //data[i]["button"] = "<a href='/sancus/remediation?cid=" + data[i]["CID"] + "'>Send orchestrator</a>"
          //data[i]["button"] = '<form action="/sancus/remediation?CID='+data[i]["CID"]+'" method="POST"> <button type="submit">Send POST Request</button>'
          //data[i]["button"] = "<a href='/sancus/remediation?value=" + data[i]["value"] + "&description="+data[i]["description"]+"'>button</a>"
      //    data[i]["button"]="<a class='sancus-button' href='/sancus/remediation?cid=" + data[i]["CID"] + "'>button</a>"

        //data[i]["status"]=  `<button   id="sancus-buttton" style="background-color: #f1f1f1; border: none; padding: 0; cursor: pointer;"> <img id="red" src="../img/red_button.jpg" alt="Image" style="width: 20px; height: 20px;">`
        data[i]["status"]=    `<button  id="sancus-buttton`+i+`" style="background-color: #f1f1f1; border: none; padding: 0; cursor: pointer;"> <img id=red_`+i+`  src="../img/red_button.jpg" alt="Image" style="width: 20px; height: 20px;">`
        data[i]["Row"]=i+1;
     
       // data[i]["status"]=`<button  class="btn-primary" type="object" style="backgound-color:red"/>`;


      //data[i]["button"]= "<a href='/sancus/remediation'>bottone</a>"
         // data[i]["button"]='<button type="button"  class="sancus-button" >Send to Orchestrator</button>';
          // <a>http:/ /localhost:8080/sancus/remediation</a>
        }

        return {
          columns: [
            //{id: 1, label: "App ID"},
            {id:"Row",label:"Row"},
            { id: "CID", label: "CID" },
            {id : "description", label: "description"}   ,       
            {id : "attack", label: "Attack/Vulnerability"} ,        
          {id : "status", label: "status"}
      ],

          data: data,
        };
      },
    },

    chart: {
      //order: [[1, "asc"]],

      dom: "<'row'<'col-sm-5'l><'col-sm-7'f>><'row-cursor-pointer't><'row'<'col-sm-3'i><'col-sm-9'p>>",

      deferRender: true,
    },

    afterEachRender: function( _chart ){
      // Add event listener for opening and closing details
      _chart.chart.on('click', 'tr[role=row]', function (){
        console.log("Click su row");
         var tr = $(this);
         var row = _chart.chart.api().row(tr);
          console.log(" "+tr)
          var index = row.data()[0] - 1;

         var row_data = row.data();
         if( row_data == undefined )
             return;
             console.log(row_data[0]);//Access to first element of the row array
             const url = "/sancus/remediation?CID="+row_data[1];//Access to 2 column of CID

             MMTDrop.tools.ajax(url, {}, "POST", {
              error  : function(){
                MMTDrop.alert.error("Cannot send remediation", 10*1000);
              },
              success: function(){
                MMTDrop.alert.success("Remediation successfully sent ", 10*1000);
            // var button = document.getElementById("sancus-buttton");
            console.log(row_data[4]);
              var image = document.getElementById("red_"+index);
              image.src = "../img/green_button.png";
             image.style= "width: 20px; height: 20px";
            //   button.style.backgroundColor = "green";
          //  console.log(row_data[3])
     
              }
            })

         
      });

   }
  });

      
  /*
function sendPostRequest(data) {
    // Create an XMLHttpRequest object
    var xhr = new XMLHttpRequest();
  
    // Define the request parameters
    var url = '/sancus/remediation';
    var method = 'POST';
    var data_to_server = JSON.stringify({ CID: data }); // Replace with your desired data
    
    // Configure the request
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    MMTDrop.alert.success("your message here", 10*1000); 


    // Handle the response
    xhr.onload = function() {
      if (xhr.status === 200) {
        console.log('POST request successful');
        // Perform any additional actions on successful response
      } else {
        console.error('POST request failed');
        // Handle the error case
      }
    };

    // Send the request
    xhr.send(data_to_server);
  }
  */
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

