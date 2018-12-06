var arr = [
   {
      id: "topo",
      title: "Topology",
      x: 6,
      y: 0,
      width: 12,
      height: 7,
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
      arr[1].title += "eNodeB/Network Topology"
}

const TYPE_ENODEB   = "enodeb";
const TYPE_UE       = "ue";
const TYPE_MME      = "mme";
const TYPE_GATEWAY  = "gw";


const NO_IP = "no-ip", MICRO_FLOW = "micro-flow", REMOTE = "remote", LOCAL = "_local", NULL="null";


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
                     class       : "form-control enodeb-" + name,
                  }
            };
            if( otherAttr != null )
               obj.attr = MMTDrop.tools.mergeObjects( obj.attr, otherAttr );
            return obj;
         };
         
         // create configuration form
         const $configForm = MMTDrop.tools.getModalWindow("enodeb-config");
         $configForm.children(".modal-dialog").width("60%"); // change width of dialog
         
         $configForm.$content.html( MMTDrop.tools.createForm({
            type : "<div>",
            attr : {
               class : "col-md-10 col-md-offset-1 form-horizontal"
            },
            children:[
            //Form: eNodeB
            {
               type : "<form>",
               attr : {
                  class : "",
                  style : "margin-top: 20px",
                  id    : "add-enodeb-element-form"
               },
               children: [
               //Form: eNodeB
               {
                  type : "<div>",
                  attr : {
                     id   : "form-content-" + TYPE_ENODEB,
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "Name",     "enb_name", {maxlength: 15, required: true} ),
                     createInput( "IP",       "enb_ip", {required: true} ),
                     createInput( "MME Name", "mme_name", {maxlength: 15, required: true} ),
                     ]
               },
               //Form: MME
               {
                  type : "<div>",
                  attr : {
                     id   : "form-content-" + TYPE_MME,
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "Name",     "mme_name", {maxlength: 15, required: true} ),
                     createInput( "IP",       "mme_ip", {required: true} ),
                     ]
               },
               //Form: User Equipment
               {
                  type : "<div>",
                  attr : {
                     id  : "form-content-" + TYPE_UE,
                     class: "add-form-content"
                  },
                  children : [
                     createInput( "IMSI", "imsi", {maxlength: 15, required: true} ),
                     createInput( "IP", "ue_ip", {required: true} ),
                     createInput( "eNodeB Name", "enb_name", {maxlength: 15, required: true} ),
                     createInput( "MME Name",    "mme_name", {maxlength: 15, required: true} ),
                     ]
               },
               //Buttons
               {
                  type : "<div>",
                  children: [
                  {
                     type : "<a>",
                     attr : {
                        style: "margin-right: 50px; display: none",
                        class: "btn btn-primary pull-right btn-new btn-detail",
                        html : '<span class="fa fa-table"></span> Detail Traffic'
                     }
                  }]
               }
               ]
            }
            ]
         }, 
         true // horizontal
         ));
         
         $("#form-content-enodeb").show();

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
                     "data-type": 'ue',
                     onclick: "toggleChartElements( this)",
                     html  : '<span class="fa fa-mobile"></span>'
                  }
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle MME",
                     "data-type": 'mme',
                     onclick: "toggleChartElements( this)",
                     html  : '<span class="fa fa-server"></span>'
                  }
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle eNodeB",
                     "data-type": 'enodeb',
                     onclick: "toggleChartElements(this)",
                     //html  : '<span class="icon-antenna"></span>'
                     html  : '<span class="icon-wireless"></span>'
                  }
               },{
                  type: "<button>",
                  attr: {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle getway",
                     "data-type": TYPE_GATEWAY,
                     onclick: "toggleChartElements(this)",
                     html  : '<span class="fa fa-random"></span>'
                  },
               }]
            },{
               type : "<a>",
               attr: {
                  class: "btn btn-default",
                  title: "Update the current topology in realtime",
                  "data-type": "realtime",
                  onclick:'updateTopoOnRealTime( this );'
               },
               children: [{
                  type : "<span>",
                  class: "fa fa-line-chart"
               }]
            }
            ]
         }));

         /*
          * Function create a graph using D3
          */
         function drawGraph(eID, dataObj) {
            // draw a topo graph on a DOM element given by eID
            // console.log( data );
            const obj = dataObj;
            //example:
            /**
             * {
             * nodes: {
             *    a : { type: "xx", label: "hihi"},
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
               //node exists
               if( nodes_obj[o.name ] != undefined ){
                  //remove __toBeCleared flag
                  delete( nodes_obj[ o.name ].__toBeCleared );
                  return;
               }
               
               if( o == null )
                  return;
               
               
               nodes_obj[ o.name ] = o;
               
               
               //if( o.type == null )
               //   o.type = [TYPE_ENODEB, TYPE_GATEWAY, TYPE_UE, TYPE_MME][ Math.floor(Math.random() * 5) ];

               switch( o.type ){
                  case TYPE_ENODEB : 
                     o.radius = 24;
                     break;
                  case TYPE_GATEWAY:
                     o.radius = 8;
                     break;
                  case TYPE_UE:
                     o.radius = 10;
                     break;
                  case TYPE_MME:
                     o.radius = 14;
                     break;
                     break;
                  default:
                     o.radius = 20;
               }
               
               nodes.push( o );
            }

            //normalize the existing nodes in obj
            for( var i in obj.nodes){
               obj.nodes[ i ].name = i;
               normalizeNode( obj.nodes[ i ] );
            }

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
               else{
                  //remove __toBeCleared flag
                  delete( links_obj[ name ].__toBeCleared );
                  
                  //is existing a link having the same source-dest?
                  //if yes, cummulate their labels
                  //links_obj[name].label += " " + msg.label;
                  return;
               }
            }

            //normalize each link
            obj.links.forEach( normalizeLink )


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
            })
            .size([width, height]);


            // Creates the graph data structure out of the json data
            force.nodes(nodes)
            .links(links);

            svg.nodes = nodes;
            svg.links = links;
            
            var  node = svg.selectAll(".node");
            var link  = svg.selectAll(".link");

            function updateLinks(){
               // Create all the line svgs but without locations yet
               link = link.data( links );
               
               link.exit().remove();//remove unneeded links
               
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
                  return "blue";
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
            }
            
            //set of nodes being fixed their positions
            svg.fixedNodes = MMTDrop.tools.localStorage.get( "fixedNodes", false ) || {};

            //indicate when user is draging the mouse or not
            var is_draging = false;
            function updateNodes(){
               // Do the same with the circles for the nodes - no
               node = node.data( nodes );
               
               node.exit().remove();//remove unneeded circles
               
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
               ;

               nodeEnter.append("circle")
               .attr("r", function(d){
                  if( d.type == TYPE_ENODEB)
                     return d.radius;
                  else
                     return d.radius + 10;
               })
               .attr("stroke-width", function( d ){
                  if( d.type == TYPE_GATEWAY )
                     return 1;
                  else
                     return 0
                 })
               .attr("stroke", "black")
               .attr("fill", "white")
               ;

               nodeEnter.append("text")
               .attr("text-anchor", "middle" )
               .attr("dy", ".4em")
               .attr("dx", function( d ) {
                  if( d.type == TYPE_ENODEB )
                     return ".25em";
                  else
                     return 0;
               })
               .attr('style', function( d ) {
                  const style = "font-size: "+ (d.radius*2) +"px; cursor: default; "
                  if( d.type == TYPE_ENODEB)
                     return style + "font-family: fontmfizz"
                     else
                        return style + "font-family: fontawesome";
               })
               .attr("fill", "white")
               .text(function(d) {
                  switch( d.type ){
                     case TYPE_ENODEB   : return "\uf104"; //antenna from font-mfizz
                     case TYPE_GATEWAY  : return "\uf074"; //router from font-awesome
                     case TYPE_MME      : return "\uf233"; //server from font-awesome
                     case TYPE_UE       : return "\uf10b"; //mobile from font-awesome
                  }
                  return d.type ;
               })
               //when user double-click
               .on("dblclick", function(d){
                  if( d.fixed ){
                     d.fixed = false;
                     delete( d.pos );
                     delete svg.fixedNodes[ d.name ];
                     //save to localstorage
                     MMTDrop.tools.localStorage.set( "fixedNodes", svg.fixedNodes, false );
                  }
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
                     MMTDrop.tools.localStorage.set( "fixedNodes", svg.fixedNodes, false );

                     force.resume();
                  })
               )
               ;

               nodeEnter.append("text")
               .attr("dx", function( d ){
                  if( d.type == TYPE_ENODEB || d.type == TYPE_UE)
                     return d.radius;
                  else
                     return d.radius + 10;
               })
               .attr("dy", ".35em")
               .text(function(d) { 
                  return d.label  //IP
               })
               .attr("style", function( d ){
                  if( d.type == TYPE_ENODEB || d.type == TYPE_UE || d.type == TYPE_MME)
                     return "cursor:pointer";
                  else
                     return "cursor: default";
               })
               .on("click", function(d){
                  //MMTDrop.tools.reloadPage( "ip="+ d.name );
                  if( d.type == TYPE_ENODEB || d.type == TYPE_UE || d.type == TYPE_MME)
                     showDetailElement( d );
               })
               .append("title").text( function( d ) {
                  if( d.type == TYPE_ENODEB || d.type == TYPE_UE)
                     return "click here to view detail of this element";
                  else
                     return "";
               })
               ;
               
            }

            
            
            function updatePosition() {
               //console.log("update position, force.alpha = " + force.alpha() );
//             if (force.alpha() < 0.01)
//             return;
               const linkSVG = link; //svg.selectAll(".link");
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
               const nodeSVG = node;//svg.selectAll(".node");
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
            force.start();

            /**
             * Clear our data structure of nodes and links
             */
            svg.clearData = function(){
               //mark all elements as being cleared
               nodes.forEach( function( el ){
                  el.__toBeCleared = true;
               });
               links.forEach( function( el ){
                  el.__toBeCleared = true;
               });
            }
            
            /**
             * Redraw the svg
             */
            svg.redraw = function() {
               //remove the elements being marked by __toBeCleared flag
               links.forEach( function( el, i ){
                  if( el.__toBeCleared ){
                     //remove its from links_obj
                     delete( links_obj[ el.name ] );
                     //remove its from links array
                     links.splice( i, 1 );
                  }
               });
               //remove the elements being marked by __toBeCleared flag
               nodes.forEach( function( el, i ){
                  if( el.__toBeCleared ){
                     //remove its from links_obj
                     delete( nodes_obj[ el.name ] );
                     //remove its from links array
                     nodes.splice( i, 1 );
                  }
               });
               
               updateLinks();
               updateNodes();

               force.start();
               
               hideChartElementsDependingOnButtons();
            }

            /**
             * Add a set of nodes to chart
             * elem = {name: "a", type: "xx", label: "hihi"}
             * 
             * If there exist a node having the same name, the new node will not be added 
             */
            svg.addNodes = function( arr ){
               arr.forEach( normalizeNode );
            }

            /**
             * Add a set of links to chart
             * elem = {source: "b", target: "a", label: 1},
             */
            svg.addLinks = function( arr ){
               arr.forEach( normalizeLink );
            }

            svg.hideNodesAndLinks = function( nodeType, isHidden ){
               
               node.attr("display", function( n ){
                  if( n.type == nodeType )
                     n.isHidden = isHidden;
                  
                  if( n.isHidden )
                     return "none";
                  else
                     return "block";
               });
               
               link.attr("display", function( l ){
                  //hide a link if its source or target are hidden
                  if( l.source.isHidden || l.target.isHidden  )
                        return "none";
                  //other: show them
                  return "block";
               });
            };

            //when user click on one node => popup the modal containing detailed information
            window.showDetailElement = function( data ){
               console.log( data );
               const type = data.type;
               
               data = data.data || {};
               
               const $modal = MMTDrop.tools.getModalWindow("enodeb-config");
               
               //hide all forms
               $modal.$content.find(".add-form-content").hide();
               //show the form of this type: either ue, enodeb, mme, or gw
               $modal.$content.find("#form-content-" + type ).show();
               
               for( var i in data ){
                  var val = data[i];
                  if( typeof( val ) == "object" ){
                     if( val && val.type == "Buffer" && val.data )
                        val = val.data.join("");
                  }
                  
                  var controlType = $(".enodeb-" + i).attr('type');
                  if( controlType == "checkbox" )
                     $(".enodeb-" + i).prop("checked", val );
                  else
                     $(".enodeb-" + i).val( val );
               }
               
               
               var title = type.toUpperCase();
               if( type == TYPE_ENODEB )
                  title = "eNodeB";
               
               $modal.$title.html("Detail of " + title );

               var func = null;
               switch( type ){
               case TYPE_UE:
                  func = "showDetailUE('IMSI','"+ data.imsi +"')";
                  break;
               case TYPE_ENODEB:
                  func = "showDetaileNodeB('"+ data.enb_name +"')"
                  break;
               case TYPE_MME:
                  func = "showDetaileMME('"+ data.mme_name +"')"
                  break;
               }
               //show detail button only if there exist something to show
               if( func ){
                  //show a button to goto detail of traffic monitoring of this IP
                  var detailBtn = $modal.$content.find(".btn-detail");
                  detailBtn.show().enable();
                  detailBtn.click( func, function( ev ){
                     var f = ev.data;
                     MMTDrop.tools.gotoURL("traffic", {param:["period", "probe_id"], add: "func=" + f})         
                  });
               }
               
               //show the modal
               $modal.modal();
            };

            /*
             * find a node having given type and name
             * Return the node if exist
             *        otherwise, create a new node and return it
             */
            svg.getNodeByName = function( type, name, data ){
               data = data || {};
               
               var new_name = name + "-" + type;
               for( var i in nodes_obj ){
                  var n = nodes_obj[i];
                  if( n.type == type && n.name == new_name ){
                     MMTDrop.tools.mergeObjects( n.data, data );
                     return n;
                  }
               }
               
               return { type: type, name: new_name, label: name, data: data};
            };
            
            //add a link: gtpIpSrc --> basedIpSrc --> basedIpDst
            svg.addGtpLink = function( enb_name, gw_ip, ue_imsi, msg ){
               //enodeb
               const enodeb = svg.getNodeByName( TYPE_ENODEB, enb_name, {
                  "enb_name" : enb_name,
                  "enb_ip"   : msg[ GTP.IP_SRC.id ],
                  "mme_name" : msg[ GTP.MME_NAME.id ]
               });
               const gw     = svg.getNodeByName( TYPE_GATEWAY, gw_ip );
               //UE
               const ue_1   = svg.getNodeByName( TYPE_UE, ue_imsi, {
                  //based on column IDs of service_data table in mysql DB
                  "imsi"     : ue_imsi,
                  "ue_ip"    : msg[ COL.IP_SRC.id ],
                  "enb_name" : enb_name,
                  "mme_name" : msg[ GTP.MME_NAME.id ]
               });
               //const ue_2 = svg.getNodeByIP( TYPE_UE, gtpIpSrc );
               svg.addNodes( [ enodeb, gw, ue_1 ] );
               
               svg.addLinks( [
                  {source: ue_1.name,   target: enodeb.name, label: ""},
                  {source: enodeb.name, target: gw.name,     label: ""},
                  //{source: gw.name,     target: ue_2.name,   label: ""}, 
               ] );
            }
            
            
            //add a link: eNodeB --> MME
            svg.addSctpLink = function( enb_name, mme_name, msg ){
               //enodeb
               const enodeb = svg.getNodeByName( TYPE_ENODEB, enb_name, {
                  "enb_name" : enb_name,
                  "enb_ip"   : msg[ COL.IP_SRC.id ],
                  "mme_name" : msg[ GTP.MME_NAME.id ]
               });
               const mme    = svg.getNodeByName( TYPE_MME, mme_name, {
                  "mme_name" : mme_name,
                  "mme_ip"   : msg[ COL.IP_DST.id ],
               } );
               
               svg.addNodes( [ enodeb, mme ] );
               
               svg.addLinks( [
                  {source: enodeb.name, target: mme.name, label: ""}
               ] );
            }
            window.svg = svg;
            return svg;
         }// end topoChart

         //empty graph
         const svg = drawGraph( "#topo-content",  {
               nodes: {},
               links: []
         });

         const databaseGTP = MMTDrop.databaseFactory.createStatDB( {collection: "data_gtp", 
            action: "aggregate", query: [], raw: true });
         //this is called each time database is reloaded
         databaseGTP.updateParameter = function( param ){
            //mongoDB aggregate
            const group = { _id : {} };
            [  GTP.IP_SRC.id, GTP.IP_DST.id, GTP.IMSI.id ].forEach( function( el, index){
              group["_id"][ el ] = "$" + el;
            } );
            [ GTP.IMSI.id, GTP.ENB_NAME.id, GTP.IP_SRC.id, GTP.IP_DST.id, GTP.MME_NAME.id ].forEach( function( el, index){
              group[ el ] = {"$last" : "$"+ el};
            });
            
            [ COL.IP_SRC.id ].forEach( function( el ){
               group[ el ] = {$addToSet : "$" + el };
            });
            
           param.period = status_db.time;
           
           //update in realtime
           if( window._updateTopoTimer != null ){
              //select data only from the last 10 seconds (2 x stats_period
              param.period.begin = param.period.end - 2*MMTDrop.config.probe_stats_period*1000;
              //alway select data on the same collection with "Last 5 minutes" or "Last hour"
              param.period_groupby = "minute";
           }
           else
              //in case of non-realtime, the collection is decided by "Period" combobox
              param.period_groupby = fPeriod.selectedOption().id;
     
           param.query = [ {$group: group}];
         }
         
         //callback is triggered each time database reloaded its data from server
         databaseGTP.afterReload( function( data ){
            data.forEach( function( msg ){
               svg.addGtpLink( msg[ GTP.ENB_NAME.id ], msg[ GTP.IP_DST.id ], msg[ GTP.IMSI.id ], msg );
            });
            
            //now we can redraw the svg
            svg.redraw();
         });
         
         const databaseSCTP = MMTDrop.databaseFactory.createStatDB( {collection: "data_sctp", 
            action: "aggregate", query: [], raw: true });
         //this is called each time database is reloaded
         databaseSCTP.updateParameter = function( param ){
            //mongoDB aggregate
            const group = { _id : {} };
            [  GTP.MME_NAME.id, GTP.ENB_NAME.id ].forEach( function( el, index){
              group["_id"][ el ] = "$" + el;
            } );
            [ COL.IP_SRC.id, COL.IP_DST.id, GTP.MME_NAME.id, GTP.ENB_NAME.id ].forEach( function( el, index){
              group[ el ] = {"$last" : "$"+ el};
            });
            
           param.period = status_db.time;

           //update in realtime
           if( window._updateTopoTimer != null ){
              //select data only from the last 10 seconds (2 x stats_period
              param.period.begin = param.period.end - 2*MMTDrop.config.probe_stats_period*1000;
              //alway select data on the same collection with "Last 5 minutes" or "Last hour"
              param.period_groupby = "minute";
           }
           else
              //in case of non-realtime, the collection is decided by "Period" combobox
              param.period_groupby = fPeriod.selectedOption().id;
     
           param.query = [ {$group: group}];
         }
         
         //callback is triggered each time database reloaded its data from server
         databaseSCTP.afterReload( function( data ){
            //1. clear the current data of topology
            svg.clearData();
            
            //2. load sctp to get ENB and MME nodes
            data.forEach( function( msg ){
               svg.addSctpLink( msg[ GTP.ENB_NAME.id ], msg[ GTP.MME_NAME.id ], msg );
            });
            
            //3. load network traffic to get UE, ENB, MME, and GW nodes 
            databaseGTP.reload();
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
            MMTDrop.tools.localStorage.set( "toggle-" + type, isHidden, false );
         }
         
         //hide elements corresponding to the the status of buttons that was saved 
         window.hideChartElementsDependingOnButtons = function(){
            // ==> hide its elements
            $bar.find("button[data-type]").each( function( index, el ){
               const $dom = $(el);
               const type = $dom.data("type");
               if( type == undefined )
                  return;
               var isHidden = MMTDrop.tools.localStorage.get( "toggle-" + type, false );
               if( ! isHidden )
                  return;
               $dom.attr("class", "btn btn-default");
               svg.hideNodesAndLinks( type, true );
            })
         }
         
         window.updateTopoOnRealTime = function( dom ){
            const $dom = $(dom);
            var isEnable = false
            //is showing?
            if( $dom.attr("class").indexOf( "btn-primary" ) >= 0 ){
               $dom.attr("class", "btn btn-default");
            }else{
               $dom.attr("class", "btn btn-primary");
               isEnable = true;
            }
            
            if( isEnable ){
               fPeriod.hide();
               fAutoReload.hide();
               //reload each 5 second
               window._updateTopoTimer = setInterval( function(){
                  status_db.reload();
               }, 5000 );
            }else{
               if( window._updateTopoTimer ){
                  clearInterval( window._updateTopoTimer );
                  window._updateTopoTimer  = null;
               }
               //reload the current page
               MMTDrop.tools.reloadPage();
            }
         }
         
         //load traffic from server when we got server's status in status_db
         status_db.afterReload( function(){
            //load topo from sctp traffic
            databaseSCTP.reload();
         });
         
         
         //this is to udpate state of buttons
         hideChartElementsDependingOnButtons();
      },
}


//show hierarchy URL parameters on toolbar
//$(function(){
//breadcrumbs.setData(['eNodeB', 'Topology']);
//});
$( breadcrumbs.loadDataFromURL )