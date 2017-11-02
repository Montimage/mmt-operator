var arr = [
   {
      id: "metric",
      title: "Reaction Editor",
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
         fProbe.hide();

         const _this    = this;
         const app_id   = URL_PARAM.app_id;
         const comp_id  = URL_PARAM.comp_id != undefined ? URL_PARAM.comp_id : URL_PARAM.probe_id ;
         const react_id = URL_PARAM.react_id;

         if( comp_id == undefined ){
            MMTDrop.alert.error("<center class='text-danger'> No component having id = "+ comp_id +" </center>");
            return;
         }

         const REACTORS = MMTDrop.config.others.sla.actions;

         //RENDER TABLE
         var renderTable = function ( obj ){
            //this is used when use submit the form
            window._mmt = obj;
            //the component being edited
            var componentObj;
            var reactionObj;

            var init_components = obj.components,
            init_metrics    = obj.metrics;
            if( react_id )
               reactionObj  = obj.selectedReaction[ react_id ];
            //by default, value of one reaction:
            if( reactionObj == undefined )
               reactionObj = {conditions: {}, actions: [], priority: "MEDIUM", enable: true, note : ""};

            var table_rows = [{
               type    : "<thead>",
               children: [{
                  type     : "<tr>",
                  children : [{
                     type : "<th>",
                     attr : {
                        style : "text-align: right",
                        text  : "Metrics"
                     }
                  },{
                     type : "<th>",
                     attr : {
                        style : "text-align: center",
                        text  : "Alerts"
                     }
                  },{
                     type : "<th>",
                     attr : {
                        style : "text-align: center",
                        text  : "Violations"
                     }
                  }]
               }]
            }];
            for( var i=0; i<init_components.length; i++){
               var comp = init_components[ i ];
               //show only probe that is indicated in URL by probe_id
               if( URL_PARAM.probe_id != undefined && URL_PARAM.probe_id != comp.id )
                  continue;
               if( comp.id != comp_id )
                  continue;
               if( comp.metrics == undefined || comp.metrics.length == 0 )
                  continue;

               componentObj = comp;

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
                           id : "tr-" + me.name
                        },
                        children: []
                  };

                  //title
                  row.children.push({
                     type  : "<td>",
                     attr  : {
                        align: "right",
                        text : me.title
                     }
                  });

                  //alerts
                  var checked = false;
                  var x = reactionObj.conditions[me.name];
                  if( Array.isArray( x ))
                     checked = (x.indexOf( "violate" ) != -1);

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
                              id            : "alert-" + me.name,
                              class         : "onoffswitch-checkbox react-conditions",
                              type          : "checkbox",
                              "data-metric" : me.name,
                              "data-type"   : "alert",
                              //this checkbox is checked if it is in the list of "conditions"
                              checked       :  checked
                           }
                        },{
                           type    : "<label>",
                           attr    : {
                              class   : "onoffswitch-label",
                              for     : "alert-" + me.name,
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

                  //violate
                  var checked = false;
                  var x = reactionObj.conditions[me.name];
                  if( Array.isArray( x ))
                     checked = (x.indexOf( "violate" ) != -1);

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
                              id            : "violate-" + me.name,
                              class         : "onoffswitch-checkbox react-conditions",
                              type          : "checkbox",
                              "data-metric" : me.name,
                              "data-type"   : "violate",
                              checked       :  checked
                           }
                        },{
                           type    : "<label>",
                           attr    : {
                              class   : "onoffswitch-label",
                              for     : "violate-" + me.name,
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
               }//end of iterate metrics of one component

               //we need only one component
               break;
            }

            //prepare list of options for Actions
            var reactionsSelect = [];
            for( var name in REACTORS ){
               const react = REACTORS[name];
               const text  = name.toUpperCase() + ": " + react.description;

               reactionsSelect.push({
                  type : "<option>",
                  attr : {
                     style   : "overflow: hidden; text-overflow:ellipsis;",
                     value   : name,
                     html    : text,
                     title   : text,
                     //select this option if it is in the list of "actions"
                     selected: (reactionObj.actions.indexOf( name ) != -1 )
                  }
               })
            }

            var form_config = {
                  type     : "<form>",
                  attr     :{
                     onsubmit : "return _checkSubmit();",
                     //class : "",
                  },
                  children : [{
                     type: "<div>",
                     attr: {
                        style : "position: absolute; top: 30px; left: 0px; bottom: 420px; right: 0px; overflow: auto",
                        id    : "conditions-div"
                     },
                     children: [{
                        type     : "<table>",
                        label    : "Conditions:",
                        attr     : {
                           class : "table table-striped table-bordered table-condensed dataTable no-footer",
                           id    : "tblData"
                        },
                        children : table_rows
                     }]
                  },{
                     type : "<div>",
                     attr : {
                        style : "position: absolute; left: 0px; bottom: 0px; right: 0px;",
                     },
                     children : [{
                        type  : "<select>",
                        label : "Actions:",
                        attr  : {
                           multiple : true,
                           //don't know why this attribute is not work
                           _size   : reactionsSelect.length,
                           id      : "actionSelectBox",
                           required: true,
                        },
                        children: reactionsSelect
                     },{
                        type : "<select>",
                        label: "Priority:",
                        attr : {
                           id      : "prioritySelectBox",
                           required: true,
                        },
                        children : [{
                           type : "<option>",
                           attr : {
                              value   : "HIGH",
                              text    : "HIGH",
                              selected: (reactionObj.priority == "HIGH")
                           }
                        },{
                           type : "<option>",
                           attr : {
                              value   : "MEDIUM",
                              text    : "MEDIUM",
                              selected: (reactionObj.priority == "MEDIUM")
                           }
                        },{
                           type : "<option>",
                           attr : {
                              value   : "LOW",
                              text    : "LOW",
                              selected: (reactionObj.priority == "LOW")
                           }
                        }]
                     },{
                        type : "<textarea>",
                        label: "Note:",
                        attr : {
                           id  : "noteArea",
                           rows: 2,
                           text: reactionObj.note
                        }
                     },{
                        type: "<div>",
                        attr: {
                           style: "padding-top:20px; margin-bottom: 20px"
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
                              type : "<a>",
                              attr : {
                                 class   : "btn btn-warning pull-right",
                                 style   : "margin-left: 30px",
                                 text    : "Recommend",
                                 id      : "recommendBtn"
                              }
                           },{
                              type: "<a>",
                              attr: {
                                 class   : "btn btn-success pull-right",
                                 style   : "margin-left: 30px",
                                 text    : "Cancel",
                                 href    : '/chart/enforcement/reaction' + MMTDrop.tools.getQueryString(["app_id"], "probe_id=null") //no need "probe_id" as we want to show all of them
                              }
                           },
                           ]}]
                  }]
            };

            form_config = {
                  type : "<div>",
                  attr : {
                     style : "position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; overflow: auto"
                  },
                  children : [
                     {
                        type : "<div>",
                        attr : {
                           style: "position: absolute; top: 0px; left: 0px; right: 0px; text-align: right; font-size: 16px; font-weight: bold; border-bottom: thin solid #ccc",
                           text : componentObj.title  + " (" + componentObj.ip + ")"
                        }
                     },
                     form_config
                     ]
            }

            $("#" + arr[0].id + "-content" ).append( MMTDrop.tools.createForm( form_config, false ) ) ;
            $("#actionSelectBox").prop("size", $("#actionSelectBox").attr("_size") );

            /**
             * The recommendation is done based on the reactions list in config.json.
             * It will visite all reactions and check if there exists any metric that satisfies one of
             * metric in #candidate_metrics then it will recommend that reaction.
             */
            _this.recommendIndex = 0;
            _this.reactionsName = [];
            for( var rec in REACTORS )
               _this.reactionsName.push( rec );

            $("#recommendBtn").click( function(){
               //clear the form
               $(".react-conditions").prop("checked", false );
               $("#actionSelectBox").val("");
               $("#prioritySelectBox").val("MEDIUM");
               $("#noteArea").val("");

               var index = 0;
               //ensure that we visite maximally all element of reactionsName
               //the visite is broken when we found one recommendation
               while( index ++ < _this.reactionsName.length ){
                  const rec = _this.reactionsName[ _this.recommendIndex ];
                  const react = REACTORS[ rec ];
                  const conditionText = [];

                  for( var cond in react.candidate_metrics ){
                     const val = react.candidate_metrics[ cond ];
                     var count = 0;	//number of conditions that can be satisfied
                     var text  = [];
                     //having alert attribute
                     if( val.alert ){
                        //check whether the current form contains one of the conditions
                        count = $("#alert-" + cond).prop("checked", true ).length;
                        if( count > 0 ){
                           text.push( "alert" );
                           
                           $("#conditions-div").scrollToChild( "#alert-" + cond );
                        }
                     }
                     if( val.violate ){
                        //check whether the current form contains one of the conditions
                        count = $("#violate-" + cond).prop("checked", true ).length;
                        if( count > 0 ){
                           text.push( 'violate' );
                           
                           $("#conditions-div").scrollToChild( "#tr-" + cond );
                        }
                     }

                     if( text.length > 0 )
                        conditionText.push( cond + " (" + text.join( " or " ) + ")" );
                  }


                  //increase index for the nex recommendation
                  _this.recommendIndex ++;
                  if( _this.recommendIndex >= _this.reactionsName.length )
                     _this.recommendIndex = 0;

                  //ok, there exist => select the actions correspondent
                  if( conditionText.length > 0 ){
                     $("#actionSelectBox").val( rec );
                     $("#noteArea").val( "Recommendation: when having " + conditionText.join(" and ") + " then perform \"" + rec +"\" action" );
                     break;
                  }
               }//end of while
            });
         }//end rederTable function



         //SUBMIT FORM
         window._checkSubmit = function(){
            //get actions
            const actionList = $("#actionSelectBox").val();


            //get conditions: array of checkboxes being checked
            const conditionsList = $(".react-conditions:checked");

            if( conditionsList.length == 0 ){
               MMTDrop.alert.error("Need to select at least one condition", 5000 );
               return false;
            }

            const condObj = {};
            for( var i=0; i<conditionsList.length; i++ ){
               var chk    = conditionsList[i];
               var metric = chk.getAttribute("data-metric");
               var type   = chk.getAttribute("data-type");

               if( condObj[ metric ]  == undefined )
                  condObj[ metric ] = [];
               condObj[ metric ].push( type );
            }

            var obj =  {
                  comp_id    : comp_id,
                  conditions : condObj,
                  actions    : actionList,
                  priority   : $("#prioritySelectBox").val(),
                  note       : $("#noteArea").val(),
                  enable     : true
            };

            var dataObj = {};
            //insert new
            if( react_id == undefined )
               dataObj[  "selectedReaction." + MMTDrop.tools.guid() ] = obj;
            else //update the old
               dataObj[  "selectedReaction." + react_id ] = obj;

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
               error   : function( err ){
                  MMTDrop.alert.error( "Cannot update database: " + err )
               },
               success : function( ){
                  MMTDrop.alert.success("Successfully save to database", 1500 );
                  setTimeout( MMTDrop.tools.gotoURL, 2000,
                      //no need "probe_id" as we want to show all of them
                        "/chart/sla/reaction", {param : ["app_id"], add: "probe_id=null"} );
                        
               }
            });

            return false;
         }//END SUBMIT FORM


         //LOAD METRIX FROM DATABASE
         MMTDrop.tools.ajax("/api/metrics/find?raw", [{$match: {app_id : app_id}}], "POST", {
            error  : function(){},
            success: function( data ){
               var obj = data.data[0];
               //does not exist ?
               if( obj == undefined )
                  MMTDrop.tools.gotoURL("/chart/sla/upload", {param:["app_id","period"], add: "probe_id=null"});
               else
                  renderTable( obj );
            }
         } );
         //end LOADING METRIX
      },
}



//show hierarchy URL parameters on toolbar
$( function(){
   var params = [ '<a href="../reaction' + MMTDrop.tools.getQueryString([]) + '">Reaction Manager</a>' ];
   //depending on URL parameter act_id
   if ( URL_PARAM.act_id != undefined )
      params.push( "Edit" );
   else
      params.push( "New Reaction" );
   //show bread crumbs on toolbar
   breadcrumbs.setData( params );
});
