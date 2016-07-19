var arr = [
    {
        id: "realtime",
        title: "Upload SLA",
        x: 0,
        y: 0,
        width: 12,
        height: 3,
        type: "success",
        userData: {
            fn: "createUploadForm"
        },
    }
];

var availableReports = {
}



//create reports
var ReportFactory = {
	createUploadForm: function( fPeriod ){
    fPeriod.hide();
    fAutoReload.hide();

    var form_config = {
      type: "<div>",
      attr: {
        "class" : "col-md-8 col-md-offset-3",
        "style" : "margin-top: 50px"
      },
      children:[
        {
          type: "<div>",
          attr: {
            "class" : "row"
          },
          children : [
            {
              type: "<form>",
              attr: {
                "class"   :"form-horizontal",
                "method"  : "POST",
                "onsubmit": "return window._checkSubmit()"
              },
              children: [
                {
                  label : "Select SLA file",
                  type  : "<input>",
                  attr  : {
                    id      : "filename",
                    type    : "file",
                    required: true
                  }
                },
                {
                  type: "<div>",
                  children : [
                    {
                      type: "<button>",
                      attr: {
                        class   : "btn btn-danger",
                        type    : "submit",
                        text    : "Upload"
                      }
                    },{
                      type: "<button>",
                      attr: {
                        id      : "btnCancel",
                        class   : "btn btn-success",
                        style   : "margin-left: 30px",
                        type    : "button",
                        text    : "Cancel",
                        onclick : 'MMTDrop.tools.gotoURL("/chart/sla", {param: ["app_id", "probe_id"] } )'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    var uploading_progress_bar_config = {
      type : "<div>",
      attr : {
        style : "margin-top : 50px"
      },
      children: [
        {
          type: "<div>",
          attr: {
            id   : "uploading",
            class: "col-md-8 col-md-offset-2",
          },
          children: [
            {
              type : "<div>",
              attr : {
                style : "height: 32px"
              },
              children : [
                {
                  type : "<div>",
                  attr :{
                    class : "progress-bar progress-bar-success",
                    style : "line-height:32px; font-size: 16px",
                    text  : "uploading",
                    id    : "bar1"
                  }
                },{
                  type : "<div>",
                  attr :{
                    class : "progress-bar progress-bar-info",
                    style : "line-height:32px; font-size: 16px",
                    text  : "analyzing",
                    id    : "bar2"
                  }
                },{
                  type : "<div>",
                  attr :{
                    class : "progress-bar progress-bar-warning progress-bar-striped",
                    style : "line-height:32px; font-size: 16px",
                    text  : "creating application",
                    id    : "bar3"
                  }
                }
              ]
            }
          ]
        },{
          type : "<div>",
          attr : {
            class : "col-md-2"
          },
          children: [{
            type:  "<a>",
            attr: {
              id      : "btnDone",
              class   : "btn btn-success",
              type    : "button",
              href    : "#",
              style   : "display: none",
              text    : "Done",
              onclick : 'MMTDrop.tools.gotoURL("/chart/sla/metric", {param: ["app_id", "probe_id"] } )'
            }
          }]
        }
      ]
    }

    var $container = $("#" + arr[0].id + "-content" );
    $container.append( MMTDrop.tools.createForm( form_config ) ) ;

    //upload file
    var upload_sla_file = function(){
      var app_id = MMTDrop.tools.getURLParameters().app_id;
      if( app_id == undefined )
        app_id = "_undefined";

      //initial value of components and metrix, that are supposed to receive from SLA file
      var init_components = [
        {id: "0", title: "Journey Planner Component", url: "192.168.0.8", metrics : [
          {id: "101", name: "", title: "Vulnerability Measure", alert: ">= 0", violation: ">= 0"},
          {id: "102", name: "", title: "Risk Assessment Vulnerability Measure", alert: "> 0", violation: "> 0"},
          {id: "103",  name: "", title: "Up Report Frequency", alert:  "= 24", violation : "= 24"},
          {id: "104",  name: "", title: "Resilience to attacks", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "105",  name: "", title: "Vulnerability and malware", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "106",  name: "", title: "Level of Diversity", alert:  "> 1", violation : "> 1"},
          {id: "107",  name: "", title: "List Update Frequency", alert:  "= 24", violation : "= 24"},
          {id: "108",  name: "", title: "Personal data disclosure", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "109",  name: "", title: "Database activity monitoring", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "110",  name: "", title: "Level of Redundancy", alert:  ">=3", violation : ">=3"},
          {id: "111",  name: "", title: "Forward Secrecy", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "112",  name: "", title: "Client-side Encryption Certification", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "113",  name: "", title: "System and Communication Protection Measure", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "114",  name: "", title: "TLS Cryptographic Strength", alert:  "= 6", violation : "= 6"},
          {id: "115",  name: "", title: "SQL injection", alert:  "= \"Yes\"", violation : "= \"Yes\""},
          {id: "116",  name: "", title: "Identity Assurance", alert:  "= 2", violation : "= 2"},
        ]},
        {id: "1", title: "Database", url: "192.168.0.9", metrics:[
          {id: "201", name: "", title: "Resiliance to attacks", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "202", name: "", title: "Vulnerability and malware", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "203", name: "", title: "Vulnerability Measure", alert: ">=0", violation: ">=0"},
          {id: "204", name: "", title: "Data encryption", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "205", name: "", title: "Personal data disclosure", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "206", name: "", title: "Database activity monitoring", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "207", name: "", title: "Level of confidentiality", alert: "= 0", violation: "= 0"},
          {id: "208", name: "", title: "TLS Cryptographic Strength", alert: "= 7", violation: "= 7"},
          {id: "209", name: "", title: "SQL injection", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "210", name: "", title: "HTTP to HTTPS Redirects", alert: "= \"Yes\"", violation: "= \"Yes\""},
          {id: "211", name: "", title: "Type of incident notification", alert: "= 0", violation: "= 0"},
          {id: "212", name: "", title: "Number of Data Subject Access Requests", alert: ">=1", violation: ">=1"},

        ]},
        {id: "2", title: "ITS Factory", url: "192.168.0.9", metrics : [
          {id : "301", name: "", title: "Database activity monitoring", alert: " = \"Yes\"", violation: " = \"Yes\""},
          {id : "302", name: "", title: "Vulnerability Measure", alert: " >=0", violation: " >=0"},
          {id : "303", name: "", title: "Resiliance to attacks", alert: " = \"Yes\"", violation: " = \"Yes\""},
          {id : "304", name: "", title: "Client-side Encryption Certification", alert: " = \"Yes\"", violation: " = \"Yes\""},
          {id : "305", name: "", title: "System and Communication Protection Measure", alert: " >=0", violation: " >=0"},
          {id : "306", name: "", title: "TLS Cryptographic Strength", alert: "= 7", violation: "= 7"},
          {id : "307", name: "", title: "Identity Assurance", alert: "= 0", violation: "= 0"},
        ]},
      ];

      var init_metrics = [
        {id: "1", name: "availability", alert: "= 0", violation: "= 0", title: "Availability" },
        {id: "2", name: "rtt", alert: ">= 1000", violation: ">= 3000", title: "Response Time" },
        {id: "3", name: "location", alert: "= \"France\"", violation: "= \"France\" ", title: "Location" },
      ];

      //save to db
      MMTDrop.tools.ajax("/api/metrics/update", {
        "$match"   : {"_id" : app_id},
        "$data"    : {
          _id        : app_id,
          app_id     : app_id,
          components : init_components,
          metrics    : init_metrics
        },
        "$options" : {
          upsert : true
        }
      },
      "POST",
      //callback
      {
        error   : function(){
          console.error( "AJAX Error" )
        },
        success : function(){
          //goto here to modify the uploaded metrics

        }
      })
    };

    window._checkSubmit = function(){
      $container.children().replaceWith( MMTDrop.tools.createDOM( uploading_progress_bar_config ) );

      upload_sla_file();

      $("#bar1").addClass("active progress-bar-striped").show().width("15%");
      setTimeout( function(){
        $("#bar1").removeClass("active progress-bar-striped").text("uploaded");

        $("#bar2").addClass("active progress-bar-striped").show().width("25%");
      }, 2000);


      setTimeout( function(){
        $("#bar2").removeClass("active progress-bar-striped").text("analyzed");

        $("#bar3").addClass("active progress-bar-striped").show().width("60%");
      }, 3500);


      setTimeout( function(){
        $("#bar3").removeClass("active progress-bar-striped").text("created application");

        $("#btnDone").show();

        alert("Created successfully application");
        MMTDrop.tools.gotoURL("/chart/sla/metric", {param: ["app_id", "probe_id"] } );
      }, 5000);

      return false;
    }

	}
}
