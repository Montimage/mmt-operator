var arr = [
    {
        id: "metric",
        title: "Select Metrics",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createMetricReport"
        },
    }
];

var availableReports = {}

//create reports

var ReportFactory = {
  createMetricReport: function ( fPeriod ) {
    var _this    = this;
    var components = [
      {id: "0", title: "JPlanner", url: "192.168.0.8"},
      {id: "1", title: "CEC", url: "192.168.0.9"},
    ];

    var metrics = [
      {id: "1", name: "availability", alert: "= 0", violation: "= 0", title: "Availability" },
      {id: "2", name: "rtt", alert: ">= 200", violation: ">= 300 ", title: "Response Time" },
      {id: "3", name: "location", alert: "= \"France\"", violation: "= \"France\" ", title: "Location" },
    ];

    window._mmt = {
      components : components,
      metrics    : metrics,
    }

    var table_rows = [{
      type    : "<thead>",
      children: [{
        type     : "<tr>",
        children : [{
          type : "<th>",
        },{
          type : "<th>",
          attr : {
            text : "Alerts"
          }
        },{
          type : "<th>",
          attr : {
            text : "Violations"
          }
        },{
          type : "<th>",
          attr : {
            text : "Priority"
          }
        },{
          type : "<th>",
          attr : {
            text : "Enable"
          }
        }]
      }]
    }];
    for( var i=0; i<components.length; i++){
      var comp = components[ i ];
      var $row = {
        type    : "<tr>",
        children: [{
          type :  "<td>",
          attr : {
            colspan : 5,
            style   : "font-weight: bold",
            text    : comp.title + " ("+ comp.url +")"
          }
        }]
      };

      //first row for component's title
      table_rows.push( $row );

      //each row for metric
      for( var j=0; j<metrics.length; j++ ){
        var me = metrics[ j ];
        row = {
          type    : "<tr>",
          children: []
        };
        //first column
        if( j == 0 )
          row.children.push({
            type : "<td>",
            attr : {
              rowspan : metrics.length
            }
          })
        //alert
        row.children.push({
          type     : "<td>",
          children : [{
            type : "<input>",
            attr : {
              id      : "alert-" + comp.id + "-" + me.id,
              class   : "form-control",
              type    : "text",
              required: true,
              value   : me.alert
            }
          }]
        });
        //violation
        row.children.push({
          type     : "<td>",
          children : [{
            type : "<input>",
            attr : {
              id      : "violation-" + comp.id + "-" + me.id,
              class   : "form-control",
              type    : "text",
              required: true,
              value   : me.violation
            }
          }]
        });
        //priority
        row.children.push({
          type     : "<td>",
          children : [{
            type : "<select>",
            attr : {
              id      : "priority-" + comp.id + "-" + me.id,
              class   : "form-control",
              required: true,
            },
            children : [{
              type : "<option>",
              attr : {
                value : 0,
                text  : "High"
              }
            },{
              type : "<option>",
              attr : {
                value : 1,
                text  : "Default"
              }
            },{
              type : "<option>",
              attr : {
                value : 2,
                text  : "Low"
              }
            }]
          }]
        });
        //enable/disable
        row.children.push({
          type     : "<td>",
          children : [{
            type : "<div>",
            attr : {
              class   : "onoffswitch",
              style   : "margin: 0 auto"
            },
            children : [{
              type    : "<input>",
              attr    : {
                id      : "enable-" + comp.id + "-" + me.id,
                class   : "onoffswitch-checkbox",
                type    : "checkbox",
                checked : true
              }
            },{
              type    : "<label>",
              attr    : {
                class   : "onoffswitch-label",
                for     : "enable-" + comp.id + "-" + me.id,
              },
              children  : [{
                type  : "<span>",
                attr  : {
                  class : "onoffswitch-inner"
                }
              },{
                type  : "<span>",
                attr  : {
                  class : "onoffswitch-switch"
                }
              }]
            }]
          }]
        });
        //detail
        /*
        row.children.push({
          type     : "<td>",
          attr     : {
            align : "center"
          },
          children : [{
            type : "<button>",
            attr : {
              id      : "btnCancel",
              class   : "btn btn-info",
              type    : "button",
              text    : "Report",
              onclick : 'MMTDrop.tools.gotoURL("/chart/sla/'+ me.name +'", {param: ["app_id", "probe_id"] } )'
            }
          }]
        });
        */
        table_rows.push( row );
      }
    }

    var form_config = {
      type  : "<div>",
      attr  : {
        class  : "col-md-10 col-md-offset-1",
        style  : "margin-top: 20px"
      },
      children : [{
        type     : "<form>",
        children : [{
          type     : "<table>",
          attr     : {
            class : "table table-striped table-bordered table-condensed dataTable no-footer"
          },
          children : table_rows
        },{
          type: "<div>",
          children : [
            {
              type: "<button>",
              attr: {
                class   : "btn btn-danger",
                type    : "button",
                text    : "Submit",
                onclick : "window._checkSubmit()",
              }
            },{
              type: "<button>",
              attr: {
                id      : "btnReset",
                class   : "btn btn-success",
                style   : "margin-left: 30px",
                type    : "reset",
                text    : "Reset",
              }
            },{
              type: "<a>",
              attr: {
                id      : "btnCancel",
                class   : "btn btn-success pull-right",
                style   : "margin-left: 30px",
                text    : "Cancel",
                href    : '/chart/sla' + MMTDrop.tools.getQueryString(["app_id"])
              }
            }
          ]
        }]
      }]
    };

    $("#" + arr[0].id + "-content" ).append( MMTDrop.tools.createDOM( form_config ) ) ;

    window._checkSubmit = function(){
      var app_id = MMTDrop.tools.getURLParameters().app_id;
      var obj = window._mmt;
      obj.app_id = app_id;
      obj._id    = app_id;
      obj.selectedMetric = {};
      for( var i=0; i<obj.components.length; i++){
        var comp = obj.components[ i ];
        var selectedMetrics = {};
        for( var j=0; j<obj.metrics.length; j++ ){
          var me = obj.metrics[ j ];
          var id = comp.id + "-" + me.id;
          var isEnable = $("#enable-" + id).is(":checked");
          if( !isEnable )
            continue;

          selectedMetrics[ me.id ] = {
            alert     : $("#alert-" + id).val(),
            violation : $("#violation-" + id).val(),
            priority  : $("#priority-" + id).val()
          };

        }
        obj.selectedMetric[ comp.id ] = selectedMetrics;
      }
      //save to db
      MMTDrop.tools.ajax("/api/metrics/update", {
        "$match"   : {"_id" : app_id},
        "$data"    : obj,
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
          MMTDrop.tools.gotoURL("/chart/sla", {param : ["app_id"]} )
        }
      })

      return false;
    }
  },
}
