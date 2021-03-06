var arr = [
    {
        id: "realtime",
        title: "Upload SLAs",
        x: 0,
        y: 0,
        width: 6,
        height: 4,
        type: "success",
        userData: {
            fn: "createUploadForm"
        },
    },{
        id: "remote",
        title: "Get SLAs from Repository", //a MUSA Dashboard 
        x: 6,
        y: 0,
        width: 6,
        height: 4,
        type: "primary",
        userData: {
            fn: "createGetForm"
        },
    }
];

var availableReports = {
}


function getAppID (){
   if (MMTDrop.tools.getURLParameters().app_id == undefined )
      return "";
   return MMTDrop.tools.getURLParameters().app_id;
}


//create reports
var ReportFactory = {
	createGetForm: function( fPeriod ){
    var form_config = {
      type : "<div>",
      attr: {
        "class" : "col-md-8 col-md-offset-3",
        "style" : "margin-top: 60px"
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
                "method"  : "POST",
                "action"  : "/",
                "onsubmit": '_downloadSLA(); return false;',
              },
              children: [
                {
                  type : "<input>",
                  label: "App ID:",
                  attr : {
                    type : "text",
                    name : "appId",
                    id   : "appId",
                    value: getAppID()
                  }
                },{
                  type: "<div>",
                  children : [
                    {
                      type: "<button>",
                      attr: {
                        class   : "btn btn-danger",
                        type    : "submit",
                        text    : "Get SLAs",
                        required: true
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
                },{
                   type : "<div>",
                   attr : {
                      style: "color: grey; margin-top: 20px; height: 80px; overflow: auto; font-size: 12px",
                      class: "form-group",
                      id   : "status"
                   }
                 }
              ]
            }
          ]
        }
      ]
    };
    var $container = $("#" + arr[1].id + "-content" );
	 $container.append( MMTDrop.tools.createForm( form_config ) ) ;
	 
	 //this function parses information getting from Dashboard to obtain SLA URL then download them 
	 window._downloadSLA = function(){
	    //clear old status messages
	    $("#status").html();
	    
	    const __status = function( msg ){
	       $("#status").html( (new Date()).toLocaleTimeString() + ": " + msg + "<br/>" + $("#status").html() );
       }
	    
	    const appId   = $("#appId").val();
	    if( appId == "" )
	       return __status("App ID must not empty");
	    
	    
	    function __proxyError(request, status, error){
          if( request.status == 403 )
             __status( "==> Do not have permission");
          else
             __status( "==> Error " + request.status + ": " + request.responseText );
       };
	    
	    //get session element from Dashboard of this application
	    __status("Getting session element of appId <u>"+ appId +"</u> from Dashboard ...");
	    MMTDrop.tools.proxy("http://framework.musa-project.eu/session/" + appId, {
	       //data
	    }, "GET", {
	       error: __proxyError,
	       success: function( session ){
	          __status("==> got app <u>"+ session.applicationName +"</u>. Parsing deployment ...");
	          var DEPLOY;
	          const SLA = {};
	          for( var i=0; i<session.columns.length; i++ ){
	             if( session.columns[i].name == "Deploy"){
	                   //TODO: uncomment 2 lines below
                      //if( session.columns[i].items.length == 0 )
                      //   return __status("==> not found any components in deployment");
                      DEPLOY = session.columns[i].items;
	             }
	             
	             //get slaUrl
	             for( var j=0; j<session.columns[i].items.length; j++ ){
	                var comp = session.columns[i].items[j];
	                //got slaUrl for this component
	                if( SLA[ comp.text ] != undefined )
	                   continue;

	                if( comp.getSlaURL != undefined && comp.getSlaURL != "" ){
	                   SLA[ comp.text ] = comp.getSlaURL;
	                   continue;
	                }
	                
	                if( comp.getSlaTemplateUrl != undefined && comp.getSlaTemplateUrl != "" ){
                      SLA[ comp.text ] = comp.getSlaTemplateUrl;
                      continue;
                   }
	             }
	          }
	          
	          //console.log( SLA );
	          
	          //parse components
	          const COMPONENTS_ARR = [];
	          const COMPONENTS_OBJ = {};
	          for( i=0; i<DEPLOY.length; i++ ){
	             var dep = DEPLOY[i];
	             var slaUrl = SLA[ dep.text ];
	             
	             if( slaUrl == undefined || slaUrl == "" ){
	                __status("==> ignore component <u>" + dep.text + "</u> as no SLA");
	                continue;
	             }

	             //information of one component
                var o = {
                      appName: session.applicationName,
                      appId  : appId,
                      id     : dep.cid,
                      title  : dep.text,
                      metrics: [],  //init metrics for this component
                      //ip     : ??? //from deployment plan?
                      
                      slaUrl : slaUrl, 

                      };
                COMPONENTS_ARR.push( o );
                COMPONENTS_OBJ[ dep.text ] = o;
             }
	          
	          __status("==> found " + COMPONENTS_ARR.length +" component(s) having SLAs" );
	          //TODO: uncomment 2 lines below
	          if( COMPONENTS_ARR.length == 0 )
	             return;
	          
   	          //download SLA from repository for each valid component
   	          var compIndex = 0;
   	          function __downloadSLA(){
   	             if( compIndex >= COMPONENTS_ARR.length ){
   	                //finish upload sla
   	                __status("Finish.")
   	                
   	                alert("Successfully get all SLA(s).");
   	                MMTDrop.tools.gotoURL( "/musa/sla/upload/"+ appId, {param: ["app_id", "probe_id"], add:"act=finish" } );
   	                return;
   	             }
   	             
      	          var comp  = COMPONENTS_ARR[ compIndex ];
      	          __status("Downloading SLAs of component <u>" + comp.title +"</u> ...");
      	          
      	          //download sla from MUSA reposistory
      	          MMTDrop.tools.proxy( comp.slaUrl, {}, "GET", {
      	             error: __proxyError,
      	             success: function( slaXml ){
      	                //console.log( slaXml );
      	                //upload slaXml to our operator backend
      	                MMTDrop.tools.ajax("/musa/sla/uploadRaw/" + appId, {
      	                   component_index: compIndex,
      	                   component_id   : comp.id,
      	                   slaXml         : slaXml,
      	                   init_components: (compIndex == 0 ? COMPONENTS_ARR : undefined)
      	                   //data
      	                },"POST", {
      	                   error: __proxyError,
      	                   success: function( o ){
      	                      __status("==> " + o.message );
      	                      //download SLA of the next component
      	                      compIndex ++;
      	                      __downloadSLA();
      	                   }
      	                });
      	             }//end success function
      	          },{
      	           //options
      	             dataType: "text",
      	          }); 
   	          }//end of function __downloadSLA
   	          
   	          __status("Parse deployedPlan to get URLs of components")
	           //get implementation plan
             MMTDrop.tools.proxy( session.getDeployedPlanUrl, {}, "GET", {
                error: __proxyError,
                success: function( deployPlan ){
                   if( deployPlan.csps == undefined )
                      return __status("==> not found csps in deployedPlan");
                   
                   var publicIp = undefined;
                   //root.csps
                   //parser deployment plan
                   for( var i=0; i<deployPlan.csps.length; i++ ){
                      var csps = deployPlan.csps[i];
                      
                      if( csps.pools == undefined )
                         return __status("==> not found pools in deployedPlan.csps");
                   
                      //root.csps.pools
                      for( var j=0; j<csps.pools.length; j++ ){
                         var pool = csps.pools[j];
                         
                         if( pool.vms == undefined )
                            return __status("==> not found vms in deployedPlan.csps.pools");
                         
                         //root.csps.pools.vms
                         for( var k=0; k<pool.vms.length; k++ ){
                            var vm = pool.vms[k];
                            if( vm.public_ip == undefined || vm.public_ip == "" || vm.components == undefined ){
                               console.warn("No detailed infor in vm", vm );
                               continue;
                            }
                            
                            //public IP of this VM
                            publicIp = vm.public_ip;
                            //root.csps.pools.vms.components
                            for( var l=0; l<vm.components.length; l++ ){
                               var com = vm.components[l];
                               
                               if( COMPONENTS_OBJ[ com.component_id ] == undefined  ){
                                  console.log( "component %s is not in the list of deployedPlan", com.component_id );
                                  
                                  continue;
                                  COMPONENTS_OBJ[ com.component_id ] = {};
                               }
                               __status("==> found public IP: " + publicIp );
                               COMPONENTS_OBJ[ com.component_id ].ip  = publicIp;
                               
                               var protos = MMTDrop.tools.getValue( com, ["firewall", "incoming", "proto"]);
                               if( protos == undefined )
                                  continue;
                               
                               //root.csps.pools.vms.components.firewall.incoming.proto
                               for( var m=0; m<protos.length; m++ ){
                                  var proto = protos[ m ];
                                  if( proto.type != "TCP" )
                                     continue;
                                  //root.csps.pools.vms.components.firewall.incoming.proto.port_list
                                  for( var n=0; n<proto.port_list.length; n++ ){
                                     var port = proto.port_list[n];
                                     //if we found a port other than special one (SSH, FTP) => 
                                     if( [22,23].indexOf( port ) == -1 ){
                                        COMPONENTS_OBJ[ com.component_id ].url = "http://" + publicIp + ":" + port;
                                        break;
                                     }
                                  }
                               }
                               
                            }
                         }
                      }
                   }
                   
                   console.log( COMPONENTS_OBJ );
                   
                   if( publicIp == undefined )
                      __status("==> not found any public IP");
                   
                   //start to download 
                   __downloadSLA();
                }
             }); //end getting implementation plan
	       }
	    }, {
	       //options
	       dataType: "json",
	       headers :  {
	          "Authorization": MMTDrop.tools.cookie.get("authorization"),
	       }
	    });
	 };

	},
	createUploadForm: function( fPeriod ){
    fPeriod.hide();
    fProbe.hide();
    fAutoReload.hide();

    var app_id = MMTDrop.tools.getURLParameters().app_id || "__app";
    var form_config = function( com ){ 
      return {
      type: "<div>",
      attr: {
        "class" : "col-md-8 col-md-offset-1",
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
                "action"  : "/musa/sla/upload/" + app_id,
                "onsubmit": "return window._checkSubmit()"
              },
              children: [{
                  type : "<div>",
                  attr : {
                    text : "Select SLA to upload",
                    style: "font-weight: bold; text-align: center; margin-bottom: 20px",
                  }
                },{
                label : "component " + (com + 1),
                type  : "<input>",
                attr  : {
                  id      : "filename",
                  type    : "file",
                  name    : "filename",
                  multiple: false,
                  accept  : ".xml",
                  required: true
                }
              },{
                type :  "<input>",
                attr : {
                  type: "hidden",
                  value: com,
                  name: "component_id",
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
                        onclick : 'MMTDrop.tools.gotoURL("/musa/sla/upload/'+ app_id +'", {param: ["app_id", "probe_id"], add: "act=cancel" } )'
                      }
                    },{
                      type: "<button>",
                      attr: {
                        id      : "btnFinish",
                        class   : "btn btn-primary",
                        style   : "margin-left: 30px",
                        type    : "button",
                        text    : "Finish",
                        onclick : 'MMTDrop.tools.gotoURL("/musa/sla/upload/'+ app_id +'", {param: ["app_id", "probe_id"], add:"act=finish" } )'
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
            class: "col-md-10 col-md-offset-1",
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
        } ]
    }

    var $upload_container = $("#" + arr[0].id + "-content" );
    $upload_container.append( MMTDrop.tools.createForm( form_config( 0 ) ) ) ;
    var com = 0;

    window._checkSubmit = function(){

      //hide the from, do not remove it as Google Chrome does not submit it when it was deleted
      $upload_container.children().hide();

      //append to the container, do not replace the one existing
      $upload_container.append( MMTDrop.tools.createDOM( uploading_progress_bar_config ) );

      var timer = setInterval( function(){
        MMTDrop.tools.ajax("/musa/sla/upload/" + app_id, {}, "GET", {
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
              if( progress > 30 ) progress = 30;
              $("#bar1").addClass("active progress-bar-striped").show().width( progress + "%").text( message );
            }
            else if( progress <= 60 ){
              if( progress > 30 ) progress = 30;
              $("#bar1").removeClass("active progress-bar-striped").width("30%");
              $("#bar2").addClass("active progress-bar-striped").show().width( progress + "%").text( message );
            }
            else {
              $("#bar1").removeClass("active progress-bar-striped").width("30%");
              $("#bar2").removeClass("active progress-bar-striped").width("30%");
              $("#bar3").removeClass("active progress-bar-striped").show().width( (progress>40?40:progress) + "%").text( message );

              if( progress == 100 ){
                clearInterval( timer );

                setTimeout( function(){
                  if( !obj.error ){
                    //com starts from 0, 
                    alert("Successfully uploaded SLA for component " + (com+1) );
                    com ++;
                  }
                  else 
                    alert( message );
                  $upload_container.html( MMTDrop.tools.createForm( form_config( com ) ) ) ;
                }, 1000);
              }
            }
          }
        });//end ajax
      }, 1000);

      return true;
    }

	}
}
