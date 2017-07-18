var arr = [
    {
        id: "metric",
        title: "Reaction Manager",
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
      
      //get URL of reaction editor 
      var _getReactionURL = function( comp_id, act_id ){
    	  		var additionalParam = "comp_id=" + comp_id;
    	  		if( act_id != undefined )
    	  			additionalParam += "&act_id=" + act_id;
    	  		return "reaction/edit" + MMTDrop.tools.getQueryString( ["app_id","probe_id"], additionalParam );
      };

      var table_rows = [{
        type    : "<thead>",
        children: [{
          type     : "<tr>",
          children : [{
            type : "<th>",
          },{
            type : "<th>",
            attr : {
            	  style : "text-align:right",
              text  : "Conditions"
            }
          },{
            type : "<th>",
            attr : {
              text : "Reactions"
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
              text : "Action"
            }
          }]
        }]
      }];
      for( var i=0; i<init_components.length; i++){
        var comp = init_components[ i ];
        //show only probe that is indicated in URL by probe_id
        if( URL_PARAM.probe_id != undefined && URL_PARAM.probe_id != comp.id )
          continue;
        if( comp.metrics == undefined || comp.metrics.length == 0 )
          continue;

        var $row = {
          type    : "<tr>",
          attr    : {
        	  	valign  : "middle",
          },
          children: [{
            type :  "<td>",
            attr : {
              colspan : 5,
              style   : "font-weight: bold",
              text    : comp.title + " ("+ comp.url +")"
            }
          },{
        	  	type : "<td>",
        	  	attr : {
        	  		align : "center"
        	  	},
        	  	children: [{
        	  		type : "<a>",
        	  		attr : {
        	  			class : "btn btn-success",
        	  			title : "Add new reaction for this component",
        	  			html  : "<span class='glyphicon glyphicon-plus'></span>",
        	  			href  : _getReactionURL( comp.id )
        	  		}
        	  	}]
          }]
        };

        //first row for component's title
        table_rows.push( $row );


        //common metrics
        var metrics = init_metrics.slice( 0 );
        //private metrics of each component
        if( comp.metrics )
          metrics = metrics.concat( comp.metrics.slice( 0 ) );

        //keep only metrics being enabled/supported
        var avail_metrics = [];
        for( var j=0; j<metrics.length; j++ ){
            var me = metrics[ j ];
            
            //show only metrics being enabled
            if( me.enable === true )
          	  	avail_metrics.push( me );
        }
        
        metrics = avail_metrics;
        
        //each row for a metric
        for( var j=0; j<metrics.length; j++ ){
          var me = metrics[ j ];
          
          row = {
            type    : "<tr>",
            attr    : {
            		valign: "middle"
            },
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

          //condition
          row.children.push({
            type  : "<td>",
            attr  : {
            		align: "right",
            		style: "border-right: none",
            		html : '<span class="badge">Availability Alerts</span> <span class="glyphicon glyphicon-arrow-right"></span>'
            }
          });

          //reaction
          row.children.push({
            type : "<td>",
            attr : {
            		html : '<span class="badge">Stop NIC</span>'
            }
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
              type : "<a>",
              attr : {
                class : "btn btn-default",
                title : "Edit this reaction",
                html  : "<span class='glyphicon glyphicon-edit'></span>",
                href  : _getReactionURL( comp.id, 1 )
              }
            }]
          });
          table_rows.push( row );
        }
      }

      var form_config = {
        type  : "<div>",
        attr  : {
          class  : "col-md-12 col-md-offset-0",
          style  : "margin-top: 20px; padding-bottom: 20px"
        },
        children : [{
          type     : "<form>",
          attr     :{
        	  onsubmit : "return window._checkSubmit();"  
          },
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
                  class   : "btn btn-danger pull-right",
                  style   : "margin-left: 30px",
                  type    : "submit",
                  text    : "Save",
                }
              },{
                type: "<a>",
                attr: {
                  class   : "btn btn-warning pull-right",
                  style   : "margin-left: 30px",
                  text    : "Reset",
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
