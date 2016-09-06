var arr = [
    {
        id: "metric",
        title: "Select Metrics",
        x: 0,
        y: 0,
        width: 12,
        height: 9,
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
    fPeriod.hide();
    fAutoReload.hide();

    var _this    = this;
    var app_id = MMTDrop.tools.getURLParameters().app_id;
    if( app_id == undefined )
        app_id = "_undefined";

    //RENDER TABLE
    var renderTable = function ( obj ){
      //this is used when use submit the form
      window._mmt = obj;

      var init_components = obj.components,
          init_metrics    = obj.metrics;

      var table_rows = [{
        type    : "<thead>",
        children: [{
          type     : "<tr>",
          children : [{
            type : "<th>",
          },{
            type : "<th>",
            attr : {
              text : "Metrics"
            }
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
      for( var i=0; i<init_components.length; i++){
        var comp = init_components[ i ];
        var $row = {
          type    : "<tr>",
          children: [{
            type :  "<td>",
            attr : {
              colspan : 6,
              style   : "font-weight: bold",
              text    : comp.title + " ("+ comp.url +")"
            }
          }]
        };

        //first row for component's title
        table_rows.push( $row );


        //common metrics
        var metrics = init_metrics.slice( 0 );
        //private metrics of each component
        if( comp.metrics )
          metrics = metrics.concat( comp.metrics.slice( 0 ) );

        //each row for a metric
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

          //title
          row.children.push({
            type  : "<td>",
            attr  : {
              text : me.title
            }
          });

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
                  checked : (me.name == "" ? false: true)//TODO to enable
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
          table_rows.push( row );
        }
      }

      var form_config = {
        type  : "<div>",
        attr  : {
          class  : "col-md-10 col-md-offset-1",
          style  : "margin-top: 20px, padding-bottom: 20px"
        },
        children : [{
          type     : "<form>",
          children : [{
            type     : "<table>",
            attr     : {
              class : "table table-striped table-bordered table-condensed dataTable no-footer",
              id    : "tblData"
            },
            children : table_rows
          },{
            type: "<div>",
            attr: {
              style: "margin-top:10px; margin-bottom: 20px"
            },
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
                type: "<a>",
                attr: {
                  class   : "btn btn-success",
                  style   : "margin-left: 30px",
                  text    : "Reset",
                  onclick : "window._loadSelectedMetrics()"
                }
              },{
                type: "<a>",
                attr: {
                  class   : "btn btn-warning pull-right",
                  style   : "margin-left: 30px",
                  text    : "Upload new SLA",
                  href    : '/chart/sla/upload' + MMTDrop.tools.getQueryString(["app_id"])
                }
              },{
                type: "<button>",
                attr: {
                  class   : "btn btn-primary pull-right",
                  style   : "margin-left: 30px",
                  type    : "reset",
                  text    : "Reset to Initial Value",
                }
              },{
                type: "<a>",
                attr: {
                  class   : "btn btn-success pull-right",
                  style   : "margin-left: 30px",
                  text    : "Cancel",
                  href    : '/chart/sla' + MMTDrop.tools.getQueryString(["app_id"])
                }
              },
            ]
          }]
        }]
      };

      $("#" + arr[0].id + "-content" ).append( MMTDrop.tools.createDOM( form_config ) ) ;
      window._loadSelectedMetrics();
    }//end rederTable function


    //load the previously selected values to the form
    window._loadSelectedMetrics = function(){
      var obj = window._mmt;
      if( obj.selectedMetric == undefined )
        return;

      for( var i=0; i<obj.components.length; i++){
        var comp = obj.components[ i ];
        //common metrics
        var metrics = obj.metrics.slice( 0 );
        //private metrics of each component
        if( comp.metrics )
          metrics = metrics.concat( comp.metrics.slice( 0 ) )


        for( var j=0; j<metrics.length; j++ ){
          var me  = metrics[ j ];
          var sel = obj.selectedMetric[ comp.id ];
          if( sel != undefined )
            sel = sel[ me.id ];
          if( sel == undefined )
            continue;

          var id = comp.id + "-" + me.id;

          $("#alert-"     + id).val( sel.alert     ),
          $("#violation-" + id).val( sel.violation ),
          $("#priority-"  + id).val( sel.priority  ),
          $("#enable-"    + id).prop( "checked", sel.enable )
        }
      }
    }//end load the previously selected values to the form



    //SUBMIT FORM
    window._checkSubmit = function(){
      var obj = window._mmt;

      var selectedMetric = {};
      for( var i=0; i<obj.components.length; i++){
        var comp = obj.components[ i ];
        //selected metrics of the compoment comp
        selectedMetric[ comp.id ] = {};

        //common metrics
        var metrics = obj.metrics.slice( 0 );
        //private metrics of each component
        if( comp.metrics )
          metrics = metrics.concat( comp.metrics.slice( 0 ) )

        for( var j=0; j<metrics.length; j++ ){
          var me = metrics[ j ];
          var id = comp.id + "-" + me.id;

          selectedMetric[ comp.id ][ me.id ] = {
            alert     : $("#alert-" + id).val(),
            violation : $("#violation-" + id).val(),
            priority  : $("#priority-" + id).val(),
            enable    : $("#enable-" + id).is(":checked")
          };
        }
      }
      //save to db
      MMTDrop.tools.ajax("/api/metrics/update", {
        "$match"   : {"_id" : app_id},
        "$data"    : {
          "$set" : {selectedMetric : selectedMetric}
        }
      },
      "POST",
      //callback
      {
        error   : function(){
          console.error( "AJAX Error" )
        },
        success : function( ){
          MMTDrop.tools.gotoURL("/chart/sla", {param : ["app_id"]} )
        }
      })

      return false;
    }//END SUBMIT FORM


    //LOAD METRIX FROM DATABASE
    MMTDrop.tools.ajax("/api/metrics/find?raw", [{$match: {app_id : app_id}}], "POST", {
      error  : function(){},
      success: function( data ){
        var obj = data.data[0];
        //does not exist ?
        if( obj == undefined )
          MMTDrop.tools.gotoURL("/chart/sla/upload", {param:["app_id"]});
        else
          renderTable( obj );
      }
    } );
    //end LOADING METRIX
  },
}
