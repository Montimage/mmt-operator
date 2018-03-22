var arr = [
   {
      id: "topo",
      title: "Topology",
      x: 6,
      y: 0,
      width: 12,
      height: 9,
      type: "danger",
      userData: {
         fn: "createTopoReport"
      },
   }
   ];

var availableReports = {
};


function getHMTL( tag ){
   var html = tag[0];
   for( var i=1; i<tag.length; i++)
      html += ' <i class="fa fa-angle-right"/> ' + tag[i];
   return html;
}

const LIMIT = 1000;

//change title of each report
var param = MMTDrop.tools.getURLParameters();
//top profile => detail of 1 profile (list app) => one app
if( param.profile ){
   arr[1].title =  param.profile + " &#10095; "
   if( param.app )
      arr[1].title += param.app;
   else
      arr[1].title += "Top Apps/Protos"
}


const NO_IP = "no-ip", MICRO_FLOW = "micro-flow", REMOTE = "remote", LOCAL = "_local", NULL="null";

//MongoDB match expression
var get_match_query = function( p ){
   var param = MMTDrop.tools.getURLParameters();
   var $match = {};
   var collection = undefined;
   const REPORT_COLLECTION = "reports_all";
   // location
   if( param.loc ){
      $match[ COL.DST_LOCATION.id ] = decodeURI( param.loc );
      collection = REPORT_COLLECTION;
   }

   if( param.profile ){
      $match[ COL.PROFILE_ID.id ] = MMTDrop.constants.getCategoryIdFromName( param.profile );
      collection = REPORT_COLLECTION;
   }

   if( param.app ){
      $match[ COL.APP_ID.id ] = MMTDrop.constants.getProtocolIDFromName( param.app );
      collection = REPORT_COLLECTION;
   }

   // when a specific IP is selected
   if( param.ip ){
      collection = REPORT_COLLECTION;

      if( param.ip == NO_IP ){
         $match[ COL.IP_SRC.id ] = NULL;
      }else if( param.ip == LOCAL ) {
         $match[ COL.SRC_LOCATION.id ] = LOCAL;
      }else if( param.ip == REMOTE ) {
         $match[ COL.DST_LOCATION.id ] = {"$ne" : LOCAL};
      }else{
         var obj = {};
         obj[ COL.IP_SRC.id ]  = param.ip
         $match["$or"] = [ obj ];

         obj = {};
         obj[ COL.IP_DEST.id ] = param.ip;
         $match["$or"].push( obj );
      } 
   }else{
      $match[ COL.IP_SRC.id ] =  {$nin:[NULL, MICRO_FLOW]};
      $match[ COL.IP_DEST.id ] = {$nin:[NULL, MICRO_FLOW]};
   }

   if( param.link ){
      var link = param.link.split(",");
      $match[ COL.IP_SRC.id ]  = {$in: link};
      $match[ COL.IP_DEST.id ] = {$in: link};

      collection = REPORT_COLLECTION;
   }

   if( _.isEmpty( $match ))
      return null;


   obj = {match: $match};

   if( collection )
      obj.collection = collection;
   return obj;
}

