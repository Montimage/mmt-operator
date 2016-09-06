var arr = [
    {
        id: "realtime",
        title: "Upload SLA",
        x: 0,
        y: 0,
        width: 12,
        height: 4,
        type: "success",
        userData: {
            fn: "createUploadForm"
        },
    }
];

var availableReports = {
}


//initial value of components and metrix, that are supposed to receive from SLA file
var init_components = [
  {id: "0", title: "Journey Planner Component", url: "192.168.0.8", metrics : []},
  {id: "1", title: "Database", url: "192.168.0.9", metrics:[]},
  {id: "2", title: "ITS Factory", url: "192.168.0.9", metrics : []},
];

var init_metrics = [
  {id: "1", name: "availability", alert: "= 0", violation: "= 0", title: "Availability" },
  {id: "2", name: "rtt", alert: ">= 1000", violation: ">= 3000", title: "Response Time" },
  {id: "3", name: "location", alert: "= \"France\"", violation: "= \"France\" ", title: "Location" },
];


//create reports
var ReportFactory = {
	createUploadForm: function( fPeriod ){
    fPeriod.hide();
    fAutoReload.hide();

    var app_id = MMTDrop.tools.getURLParameters().app_id || 0;
    var sla_inputs = [];
    for( var i=0; i<init_components.length; i++){
      var com = init_components[i];

      sla_inputs.push({
        label : com.title,
        type  : "<input>",
        attr  : {
          id      : "filename_" + com.id,
          type    : "file",
          name    : "filename_" + com.id,
          multiple: false,
          accept  : ".xml",
          required: true
        }
      });

      sla_inputs.push( {
        type : "<input>",
        attr : {
          type : "hidden",
          value: JSON.stringify( com ),
          name : "com_" + com.id
        }
      } )
    }

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
                "class"   : "form-horizontal",
                "enctype" : "multipart/form-data",
                "method"  : "POST",
                "action"  : "/sla/upload/" + app_id,
                "onsubmit": "return window._checkSubmit()"
              },
              children: [{
                  type : "<div>",
                  attr : {
                    class: "text-center",
                    style: "font-weight:bold; margin-bottom: 10px",
                    text : "Select SLA file for each component"
                  }
                },
                {
                  type: "<div>",
                  children: sla_inputs
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
      if( app_id == undefined )
        app_id = "_undefined";

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
      upload_sla_file();

      $container.children().replaceWith( MMTDrop.tools.createDOM( uploading_progress_bar_config ) );

      var timer = setInterval( function(){
        MMTDrop.tools.ajax("/sla/upload/" + app_id, {}, "GET", {
          error: function( request, status, error ){
            clearInterval( timer );
            $("#bar1").removeClass("active progress-bar-striped");
            $("#bar2").removeClass("active progress-bar-striped");
            $("#bar3").removeClass("active progress-bar-striped").text( request.responseText || error.message );
          },
          success: function( obj ){
            console.log( obj );
            var progress = obj.progress, message = obj.message;
            if( progress <= 30 ){
              $("#bar1").addClass("active progress-bar-striped").show().width( progress + "%").text( message );
            }
            else if( progress <= 60 ){
              $("#bar1").removeClass("active progress-bar-striped");
              $("#bar2").addClass("active progress-bar-striped").show().width( progress + "%").text( message );
            }
            else {
              $("#bar1").removeClass("active progress-bar-striped");
              $("#bar2").removeClass("active progress-bar-striped");
              $("#bar3").removeClass("active progress-bar-striped").show().width( progress + "%").text( message );

              if( progress == 100 ){
                clearInterval( timer );

                if( !obj.error ){
                  $("#btnDone").show();
                  alert("Created successfully application");
                  //MMTDrop.tools.gotoURL("/chart/sla/metric", {param: ["app_id", "probe_id"] } );
                }
              }
            }
          }
        });//end ajax
      }, 1000);

      return true;
    }

	}
}
