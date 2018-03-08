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
      "createTopUserReport"     : "Top Users",
      "createTopLocationReport" : "Top Geo Locations"
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

         // draw topo chart
         var topoChart = new MMTDrop.Chart({
            getData: {
               getDataFn: function (db) {
                  const data = db.data();
                  const nodes_obj = {};
                  var col = fMetric.selectedOption();
                  
                  if( data.length > 100)
                     data.length = 100;

                  for( var i=0; i<data.length; i++ ){
                     var msg = data[i];
                     var name = msg[ COL.IP_SRC.id ];

                     if( name == "null" ) 
                        name = NO_IP;

                     if( nodes_obj[ name ] == undefined )
                        nodes_obj[ name ] = { label: name, type: 0 };
                     
                     // destination
                     name = msg[ COL.IP_DEST.id ];
                     if( name == "null" ) 
                        name = NO_IP;

                     if( nodes_obj[ name ] == undefined )
                        nodes_obj[ name ] = { label: name, type: 0 };
                  }

                  // update index of source and target
                  const links_arr = [];
                  for( var i=0; i<data.length; i++ ){
                     var msg = data[i];
                     
                     // label
                     //msg.label =  MMTDrop.tools.formatDataVolume( msg[ col.id ], true ) + "  \u2192"; //"->"

                     links_arr.push({
                        source : msg[ COL.IP_SRC.id ],
                        target : msg[ COL.IP_DEST.id ],
                        val : msg[ col.id ]
                     });
                  }
                  
                  const obj = {
                        nodes: nodes_obj, // object of nodes
                        links: links_arr  // array of links
                  };
                  
                  return {
                     data: [ [obj] ], //[[]] to encapsulate obj => avoid MMTDrop flats it
                     columns: [{id: 0}]
                  };
               }
            },
            afterRender: function( _chart ){
               // style defintion of topology chart
               var str =
                  function(){
                  /*
                    <style type="text/css"> 
                    .link textPath { 
                       pointer-events: none; 
                       font: 10px sans-serif;
                       fill: #1f77b4; 
                     }

                    .node circle { stroke-width: 2px; } 
                    .node text { 
                      cursor: pointer; 
                      font: 12px sans-serif; 
                    } 
                    </style>
                   */
               }.toString().split('\n').slice(2, -2).join('\n');
               $(str).appendTo("head");

               //create an input form to add new elements
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
               }
               
               // create configuration form
               const $configForm = MMTDrop.tools.getModalWindow("enodeb-config");
               $configForm.children(".modal-dialog").width("60%"); // change
               // width of dialog
               $configForm.$title.html("Add a new Element");
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
                           children:[{
                              type: "<option>",
                              attr: {
                                 value : "enodeb",
                                 text  : "eNodeB"
                              }
                           },{
                              type: "<option>",
                              attr: {
                                 value : "ue",
                                 text  : "User Equipment"
                              }
                           }]
                        },
                        ]
                  },{
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
                     },{
                        type : "<div>",
                        attr : {
                           id  : "form-content-ue",
                           class: "add-form-content",
                           style: "display: none"
                        },
                        children : [
                           createInput( "IMSI", "imsi", {maxlength: 15, required: true} ),
                           createInput( "MME Code", "mmec", {required: true} ),
                           createInput( "MMT Group Identifier", "mmegi", {required: true} ),
                           createInput( "cIoT", "ciot"  ),
                           createInput( "MBMS", "mbms"),
                           createInput( "IP", "ip", {required: true} ),
                           createInput( "Default Bearer ID", "ueDefaultBearerID" ),
                           createInput( "Dedicated Bearer ID", "ueDedicatedBearerID" ),
                           createInput( "eNB Name", "enbName", {maxlength: 15, required: true} ),
                           createInput( "Attach", "attach", {type: "checkbox"} ),
                           createInput( "Active", "active", {type: "checkbox"} ),
                       ]
                     },{
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
               
               
             //when user submit form
               $("#add-enodeb-element-form").validate({
                 errorClass  : "text-danger",
                 errorElement: "span",
                 rules:{
                    "enodeb-mmec" : "number",
                    "enodeb-mmegi": "number",
                    "enodeb-ip"   : "ipv4",
                    "enodeb-ciot" : "number",
                    "enodeb-mbms" : "number",
                    "enodeb-ueDefaultBearerID"   : "number",
                    "enodeb-ueDedicatedBearerID" : "number"
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
                       const nodeData = { type: type };
                       switch( type ){
                          case "enodeb":
                             nodeData.name =  $match["name"] = data.name;
                             nodeData.type = "eNB";
                             break;
                          case "ue":
                             $match["imsi"] = data.imsi;
                             nodeData.name  = data.ip;
                             nodeData.type  = "UE";
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
                             
                             setTimeout( svg.addNode, 1000, nodeData );
                          }
                       })
                    }catch( ex ){
                       console.error( ex );
                    }
                    return false;
                 }
               });
               
               // add a button to filter bar
               const $bar = $("#topo-content_filters");
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
                           class : "btn btn-default",
                           type  : "button",
                           title : "Toggle UE",
                           html  : '<span class="fa fa-mobile"></span>'
                        }
                     },{
                        type : "<button>",
                        attr : {
                           class : "btn btn-primary",
                           type  : "button",
                           title : "Toggle MME",
                           html  : '<span class="fa fa-server"></span>'
                        }
                     },{
                        type : "<button>",
                        attr : {
                           class : "btn btn-primary",
                           type  : "button",
                           title : "Toggle eNodeB",
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
                        onclick:'MMTDrop.tools.getModalWindow("enodeb-config").modal();'
                     },
                     children: [{
                        type : "<span>",
                        attr : {
                           class: "fa fa-plus"
                        }
                     }]
                  }]
               }));
            }
         },
         function (elemID, option, data) {
            // draw a topo graph on a DOM element given by eID
            // console.log( data );
            const obj = data[0][0];
            //example:
            /**
             * {
             * nodes: {
             *    a : { type: "xx", label: "hihi"}, //name : data 
             *    b : { type: "zz", label: "hehe"} 
             * },
             * links: [
             *    {source: "a", target: "b", val: 1},
             *    {source: "a", target: "b", val: 4},
             *    {source: "b", target: "a", val: 1},
             * ]
             * }  
             */
            if( typeof (obj.nodes ) != "object" )
               throw "Type of nodes is note correct. It must be an object.";
            if( ! Array.isArray( obj.links ))
               throw "Type of links is not correct. It must be an array of links";
            
            function normalizeNode( o ){
               if( o.type == null )
                  o.type = ["eNB", "GW", "UE", "MME", "DB"][ Math.floor(Math.random() * 5) ];
               switch( o.type ){
                  case "eNB" : 
                     o.radius = 32;
                     break;
                  case "GW":
                     o.radius = 20;
                     break;
                  case "UE":
                     o.radius = 12;
                     break;
                  case "MME":
                     o.radius = 18;
                     break;
                  case "DB":
                     o.radius = 18;
                     break;
                  default:
                     o.radius = 20;   
               }
            }
               
               
            const nodes = [];
            for( var i in obj.nodes){
               var o = obj.nodes[ i ];
               
               normalizeNode( o );
               
               o.name = i;
               nodes.push( o );
            }
            
            //cumulate links having the same source-target to one
            const links = [];
            const links_obj = {};
            for( var i=0; i<obj.links.length; i++ ){
               var msg = obj.links[i];
               var name = msg.source + "-" + msg.target;
               if( links_obj[ name ] == undefined ){
                  var o = { 
                        source: obj.nodes[ msg.source ], //refer to its source object
                        target: obj.nodes[ msg.target ], //refer to its dest object
                        val: 0 
                  };
                  links_obj[ name ] = o;
                  links.push( o );
               }
               links_obj[name].val += msg.val;
            }


            // size of display content
            const eID = "#" + elemID;
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
               link.enter()
               .append("g")
               .attr("class", "link")
               ;
               link.append("path")
               .style("stroke-width", function (d) {
                  return 2;
                  //return d.val;
               })
               .style("stroke-dasharray", function (d) {
                  return "3,0";
               })
               .style("stroke", function( d ){
                  //connect to MME
                  if( d.source.type == "MME" || d.target.type == "MME")
                     return "red";
                  else
                     return "blue";
               })
               .style("fill", "none")
               .style("stroke-linejoin", "miter")
               .attr('id',function(d,i) {return 'edgepath'+i})
               ;

               link.append("text")
               .attr("dx", function(d){
                  return d.source.radius + 10;
               })
               .attr("dy", function(d){
                  return -(d.val + 3);
               })
               .attr("opacity", 0)
               .append("textPath")
               .text(function(d) { return d.label })
               .attr('xlink:href',function(d,i) {return '#edgepath'+i})
               .style("pointer-events", "none")
               ;
               
               link.exit().remove();
            }
            svg.fixedNodes = MMTDrop.tools.localStorage.get( "fixedNodes" ) || {};
            
            var is_draging = false;
            function updateNodes(){
               // Do the same with the circles for the nodes - no
               node = node.data( nodes );
               
               node.enter()
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

               node.append("circle")
               .attr("r", function(d){
                  return d.radius + 10;
               })
               .style("stroke-width", "0" )
               .style("fill", "white")
               ;

               node.append("text")
               .attr("dx", function( d ){
                  return d.radius;
               })
               .attr("dy", ".35em")
               .text(function(d) { 
                  return d.label  //IP
               })
               .on("click", function(d){
                  MMTDrop.tools.reloadPage( "ip="+ d.name );
               })
               .append("title").text("click here to view detail of is IP");
               ;

               node.append("text")
               .attr("text-anchor", "middle" )
               .attr("dy", ".4em")
               .attr("dx", function( d ) {
                  if( d.type == "eNB" )
                     return ".25em";
                  else
                     return 0;
               })
               .attr('style', function( d ) {
                  if( d.type == "eNB")
                     return "font: normal normal bold "+ (d.radius*2) +"px/1 FontMfizz !important";
                  else
                     return "font: normal normal normal "+ (d.radius*2) +"px/1 FontAwesome !important";
               })
               .text(function(d) {
                  switch( d.type ){
                     case "eNB": return "\uf104";  //antenna from font-mfizz
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
               
               node.exit().remove();
            }

            function updatePosition() {
//               if (force.alpha() < 0.01)
//                  return;
               const link = svg.selectAll(".link");
               link.selectAll("path")
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
               const node = svg.selectAll(".node");
               node.selectAll("circle")
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
               
               node.selectAll("text")
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
            
            svg.addNode = function( n ){
               normalizeNode( n );
               obj.nodes[ n.name ] = n;
               nodes.push( n );
               restart();
            }
            
            window.svg = svg;
            
            return svg;
         });// end topoChart

         // get data

         var database = MMTDrop.databaseFactory.createStatDB( {collection: "data_link", action: "aggregate", 
            query: [], raw: true} );
         database.updateParameter = function( param ){

            // mongoDB aggregate
            var group = { _id : {} };
            [ COL.IP_SRC.id , COL.IP_DEST.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            } );
            [ COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.PROBE_ID.id, COL.IP_SRC.id, COL.IP_DEST.id, COL.SRC_LOCATION.id, COL.DST_LOCATION.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            } );

            var $match = get_match_query();
            if( $match.collection != undefined ){
               param.collection = $match.collection;
               param.no_group = true;
            }
            else
               group._id = "$link";

            const sort = {};
            sort[ COL.DATA_VOLUME.id ] = -1;

            param.query = [{$match : $match.match}, {$group: group}, {$sort: sort}, {$limit: LIMIT}];
         }


         var fMetric  = MMTDrop.filterFactory.createMetricFilter();
         var report = new MMTDrop.Report(
            // title
            null,
            // database
            database,
            // filers
            [fMetric],
            // charts
            [{ charts: [topoChart], width: 12 } ],
            // order of data flux
            [{
               object: fMetric,
               effect: [{
                  object: topoChart
               }, ] }]
         );

         return report;
      },


}


//show hierarchy URL parameters on toolbar
//$(function(){
//breadcrumbs.setData(['eNodeB', 'Topology']);
//});
$( breadcrumbs.loadDataFromURL )