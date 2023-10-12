var arr = [
  {
    id: "security",

    title: "Remediation Attacks",

    x: 0,

    y: 7,

    width: 12,

    height: 7,

    type: "info",

    userData: {
      fn: "createRemediationReport",
    },
  },{
    id: "remediationVuln",
    title: "Remediation to Vulnerabilities",
    x: 0,
    y: 0,
    width: 12,
    height: 5,
    type: "info",
    userData: {
       fn: "createVulnerabilityReport"
    }
  }
];


var availableReports = {
  createNodeReport: "Security",
};

var ReportFactory = {};

//When does it activate with a table?

MMTDrop.callback = {
  chart: {
    afterRender: loading.onChartLoad,
  },
};
var detailOfPopupProperty = null;


ReportFactory.createRemediationReport = function (fPeriod) {
  const COL = MMTDrop.constants.RemediationColumn;


  const database = new MMTDrop.Database({
    collection: "remediationAttack",

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
    console.log("FPeriod "+ fPeriod.selectedOption().id )
    console.log( "FProbe "+fProbe.selectedOption().id )

    const $match = {
     	//"value" : {"$gt": 1}
    //   $and: [
       "count": { $gte: 1 }  // Filter out groups with a count of 1 (unique combination of field1 and field2)
     //  {"ipAttack": {$ne: ""}}
     //  ]
    };
    const $group   = {    _id: {      CID: "$CID",       attack: "$attack"      },    count: { $sum: 1 } ,      "description":{ $last: "$description" },"attackName":{ $last: "$attackName" },"ipAttack":{$last : "$ipAttack"}, "timestamp": {$last: "$timestamp"}    }; 
    const $project = {    "_id":0 , CID: "$_id.CID", attack: "$_id.attack",    description: 1, ipAttack:1 ,timestamp:1 , attackName:1,  count: 1 } ;
    //const $group = { _id: "$CID"};

    return { query: [ {$group : $group},{ $match: $match } ,{$project : $project}] };
  };

  

  var cTable = MMTDrop.chartFactory.createTable({
    getData: {
      getDataFn: function (db) {
        const data = db.data();

        console.log("Database data: " + data);

       
       for (var i = 0; i < data.length; i++){

        //data[i]["status"]=  `<button   id="sancus-buttton" style="background-color: #f1f1f1; border: none; padding: 0; cursor: pointer;"> <img id="red" src="../img/red_button.jpg" alt="Image" style="width: 20px; height: 20px;">`
        data[i]["status"] = `<button  id="sancus-buttton`+i+`" style="background-color: #f1f1f1; border: none; padding: 0; cursor: pointer;"> <img id=redAtt_`+i+`  src="../img/red_button.jpg" alt="Image" style="width: 20px; height: 20px;"> <span id = spanAtt_`+ i +`>Apply Remediation</span>  `;
        data[i]["Row"] = i+1; //initialize column of rows with correct number
     
      
        }

        return {
          columns: [
            //{id: 1, label: "App ID"},
            {id : "Row",label:"Row"},
            {id : "CID", label: "CID" },
            {id : "description", label: "Description"} ,       
            {id : "attack", label: "Attack id"} ,  
            {id: "attackName",label:"Attack Name "},
            {id : "timestamp", label: "Timestamp"} ,
            {id : "ipAttack", label: "IP attacker"} ,
            {id:  "count", label: "#"},
            {id : "status", label: "Status"}
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
        
         var tr = $(this);
         var row = _chart.chart.api().row(tr);
          var index = row.data()[0] - 1;

         var row_data = row.data();
         if( row_data == undefined )
             return;
             //console.log(row_data[0]);//Access to first element of the row array
             const url = "/sancus/remediation?CID=" + row_data[1] + "&IP=" + row_data[6]+"&AttackId="+row_data[3];//Access to 2 column of CID

             MMTDrop.tools.ajax(url, {}, "POST", {
              error  : function(){
                MMTDrop.alert.error("Error executing remediation", 10*1000);
              },
              success: function(){
                MMTDrop.alert.success("Remediation successfully sent ", 10*1000);
            // var button = document.getElementById("sancus-buttton");
            //console.log(row_data[4]);
              var image = document.getElementById("redAtt_"+index); //change image
              image.src = "../img/green_button.png";
             image.style = "width: 20px; height: 20px";
             var text = document.getElementById("spanAtt_"+index);
             text.textContent = "Remediation applied" ;
            //   button.style.backgroundColor = "green";
          //  console.log(row_data[3])
     
              }
            })

         
      });

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

ReportFactory.createVulnerabilityReport = function( fperiod) {

  const database = new MMTDrop.Database({
    collection: "remediationVuln",

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

      "count": { $gte: 1 }  // Filter out groups with a count of 1 (unique combination of field1 and field2)

  };
  const $group   = {    _id: {      CID: "$CID",       attack: "$attack"      },    count: { $sum: 1 } ,      "description":{ $first: "$description" }, "timestamp": {$first: "$timestamp"}    }; 
  const $project = {"_id":0 , CID: "$_id.CID", attack: "$_id.attack",    description: 1, timestamp:1 ,  count: 1 } ;



  return { query: [ {$group : $group},{ $match: $match } ,{$project : $project}] };
};

var cTable = MMTDrop.chartFactory.createTable({
  getData: {
    getDataFn: function (db) {
      const data = db.data();

      console.log("Database data: " + JSON.stringify(data) );

     
     for (var i = 0; i < data.length; i++){
        //data[i]["button"] ='<button type="button" onclick="f()">Click me!</button>';
        //data[i]["button"] = "<a href='/sancus/remediation?cid=" + data[i]["CID"] + "'>Send orchestrator</a>"
        //data[i]["button"] = '<form action="/sancus/remediation?CID='+data[i]["CID"]+'" method="POST"> <button type="submit">Send POST Request</button>'
        //data[i]["button"] = "<a href='/sancus/remediation?value=" + data[i]["value"] + "&description="+data[i]["description"]+"'>button</a>"
    //    data[i]["button"]="<a class='sancus-button' href='/sancus/remediation?cid=" + data[i]["CID"] + "'>button</a>"
    data[i]["Row"]=i+1; //initialize column of rows with correct number

      //data[i]["status"]=  `<button   id="sancus-buttton" style="background-color: #f1f1f1; border: none; padding: 0; cursor: pointer;"> <img id="red" src="../img/red_button.jpg" alt="Image" style="width: 20px; height: 20px;">`
          data[i]["status"] =  `<button  id="sancus-buttton`+i+`" style="background-color: #f1f1f1; border: none; padding: 0; cursor: pointer;"> <img id=red_`+i+`  src="../img/red_button.jpg" alt="Image" style="width: 20px; height: 20px;">  <span id= span_`+ i +`>Apply Remediation</span>  `;
   
     // data[i]["status"]=`<button  class="btn-primary" type="object" style="backgound-color:red"/>`;


    //data[i]["button"]= "<a href='/sancus/remediation'>bottone</a>"
       // data[i]["button"]='<button type="button"  class="sancus-button" >Send to Orchestrator</button>';
        // <a>http:/ /localhost:8080/sancus/remediation</a>
      }

      return {
        columns: [
          //{id: 1, label: "App ID"},
          {id : "Row",label:"Row"},
          {id : "CID", label: "CID" },
          {id : "description", label: "Description"}   ,       
          {id : "attack", label: "Vulnerability id"} ,  
          {id : "timestamp", label: "Timestamp"} ,
          {id : "count", label: "#" },
     //     {id : "ipAttack", label: "IP attacker"} ,

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
       var tr = $(this);
       var row = _chart.chart.api().row(tr);
        var index = row.data()[0] - 1;

       var row_data = row.data();
       if( row_data == undefined )
           return;
           //console.log(row_data[0]);//Access to first element of the row array
           const url = "/sancus/remediation?CID=" + row_data[1] + "&IP=" + row_data[5];//Access to 2 column of CID

           MMTDrop.tools.ajax(url, {}, "POST", {
            error  : function(){
              MMTDrop.alert.error("Error executing remediation", 10*1000);
            },
            success: function(){
              MMTDrop.alert.success("Remediation successfully sent ", 10*1000);
          // var button = document.getElementById("sancus-buttton");
          //console.log(row_data[4]);
            var image = document.getElementById("red_"+index);
            image.src = "../img/green_button.png";
           image.style= "width: 20px; height: 20px";
           var text = document.getElementById("span_"+index);
            text.textContent= "Remediation applied" ;
          //   button.style.backgroundColor = "green";
        //  console.log(row_data[3])
              selected_index.push(index);
            }
          })

       
    });

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