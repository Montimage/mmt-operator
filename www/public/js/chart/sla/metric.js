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
            app_id = "__app";

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
                  },{
                     type : "<th>",
                     attr : {
                        text : "Supported"
                     }
                  }]
               }]
            }];
            
            init_components.sort( function( a, b ){
               return a.id - b.id;
            });
            
            for( var i=0; i<init_components.length; i++){
               var comp = init_components[ i ];
               //show only probe that is indicated in URL by probe_id
               if( URL_PARAM.probe_id != undefined && URL_PARAM.probe_id != comp.id )
                  continue;
               if( comp.metrics == undefined || comp.metrics.length == 0 )
                  continue;


               var $row = {
                     type    : "<tr>",
                     children: [{
                        type :  "<td>",
                        attr : {
                           colspan : 7,
                           style   : "font-weight: bold",
                           text    : comp.title + (comp.ip == undefined?"": " ("+ comp.ip +")")
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
                           html : me.title+ " "
                        },
                        children:[{
                           type : "<i>",
                           attr : {
                              class: "fa fa-info-circle",
                              "data-toggle":"tooltip",
                              title: me.description
                           } 
                        }]
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
                           //required: true,
                           value   : me.alert,
                           disabled: me.support === false
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
                           value   : me.violation == undefined? "" : me.violation,
                           disabled: me.support === false
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
                           disabled: me.support === false
                        },
                        children : [{
                           type : "<option>",
                           attr : {
                              value   : "HIGH",
                              text    : "HIGH",
                              selected: (me.priority == "HIGH")
                           }
                        },{
                           type : "<option>",
                           attr : {
                              value   : "MEDIUM",
                              text    : "MEDIUM",
                              selected: (me.priority == "MEDIUM")
                           }
                        },{
                           type : "<option>",
                           attr : {
                              value   : "LOW",
                              text    : "LOW",
                              selected: (me.priority == "LOW")
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
                              checked : me.enable, //(me.name == "" ? false: me.enable)//TODO to enable
                              disabled: me.support === false
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

                  row.children.push({
                     type : "<td>",
                     attr : {
                        align: "center"
                     },
                     children: [{
                        type : "<i>",
                        attr : {
                           class : "fa " + (me.support? "fa-check text-success" : "fa-times text-danger")
                        }
                     }]
                  });
                  table_rows.push( row );
               }
            }

            var form_config = {
                  type  : "<form>",
                  attr  : {
                     onsubmit : "return window._checkSubmit();"
                  },
                  children : [{
                     type: "<div>",
                     attr: {
                        style: "position: absolute; top: 35px; bottom: 55px; left: 10px; right: 10px; overflow: auto"
                     },
                     children: [{
                        type     : "<table>",
                        attr     : {
                           class : "table table-striped table-bordered table-condensed dataTable no-footer",
                           id    : "tblData"
                        },
                        children : table_rows
                     }]
                  },{
                     type: "<div>",
                     attr: {
                        style: "position: absolute; bottom: 10px; left: 10px; right: 10px"
                     },
                     children : [
                        {
                           type: "<button>",
                           attr: {
                              class   : "btn btn-danger",
                              type    : "submit",
                              text    : "Submit",
                           }
                        },{
                           type: "<button>",
                           attr: {
                              class   : "btn btn-success",
                              style   : "margin-left: 30px",
                              type    : "reset",
                              text    : "Reset"
                           }
                        },{
                           type: "<a>",
                           attr: {
                              class   : "btn btn-warning pull-right",
                              style   : "margin-left: 30px",
                              text    : "Upload new SLA",
                              href    : '/chart/sla/upload' + MMTDrop.tools.getQueryString(["app_id"], "probe_id=null")
                           }
                        },{
                           type: "<a>",
                           attr: {
                              class   : "btn btn-primary pull-right",
                              style   : "margin-left: 30px",
                              text    : "Reset to Initial Value",
                              onclick : "return window._loadSelectedMetrics()"
                           }
                        },{
                           type: "<a>",
                           attr: {
                              class   : "btn btn-success pull-right",
                              style   : "margin-left: 30px",
                              text    : "Cancel",
                              href    : '/chart/sla' + MMTDrop.tools.getQueryString(["app_id","probe_id"])
                           }
                        },{
                           type: "<a>",
                           attr: {
                              class   : "btn btn-primary pull-right",
                              style   : "margin-left: 30px",
                              text    : "Disable",
                              onclick : '$(".onoffswitch-checkbox").prop("checked", false);'
                           }
                        }
                        ]
                  }]
            };

            $("#" + arr[0].id + "-content" ).append( MMTDrop.tools.createDOM( form_config ) ) ;
            window._loadSelectedMetrics();
            $('[data-toggle="tooltip"]').tooltip();   
         }//end rederTable function


//       load the previously selected values to the form
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



//       SUBMIT FORM
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
                        alert     : $("[id='alert-" + id + "']").val(),
                        violation : $("[id='violation-" + id + "']").val(),
                        priority  : $("[id='priority-" + id + "']").val(),
                        enable    : $("[id='enable-" + id + "']").is(":checked")
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


//       LOAD METRIX FROM DATABASE
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
//       end LOADING METRIX
      },
}
