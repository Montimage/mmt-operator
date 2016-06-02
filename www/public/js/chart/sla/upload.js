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

    window._checkSubmit = function(){
      if( !confirm( "Do really you want to replace the current SLA?" ))
        return false;

      $container.children().replaceWith( MMTDrop.tools.createDOM( uploading_progress_bar_config ) );

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
