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

      const init_components = obj.components,
            reactions       = obj.selectedReaction;
      
      //get URL of reaction editor 
      const _getReactionURL = function( comp_id, act_id ){
    	  		var additionalParam = "comp_id=" + comp_id;
    	  		if( act_id != undefined )
    	  			additionalParam += "&react_id=" + act_id;
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
                text : "Note"
              }
          },{
              type : "<th>",
              attr : {
                text : "#Triggers"
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

        var $row = {
          type    : "<tr>",
          attr    : {
        	  	valign  : "middle",
          },
          children: [{
            type :  "<td>",
            attr : {
              colspan : 6,
              style   : "font-weight: bold",
              text    : comp.title + " ("+ comp.url +")"
            }
          },{
        	  	type : "<td>",
        	  	attr : {
        	  		align: "right",
        	  		style: "font-weight: bold",
        	  		text: 0
        	  	}
          },{
        	  	type : "<td>",
        	  	attr : {
        	  		align : "center"
        	  	},
        	  	children: [{
        	  		type : "<a>",
        	  		attr : {
        	  			class : "btn btn-primary",
        	  			title : "Add new reaction for this component",
        	  			html  : "<span class='glyphicon glyphicon-plus'></span>",
        	  			href  : _getReactionURL( comp.id )
        	  		}
        	  	}]
          }]
        };

        //first row for component's title
        table_rows.push( $row );

        //each row for a metric
        for( var react_id in reactions ){
          var reaction = reactions[ react_id ];
          //show only reactions of this component
          if( reaction.comp_id != comp.id )
        	  	continue;
          
          row = {
            type    : "<tr>",
            attr    : {
            		valign: "middle"
            },
            children: []
          };

          var conditionList = [];
          for( var cond in reaction.conditions )
        	  	conditionList.push( '<span class="badge">'+ cond +' ('+ reaction.conditions[cond].join(' or ') +')</span>' )
          
          //condition
          row.children.push({
            type  : "<td>",
            attr  : {
            		colspan: 2,
            		align: "right",
            		style: "border-right: none",
            		html : conditionList.join(" and ") + ' <span class="glyphicon glyphicon-arrow-right"></span>'
            }
          });

          var actionList = [];
          reaction.actions.forEach( function( val ){
        	  	actionList.push('<span class="badge">'+ val +'</span>');
          });
          
          //reaction
          row.children.push({
            type : "<td>",
            attr : {
            		html : actionList.join(", ")
            }
          });
          //priority
          row.children.push({
            type     : "<td>",
            children : [{
              type : "<select>",
              attr : {
                id      : "priority-" + react_id,
                class   : "form-control prioritySelectbox",
                required: true,
                "data-reaction-id": react_id,
              },
              children : [{
                type : "<option>",
                attr : {
                  value   : "HIGH",
                  text    : "HIGH",
                  selected: (reaction.priority == "HIGH")
                }
              },{
                type : "<option>",
                attr : {
                  value   : "MEDIUM",
                  text    : "MEDIUM",
                  selected: (reaction.priority == "MEDIUM")
                }
              },{
                type : "<option>",
                attr : {
                  value   : "LOW",
                  text    : "LOW",
                  selected: (reaction.priority == "LOW")
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
                  id      : "enable-" + react_id,
                  class   : "onoffswitch-checkbox enableCheckbox",
                  type    : "checkbox",
                  checked : reaction.enable,
                  "data-reaction-id": react_id,
                }
              },{
                type    : "<label>",
                attr    : {
                  class   : "onoffswitch-label",
                  for     : "enable-" + react_id,
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
          
          //note
          row.children.push({
              type : "<td>",
              attr : {
                style  : "max-width: 400px !important; min-width: 100px !important; overflow: hidden;text-overflow: ellipsis;white-space: nowrap;",
                	title  : reaction.note,
                	text   : reaction.note
              }
            });
          
          //number of times this reaction was trigged
          row.children.push({
        	  	type: "<td>",
        	  	attr: {
        	  		align: "right",
        	  		text : 0
        	  	}
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
                href  : _getReactionURL( comp.id, react_id )
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
              id    : "tblData",
              style : "width: 100%"
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
                type: "<button>",
                attr: {
                  class   : "btn btn-warning pull-right",
                  style   : "margin-left: 30px",
                  text    : "Reset",
                  type    : "reset"
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
    }//end rederTable function


    //SUBMIT FORM
    window._checkSubmit = function(){
      var dataObj = {};
      //enable or disable reactions
      $(".enableCheckbox").each( function( i, val ){
    	  	var id = val.getAttribute('data-reaction-id');
    	  	var isChecked = $(val).prop("checked");
    	  	dataObj[ "selectedReaction." + id + ".enable" ] = isChecked;
      });
      //update priority
      $(".prioritySelectbox").each( function( i, val ){
  	  	var id  = val.getAttribute('data-reaction-id');
  	  	var v = $(val).val();
  	  	dataObj[ "selectedReaction." + id + ".priority" ] = v;
      });
      
      //save to db
      MMTDrop.tools.ajax("/api/metrics/update", {
        "$match"   : {"_id" : app_id},
        "$data"    : {
          "$set" : dataObj
        }
      },
      "POST",
      //callback
      {
        error   : function(){
        	MMTDrop.alert.error("Cannot update to Database", 5000);
        },
        success : function( ){
          MMTDrop.alert.success("Successfully update to Database", 5000);
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