//limit number of rows of a table/number of pies per chart
const LIMIT_SIZE=500;
//create reports
var ReportFactory = {
      createTopoReport: function (filter) {

         //support to create an input form to add new elements
         const createInput = function( label, name, otherAttr ){
            const obj = {
                  type : "<input>",
                  label: label,
                  attr : {
                     id          : "enodeb-" + name,
                     name        : "enodeb-" + name,
                     "data-name" : name,
                     class       : "form-control",
                  }
            };
            if( otherAttr != null )
               obj.attr = MMTDrop.tools.mergeObjects( obj.attr, otherAttr );
            return obj;
         };
         //support to create an option in a selectbox
         const createOption = function( value, text ){
            return {
               type: "<option>",
               attr: {
                  value : value,
                  text  : text
               }
            }
         };
         
         
         // create configuration form
         const $configForm = MMTDrop.tools.getModalWindow("enodeb-config");
         $configForm.children(".modal-dialog").width("60%"); // change width of dialog
         
         $configForm.$content.html( MMTDrop.tools.createForm({
            type : "<div>",
            attr : {
               class : "col-md-10 col-md-offset-1 form-horizontal"
            },
            children:[{
               type : "<div>",
               children:[
                  {
                     type  : "<select>",
                     label : "Type",
                     attr : {
                        id          : "enodeb-type",
                        name        : "enodeb-type",
                        class       : "form-control",
                        onchange    : "$('.add-form-content').hide(); $('#form-content-' + this.value).show();"
                     },
                     children:[
                        createOption( "enodeb", "eNodeB" ),
                        createOption( "ue"    , "User Equipment"),
                        createOption( "upf"   , "User Plane Function"),
                        createOption( "amf"   , "Access Management Function")
                     ]
                  },
                  ]
            },
            //Form: eNodeB
            {
               type : "<form>",
               attr : {
                  class : "",
                  style : "margin-top: 20px",
                  id    : "add-enodeb-element-form"
               },
               children: [{
                  type : "<div>",
                  attr : {
                     id   : "form-content-enodeb",
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "Name", "name", {maxlength: 15, required: true} ),
                     createInput( "MME Code", "mmec", {required: true} ),
                     createInput( "MMT Group Identifier", "mmegi", {required: true} ),
                     createInput( "IP", "ip", {required: true} ),
                     ]
               },
               //Form: User Equipment
               {
                  type : "<div>",
                  attr : {
                     id  : "form-content-ue",
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "IMSI", "imsi", {maxlength: 15, required: true} ),
                     createInput( "MME Code", "mmec", {required: true} ),
                     createInput( "MMT Group Identifier", "mmegi", {required: true} ),
                     createInput( "cIoT", "ciot"  ),
                     createInput( "MBMS", "mbms"),
                     createInput( "IP", "ue_ip", {required: true} ),
                     createInput( "Default Bearer ID", "ue_default_bearer_id" ),
                     createInput( "Dedicated Bearer ID", "ue_dedicated_bearer_id" ),
                     createInput( "eNodeB Name", "enb_name", {maxlength: 15, required: true} ),
                     createInput( "Attach", "attach_detach", {type: "checkbox"} ),
                     createInput( "Active", "active_idle", {type: "checkbox"} ),
                     ]
               },
               //Form: User Plane Function
               {
                  type : "<div>",
                  attr : {
                     id   : "form-content-upf",
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "UPF s11 Address", "upf_s11_adr", {required: true} ),
                     createInput( "AMF Address", "amf_adr", {required: true} ),
                     createInput( "Tunneling Address", "tunneling_adr", {required: true} ),
                     createInput( "SGW Address", "sgw_adr", {required: true} ),
                     createInput( "UE Address", "ue_adr", {required: true} ),
                     createInput( "Number of UE", "num_ue", {required: true} ),
                     createInput( "DNS 1", "dns1", {required: true} ),
                     createInput( "DNS 2", "dns2", {required: true} ),
                     createInput( "APND Address", "anpd" ),
                     {
                        type  : "<select>",
                        label : "AMD State",
                        attr : {
                           id          : "enodeb-amd_state",
                           name        : "enodeb-amd_state",
                           class       : "form-control",
                        },
                        children:[
                           createOption( "0", "Added" ),
                           createOption( "1", "Starting" ),
                           createOption( "2", "Started" ),
                        ]
                     },
                     ]
               },
               //Form: Access Management Function
               {
                  type : "<div>",
                  attr : {
                     id   : "form-content-amf",
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "Address", "amf_s1_adr", { required: true} ),
                     createInput( "Name", "amf_name", {maxlength: 15, required: true} ),
                     createInput( "UPF S11 Address", "upf_s11_adr", {required: true} ),
                     createInput( "APN Address", "apn_adr", {required: true} ),
                     createInput( "MMEC", "mmec" ),
                     createInput( "MMEGI", "mmegi" ),
                     createInput( "MMC", "mmc" ),
                     createInput( "MNC", "mnc" ),
                     {
                        type  : "<select>",
                        label : "State",
                        attr : {
                           id          : "enodeb-upf_state",
                           name        : "enodeb-upf_state",
                           class       : "form-control",
                        },
                        children:[
                           createOption( "0", "Added" ),
                           createOption( "1", "Starting" ),
                           createOption( "2", "Started" ),
                        ]
                     },
                     ]
               },
               //Buttons
               {
                  type : "<div>",
                  children: [{
                     type : "<input>",
                     attr : {
                        type : "submit",
                        class: "btn btn-success pull-right",
                        value: "Save"
                     }
                  },{
                     type : "<input>",
                     attr : {
                        type : "reset",
                        style: "margin-right: 50px",
                        class: "btn btn-warning pull-right",
                        value: "Reset"
                     }
                  }]
               }
               ]
            }
            ]
         }, 
         true // horizontal
         ));
         
         //first, show only eNodeB form, hide the others
         $(".add-form-content").hide();
         $("#form-content-enodeb").show();

         //when user submit form
         $("#add-enodeb-element-form").validate({
            errorClass  : "text-danger",
            errorElement: "span",
            rules:{
               "enodeb-mmec" : "number",
               "enodeb-mmegi": "number",
               "enodeb-ip"   : "ipv4",
               "enodeb-ue_ip": "ipv4",
               "enodeb-ciot" : "number",
               "enodeb-mbms" : "number",
               "enodeb-ue_default_bearer_id"   : "number",
               "enodeb-ue_dedicated_bearer_id" : "number"
            },
            //when the form was valided
            submitHandler : function( form ){
               try{
                  const type = $("#enodeb-type").val();
                  const data = {};
                  $(form).find("input:visible").each( function(){
                     const name = $(this).data("name");
                     if( name == undefined )
                        return;
                     if( $(this).attr("type") == "checkbox" )
                        data[ name ] = $(this).is(":checked");
                     else
                        data[ name ] = $(this).val();
                  });

                  const $match = {};
                  switch( type ){
                     case "enodeb":
                        $match["name"] = data.name;
                        break;
                     case "ue":
                        $match["imsi"] = data.imsi;
                        break;
                  }

                  console.log( data );
                  //insert to DB
                  MMTDrop.tools.ajax("/api/"+ type +"/update", {$match: $match, $data: data, $options: { upsert: true }}, "POST", {
                     error  : function(){
                        MMTDrop.alert.error("Cannot update to Database", 10*1000);
                     },
                     success: function(){
                        MMTDrop.alert.success("Successfully update to Database", 5*1000);
                        //reset form
                        //$(form).reset();
                        //hide form
                        setTimeout( function(){
                           MMTDrop.tools.getModalWindow("enodeb-config").modal( "hide" );
                        }, 100 );


                        //add to svg chart
                        data.type = type;
                        setTimeout( svg.addElements, 1000, type, data );
                     }
                  })
               }catch( ex ){
                  console.error( ex );
               }
               return false;
            }
         });

         // add a button to filter bar
         const $bar = $("#topo-content");
         $bar.append( MMTDrop.tools.createDOM( {
            type : "<div>",
            attr : {
               class: "pull-right",
               style: "margin-right:30px"
            },
            children:[{
               type : "<div>",
               attr :{
                  class : "btn-group",
                  role  : "group",
                  style : "margin-right:30px" 
               },
               children: [{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle UE",
                     "data-type": 'UE',
                     onclick: "toggleChartElements( this)",
                     html  : '<span class="fa fa-mobile"></span>'
                  }
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle MME",
                     "data-type": 'MME',
                     onclick: "toggleChartElements( this)",
                     html  : '<span class="fa fa-server"></span>'
                  }
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle eNodeB",
                     "data-type": 'eNodeB',
                     onclick: "toggleChartElements(this)",
                     html  : '<span class="icon-wireless"></span>'
                  }
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle network traffic",
                     html  : '<span class="fa fa-random"></span>'
                  }
               }]
            },{
               type : "<a>",
               attr: {
                  class: "btn btn-success",
                  title: "Add a new element",
                  onclick:'showConfigFormNew();'
               },
               children: [{
                  type : "<span>",
                  attr : {
                     class: "fa fa-plus"
                  }
               }]
            }]
         }));

         window.showConfigFormNew = function(){
            //being modified when user click on one element in graph to show its detail
            $configForm.$content.find("form").trigger("reset");
            $configForm.$content.find(".btn").enable();
            $configForm.$title.html("Add a new Element");
            $configForm.modal();
         }
         
         function drawGraph(eID, dataObj) {
            // draw a topo graph on a DOM element given by eID
            // console.log( data );
            const obj = dataObj;
            //example:
            /**
             * {
             * nodes: {
             *    a : { type: "xx", label: "hihi"}, //name : data 
             *    b : { type: "zz", label: "hehe"} 
             * },
             * links: [
             *    {source: "a", target: "b", label: 1},
             *    {source: "a", target: "b", label: 4},
             *    {source: "b", target: "a", label: 1},
             * ]
             * }  
             */
            if( typeof (obj.nodes ) != "object" )
               throw "Type of nodes is note correct. It must be an object.";
            if( ! Array.isArray( obj.links ))
               throw "Type of links is not correct. It must be an array of links";

            const nodes = [];
            const nodes_obj = {};
            function normalizeNode( o ){
               //is existing a node having the same name?
               if( nodes_obj[ o.name ] != undefined )
                  return;
               
               nodes_obj[ o.name ] = o;
               
               
               if( o.type == null )
                  o.type = ["eNodeB", "GW", "UE", "MME", "DB"][ Math.floor(Math.random() * 5) ];

               switch( o.type ){
                  case "eNodeB" : 
                     o.radius = 24;
                     break;
                  case "GW":
                     o.radius = 12;
                     break;
                  case "UE":
                     o.radius = 10;
                     break;
                  case "MME":
                     o.radius = 14;
                     break;
                  case "DB":
                     o.radius = 14;
                     break;
                  default:
                     o.radius = 20;
               }
               
               nodes.push( o );
            }

            for( var i in obj.nodes){
               obj.nodes[ i ].name = i;
               normalizeNode( obj.nodes[ i ] );
            }

            //cumulate links having the same source-target to one
            const links = [];
            const links_obj = {};

            function normalizeLink( msg ){
               var name = msg.source + "-" + msg.target;
               //is existing a link having the same source-dest?
               if( links_obj[ name ] == undefined ){
                  var o = { 
                        source: nodes_obj[ msg.source ], //refer to its source object
                        target: nodes_obj[ msg.target ], //refer to its dest object
                        label : msg.label
                  };
                  links_obj[ name ] = o;
                  links.push( o );
               }
               else
                  //is existing a link having the same source-dest?
                  //if yes, cummulate their labels
                  links_obj[name].label += " " + msg.label;
            }

            for( var i=0; i<obj.links.length; i++ )
               normalizeLink( obj.links[i] );


            // size of display content
            const width = $(eID).getWidgetContentOfParent().innerWidth() - 20,
            height = $(eID).getWidgetContentOfParent().innerHeight() - 60;

            const COLOR = d3.scale.category10();

            const svg = d3.select( eID ).append("svg")
            .attr("width", width)
            .attr("height", height);


            // Set up the force layout
            const force = d3.layout.force()
            .gravity(0.1)
            // .charge(function(d, i) { return i ? 0 : 2000; })
            .charge(-1000)
            .friction(0.7)
            .linkDistance( function(d){
               return 70 + d.source.radius + d.target.radius;
            } )
            // .gravity(.7)
            .size([width, height]);


            // Creates the graph data structure out of the json data
            force.nodes(nodes)
            .links(links)
            .start();

            var  node = svg.selectAll(".node");
            var link  = svg.selectAll(".link");

            function updateLinks(){
               // Create all the line svgs but without locations yet
               link = link.data( links );
               const linkEnter = link.enter()
               .insert("g", ":first-child") //ensure that links are always inserted first => on below of nodes
               .attr("class", "link")
               ;

               linkEnter.append("path")
               .style("stroke-width", function (d) {
                  return 1;
                  //return d.val;
               })
               .style("stroke-dasharray", function (d) {
                  return "3,0";
               })
               .style("stroke", function( d ){
                  //connect to MME
//                  if( d.source.type == "MME" || d.target.type == "MME")
//                     return "red";
//                  else
                     return "grey";
               })
               .style("fill", "none")
               .style("stroke-linejoin", "miter")
               .attr('id',function(d,i) {return 'edgepath'+i})
               ;

               linkEnter.append("text")
               .attr("dx", function(d){
                  return d.source.radius + 10;
               })
               .attr("dy",  - 10 )
               .attr("opacity", 0)
               .append("textPath")
               .text(function(d) { return d.label; })
               .attr('xlink:href',function(d,i) {return '#edgepath'+i})
               .style("pointer-events", "none")
               ;

               //for the links that will be removed
               link.exit().remove();
            }
            svg.fixedNodes = MMTDrop.tools.localStorage.get( "fixedNodes" ) || {};

            var is_draging = false;
            function updateNodes(){
               // Do the same with the circles for the nodes - no
               node = node.data( nodes );

               const nodeEnter = node.enter()
               .append("g")
               .attr("class", "node")
               .attr("name", function( d ){
                  d.pos   = svg.fixedNodes[ d.name ];
                  d.fixed = ( d.pos != null );

                  return d.name;
               })
               .on('mouseover', function( d ){
                  if( is_draging === true )
                     return;

                  // Reduce the opacity of all but the neighbouring nodes
                  node.style("opacity", function (o) {
                     return d.index==o.index ? 1 : 0.1;
                  });

                  link.style("opacity", function (o) {
                     if( d.index==o.source.index || d.index==o.target.index ){
                        return 1;
                     }
                     return 0.1;
                  });

                  link.selectAll("text").style("opacity", function (o) {
                     if( d.index==o.source.index || d.index==o.target.index ){
                        return 1;
                     }
                     return 0;
                  });
               })
               .on('mouseout', function(){
                  // Put them back to opacity=1
                  node.style("opacity", 1);
                  link.style("opacity", 1);
                  link.selectAll("text").style("opacity", 0);
               })
               .call(
                  d3.behavior.drag()
                  .on("dragstart", function(d, i) {
                     //if d.pos => delete it to be able to move
                     delete( d.pos );

                     d.draging  = true;
                     is_draging = true;
                     d.fixed    = true; // of course set the node to fixed so
                     // the force doesn't include the node
                     // in its auto positioning stuff
                     force.stop() // stops the force auto positioning before
                     // you start dragging
                  })
                  .on("drag", function(p, i) {
                     // ensure that the nodes do not go outside
                     var x = d3.event.dx,
                     y = d3.event.dy;

                     p.px += x;
                     p.py += y;
                     p.x  += x;
                     p.y  += y;

                     var r = 15;
                     if( p.y > height - r )
                        p.y = height - r;
                     if( p.y < r )
                        p.y = r;
                     if( p.x > width - r )
                        p.x = width - r;
                     if( p.x < r )
                        p.x = r;

                     if( p.py > height - r )
                        p.py = height - r;
                     if( p.py < r )
                        p.py = r;
                     if( p.px > width - r )
                        p.px = width - r;
                     if( p.px < r )
                        p.px = r;

                     updatePosition();
                  })
                  .on("dragend", function(d, i) {
                     d.draging  = false;
                     is_draging = false;

                     d.fixed = true;
                     d.pos   = {x: d.x, y: d.y};
                     //save postion of d
                     svg.fixedNodes[ d.name ] = d.pos;
                     //save to localstorage
                     MMTDrop.tools.localStorage.set( "fixedNodes", svg.fixedNodes );

                     force.resume();
                  })
               )
               ;

               nodeEnter.append("circle")
               .attr("r", function(d){
                  if( d.type == "eNodeB")
                     return d.radius;
                  else
                     return d.radius + 10;
               })
               .attr("stroke-width", "0" )
               .attr("fill", function( d ){
//                if( d.type == "GW" )
//                return "black";
//                else
//                return "white"
                  return "white";
               })
               ;

               nodeEnter.append("text")
               .attr("text-anchor", "middle" )
               .attr("dy", ".4em")
               .attr("dx", function( d ) {
                  if( d.type == "eNodeB" )
                     return ".25em";
                  else
                     return 0;
               })
               .attr('style', function( d ) {
                  const style = "font-size: "+ (d.radius*2) +"px; cursor: default; "
                  if( d.type == "eNodeB")
                     return style + "font-family: fontmfizz"
                     else
                        return style + "font-family: fontawesome";
               })
               .attr("fill", "white")
               .text(function(d) {
                  switch( d.type ){
                     case "eNodeB": return "\uf104"; //antenna from font-mfizz
                     case "GW" : return "\uf074"; //router from font-awesome
                     case "MME": return "\uf233"; //server from font-awesome
                     case "UE" : return "\uf10b"; //mobile from font-awesome
                     case "DB" : return "\uf1c0"; //database from font-awesome
                  }
                  return d.type ;
               })
               .on("dblclick", function(d){
                  if( d.fixed ){
                     d.fixed = false;
                     delete( d.pos );
                     delete svg.fixedNodes[ d.name ];
                     //save to localstorage
                     MMTDrop.tools.localStorage.set( "fixedNodes", svg.fixedNodes );
                  }
               })
               ;

               nodeEnter.append("text")
               .attr("dx", function( d ){
                  if( d.type == "eNodeB" || d.type == "UE")
                     return d.radius;
                  else
                     return d.radius + 10;
               })
               .attr("dy", ".35em")
               .text(function(d) { 
                  return d.label  //IP
               })
               .attr("style", function( d ){
                  if( d.type == "eNodeB" || d.type == "UE")
                     return "cursor:pointer";
                  else
                     return "cursor: default";
               })
               .on("click", function(d){
                  //MMTDrop.tools.reloadPage( "ip="+ d.name );
                  showDetailElement( d );
               })
               .append("title").text( function( d ) {
                  if( d.type == "eNodeB" || d.type == "UE")
                     return "click here to view detail of this element";
                  else
                     return "";
               })
               ;
               
               node.exit().remove();
            }

            function updatePosition() {
//             if (force.alpha() < 0.01)
//             return;
               const linkSVG = svg.selectAll(".link");
               linkSVG.selectAll("path")
               .attr("d", function(d) {
                  //use saved position rather than the one being given by d3.force
                  if( d.source.pos ){
                     d.source.x = d.source.pos.x;
                     d.source.y = d.source.pos.y;
                  }
                  if( d.target.pos ){
                     d.target.x = d.target.pos.x;
                     d.target.y = d.target.pos.y;
                  }

                  const dr = 0; //bend

                  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
               })
               ;

               //node
               const nodeSVG = svg.selectAll(".node");
               nodeSVG.selectAll("circle")
               .attr("cx", function(d) { 
                  // fix 2 nodes
                  if( d.name == MICRO_FLOW || d.name == NO_IP )
                     return d.x = 10 + d.radius;

                  //use saved position rather than the one being given by d3.force
                  if( d.pos )
                     d.x = d.pos.x;

                  return d.x = Math.max(d.radius, Math.min(width  - d.radius, d.x)); 
               })
               .attr("cy", function(d) {
                  // fix 2 nodes
                  if( d.name == MICRO_FLOW )
                     return d.y = 10 + d.radius;
                  if( d.name == NO_IP )
                     return d.y = 50 + d.radius;

                  //use saved position rather than the one being given by d3.force
                  if( d.pos )
                     d.y = d.pos.y;

                  return d.y = Math.max(d.radius, Math.min(height - d.radius, d.y)); 
               })
               ;

               nodeSVG.selectAll("text")
               .attr("x", function (d) {
                  //use saved position rather than the one being given by d3.force
                  if( d.pos )
                     return d.pos.x;

                  return d.x;
               })
               .attr("y", function (d) {
                  //use saved position rather than the one being given by d3.force
                  if( d.pos )
                     return d.pos.y;
                  return d.y;
               })
               .style("fill", function (d) {
                  if( d.fixed )
                     return "red";
                  return "black";
               })
               ;               
            }

            updateLinks();
            updateNodes();
            // Now we are giving the SVGs co-ordinates - the force layout is
            // generating the co-ordinates which this code is using to update
            // the attributes of the SVG elements
            force.on("tick", updatePosition);

            function restart() {
               updateLinks();
               updateNodes();

               force.start();
            }

            /**
             * Add a set of nodes to chart
             * elem = {name: "a", type: "xx", label: "hihi"}
             * 
             * If there exist a node having the same name, the new node will not be added 
             */
            svg.addNodes = function( arr, needToRedraw ){
               for( var i=0; i<arr.length; i++ )
                  normalizeNode( arr[i] );
               if( needToRedraw !== false )
                  restart();
            }

            /**
             * Add a set of links to chart
             * elem = {source: "b", target: "a", label: 1},
             */
            svg.addLinks = function( arr, needToRedraw ){
               for( var i=0; i<arr.length; i++ )
                  normalizeLink( arr[i] );
               if( needToRedraw !== false)
                  restart();
            }

            svg.hideNodesAndLinks = function( nodeType, isHidden ){
               const val = (isHidden ? "none" : "block")
               link.attr("display", function( l ){
                  if( l.source.type == nodeType || l.target.type == nodeType )
                     return val;
                  //other
                  return $(this).attr("display");
               });
               node.attr("display", function( l ){
                  if( l.type == nodeType )
                     return val;
                  //other
                  return $(this).attr("display");
               });
            }

            svg.removeNodes = function(){

            }

            /**
             * Add an eNodeB element to chart
             */
            svg.addElement = function( type, elem, needToUpdate ){
               switch( type ){
                  case "enodeb":
                     svg.addNodes( [
                        { type: "eNodeB", name: elem.name, label: elem.name, data: elem },
                        { type: "MME", name: elem.mmec + "-" + elem.mmegi, label: elem.mmec + "-" + elem.mmegi } 
                        ], false);
                     svg.addLinks([
                        {source: elem.name, target: elem.mmec + "-" + elem.mmegi, label: "" }
                     ], needToUpdate)
                     break;
                  case "ue":
                     //add its nodes
                     svg.addNodes([
                        //eNodeB
                        { type: "eNodeB", name: elem.enb_name, label: elem.enb_name },
                        //MMEC
                        { type: "MME", name: elem.mmec + "-" + elem.mmegi, label: elem.mmec + "-" + elem.mmegi },
                        //phone
                        { type: "UE", name: elem.imsi, label: elem.imsi, data: elem }
                        ], 
                        false //do not redraw immediatelly
                     );
                     svg.addLinks([
                        //UE --> eNodeB
                        {source: elem.imsi, target: elem.enb_name, label: ""},
                        //eNodeB --> MMC
                        {source: elem.enb_name, target: elem.mmec + "-" + elem.mmegi, label: "" }
                        ], needToUpdate);
                     break;
               }
            }

            svg.addElements = function( type, arr ){
               for( var i=0; i<arr.length; i++ )
                  svg.addElement( type, arr[i], (i == arr.length - 1) );
               hideChartElementsDependingOnButtons();
            }
            
            //when user click on one node => popup the modal containing detailed information
            window.showDetailElement = function( data ){
               console.log( data );
               if( data.data == undefined )
                  return;
               $("#enodeb-type").val( data.type.toLowerCase() );
               $("#enodeb-type").trigger("onchange");
               
               data = data.data;
               for( var i in data ){
                  $("#enodeb-" + i).val( data[i] );
               }
               const $modal = MMTDrop.tools.getModalWindow("enodeb-config");
               $modal.$title.html("Detail of Element");
               $modal.$content.find(".btn").disable();
               $modal.modal();
            };
            
            
            return svg;
         }// end topoChart

         //empty graph
         const svg = drawGraph( "#topo-content",  {
               nodes: {},
                links: []
         });
         
         //load eNodeB
         MMTDrop.tools.ajax("/api/enodeb/find?raw", {}, "POST", {
            success: function( data ){
               if( data.data == undefined )
                  return;
               svg.addElements( "enodeb", data.data );
            }
          });
         //load UE
         MMTDrop.tools.ajax("/api/ue/find?raw", {}, "POST", {
            success: function( data ){
               if( data.data == undefined )
                  return;
               svg.addElements( "ue", data.data );
            }
          });
         
         //when user click on group buttons to toggle elements(UE, MME, eNodeB)
         window.toggleChartElements = function( dom ){
            const $dom = $(dom);
            const type = $dom.data("type");
            var isHidden = false
            //is showing?
            if( $dom.attr("class").indexOf( "btn-primary" ) >= 0 ){
               isHidden = true;
               $dom.attr("class", "btn btn-default");
            }else
               $dom.attr("class", "btn btn-primary");

            svg.hideNodesAndLinks( type, isHidden );
            //remember setting
            MMTDrop.tools.localStorage.set( "toggle-" + type, isHidden );
         }
         
       //hide elements corresponding to the the status of buttons that was saved 
         window.hideChartElementsDependingOnButtons = function(){
            // ==> hide its elements
            $bar.find("button[data-type]").each( function( index, el ){
               const $dom = $(el);
               const type = $dom.data("type");
               if( type == undefined )
                  return;
               var isHidden = MMTDrop.tools.localStorage.get( "toggle-" + type );
               if( ! isHidden )
                  return;
               $dom.attr("class", "btn btn-default");
               svg.hideNodesAndLinks( type, true );
            })
         }
      },
}


//show hierarchy URL parameters on toolbar
//$(function(){
//breadcrumbs.setData(['eNodeB', 'Topology']);
//});
$( breadcrumbs.loadDataFromURL )