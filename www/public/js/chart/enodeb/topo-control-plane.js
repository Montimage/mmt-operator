/**
 * LTE network topology constructed by using control plane
 */
const arr = [
   {
      id: "topo",
      title: "Control Plane Topology",
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

const availableReports = {
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
   arr[1].title =  param.profile + " &#10095; ";
   if( param.app )
      arr[1].title += param.app;
   else
      arr[1].title += "eNodeB/Network Topology";
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
         fPeriod.hide();
         fAutoReload.interval = 1000;
         
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
            if( otherAttr !== null )
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
                     createInput( "Name", "name", {maxlength: 15, required: true} ),
                     createInput( "IP",   "ip",   {required: true} ),
                     createInput( "Last Change",   "timestamp",   {} ),
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
                     createInput( "Name", "name", {maxlength: 15, required: true} ),
                     createInput( "IP",   "ip",   {required: true} ),
                     createInput( "Last Change",   "timestamp",   {} ),
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
                     createInput( "IMSI",   "imsi",   {maxlength: 15, required: true} ),
                     createInput( "M_TMSI", "m_tmsi", {maxlength: 15, required: true} ),
                     createInput( "IP",     "ip",     {required: true} ),
                     createInput( "Last Change",   "timestamp",   {} ),
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
            }
            ]
         }));

         /*
          * Function create a graph using D3
          */
         function drawGraph( eID ) {
            // draw a topo graph on a DOM element given by eID

            const nodes = [];
            const nodes_obj = {};
            
            //a Node: { id: "a", type: "zz", name: "hehe"}
            function normalizeNode( o ){
               if( o == null )
                  return;
               
               //node exists
               if( nodes_obj[o.id ] != undefined ){
                  //remove __toBeCleared flag
                  delete( nodes_obj[ o.id ].__toBeCleared );
                  
                  
                  //update new data field if need
                  for( const k in o )
                     if( o[k] !== undefined && o[k] !== 0 && o[k] !== "" )
                        nodes_obj[ o.id ][k] = o[k];
                  
                  return;
               }
               
               nodes_obj[ o.id ] = o;
               
               
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

            const links = [];
            const links_obj = {};

            //list of entities' ID having no detailed informations in nodes_obj
            const inconnueEntities = [];
            //a link: {"source": id-of-source-node, "target": id-of-target-node}
            function normalizeLink( msg ){
               if( msg == undefined )
                  return;
               
               const oldInconnueEntitiesLength = inconnueEntities.length;
               if( nodes_obj[ msg.source ] == undefined )
                  inconnueEntities.push( msg.source );
               if( nodes_obj[ msg.target ] == undefined )
                  inconnueEntities.push( msg.target );
               
               //either source or target are not identified in nodes_obj
               if( inconnueEntities.length > oldInconnueEntitiesLength )
                  return;
               
               const id = msg.source + "-" + msg.target;
               //is existing a link having the same source-dest?
               if( links_obj[ id ] == undefined ){
                  var o = { 
                        source: nodes_obj[ msg.source ], //refer to its source object
                        target: nodes_obj[ msg.target ], //refer to its dest object
                        label : msg.label,
                        id    : id
                  };
                  links_obj[ id ] = o;
                  links.push( o );
               }
               else{
                  //is existing a link having the same source-dest?
                  //if yes, cummulate their labels
                  //links_obj[id].label += " " + msg.label;
                  return;
               }
            }

            // size of display content
            const width = $(eID).getWidgetContentOfParent().innerWidth() - 20,
            height = $(eID).getWidgetContentOfParent().innerHeight() - 60;

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
            
            function updateLinks(){
               // Create all the line svgs but without locations yet
               const link = svg.selectAll(".link")
                  .data( links, (d) => { return d.id;}  );
               
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
                  .style("stroke-dasharray", "3,0")
                  .style("stroke", "blue")
                  .style("fill", "none")
                  .style("stroke-linejoin", "miter")
                  .attr('id',function(d,i) {return 'edgepath'+i})
               ;

               /*
               linkEnter.append("text")
                  .attr("dx", function(d){
                     return d.source.radius + 10;
                  })
                  .attr("dy",  - 10 )
                  .attr("opacity", 0)
                  .append("textPath")
                  .text(function(d) { return d.label; })
                  .attr('xlink:href',function(d,i) {return '#edgepath'+i;})
                  .style("pointer-events", "none")
               ;*/
            }
            
            //set of nodes being fixed their positions
            svg.fixedNodes = MMTDrop.tools.localStorage.get( "fixedNodes", false ) || {};

            const refreshData = function( d ){
               return d;
            }
            
            //indicate when user is draging the mouse or not
            var is_draging = false;
            function updateNodes(){
               const node = svg.selectAll(".node")
                  .data( nodes, (d) => { return d.id;} );
               
               node.exit().remove();//remove unneeded circles
               
               const nodeEnter = node.enter().append("g")
                  //a group of elements of a node, such as, icon, title, label 
                  .attr("class", "node")
                  .on('mouseover', function( d ){
                     if( is_draging === true )
                        return;

                     // Reduce the opacity of all but the neighbouring nodes
                     svg.selectAll(".node").style("opacity", function (o) {
                        return d.index == o.index ? 1 : 0.1;
                     });

                     svg.selectAll(".link").style("opacity", function (o) {
                        if( d.index === o.source.index || d.index === o.target.index ){
                           return 1;
                        }
                        return 0.1;
                     });

                     svg.selectAll(".link").selectAll("text").style("opacity", function (o) {
                        if( d.index === o.source.index || d.index === o.target.index ){
                           return 1;
                        }
                        return 0;
                     });
                  })
                  .on('mouseout', function(){
                     // Put them back to opacity=1
                     svg.selectAll(".node").style("opacity", 1);
                     svg.selectAll(".link").style("opacity", 1);
                     svg.selectAll(".link").selectAll("text").style("opacity", 0);
                  })
               ;

               //icon of a node
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
                        return 0;
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
                     const style = "font-size: "+ (d.radius*2) +"px; cursor: default; ";
                     if( d.type === TYPE_ENODEB)
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
                        force.stop(); // stops the force auto positioning before
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

                        const r = 15;
                        p.y = Math.min( p.y, height - r);
                        p.y = Math.max( p.y, r );
                        p.x = Math.min( p.x, width - r );
                        p.x = Math.max( p.x, r );

                        p.py = Math.min( p.py, height - r );
                        p.py = Math.max( p.py, r );
                        p.px = Math.min( p.px, width - r );
                        p.px = Math.max( p.px, r );

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

               //name of a node
               nodeEnter.append("text")
                  .attr("class", "node-name")
                  .attr("dy", ".35em")
                  .append("title")
                  .attr("class", "node-title");
               
               //update node-name
               node.selectAll(".node-name")
                  .attr("dx", function( d ){
                     if( d.type == TYPE_ENODEB || d.type == TYPE_UE)
                        return d.radius;
                     else
                        return d.radius + 10;
                  })
                  .text(function(d) {
                     if( d.name !== undefined )
                        return d.name;
                     if( d.imsi !== undefined )
                        return d.imsi;
                     return d.ip; //IP
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
               ;

               //update node-title
               svg.selectAll(".node-title")
                  .text( function( d ) {
                     if( d.type == TYPE_ENODEB || d.type == TYPE_UE)
                        return "click here to view detail of this element";
                     else
                        return "";
                  })
               ;
               
            }

            
            force.__lastAlpha = 0;
            function updatePosition() {
               //console.log("update position, force.alpha = " + force.alpha() );
               
               if( force.alpha() !== 0 ){
                  const delta = Math.abs( force.__lastAlpha - force.alpha() );
                  if( delta < 0.002  )
                     return;
               
                  force.__lastAlpha = force.alpha();
               }
               
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
                     if( d.name === MICRO_FLOW || d.name === NO_IP )
                        return d.x = 10 + d.radius;

                     //use saved position rather than the one being given by d3.force
                     if( d.pos )
                        d.x = d.pos.x;

                     d.x = Math.max(d.radius, Math.min(width  - d.radius, d.x));
                     return d.x;
                  })
                  .attr("cy", function(d) {
                     // fix 2 nodes
                     if( d.name === MICRO_FLOW )
                        return d.y = 10 + d.radius;
                     if( d.name === NO_IP )
                        return d.y = 50 + d.radius;

                     //use saved position rather than the one being given by d3.force
                     if( d.pos )
                        d.y = d.pos.y;

                     d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
                     return d.y;
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

            // Now we are giving the SVGs co-ordinates - the force layout is
            // generating the co-ordinates which this code is using to update
            // the attributes of the SVG elements
            force.on("tick", updatePosition);
            force.start();

            /**
             * Clear our data structure of nodes and links
             */
            svg.clearData = function(){
               //mark all nodes as being cleared
               nodes.forEach( function( el ){
                  el.__toBeCleared = true;
               });
            };
            
            /**
             * Redraw the svg
             */
            svg.redraw = function() {
               //remove the links having source or target are marked by __toBeCleared flag
               for( var i=links.length-1; i>=0; i--){
                  var el = links[i];
                  if( el.source.__toBeCleared || el.target.__toBeCleared ){
                     //remove its from links_obj
                     delete( links_obj[ el.id ] );
                     //remove its from links array
                     links.splice( i, 1 );
                  }
               };
               
               //remove the nodes being marked by __toBeCleared flag
               for( var i=nodes.length - 1; i>=0; i--){
                  var el = nodes[i];
                  if( el.__toBeCleared ){
                     //remove its from links_obj
                     delete( nodes_obj[ el.id ] );
                     //remove its from nodes array
                     nodes.splice( i, 1 );
                  }
               };
               
               updateLinks();
               updateNodes();

               force.start();
               
               hideChartElementsDependingOnButtons();
               
               if( inconnueEntities.length > 0 ){
                  if( inconnueEntities.length == 1 )
                     console.warn("Not found element having id = " + inconnueEntities[0] );
                  else
                     console.warn("Not found elements having id in " + JSON.stringify( inconnueEntities ) );
                  
                  inconnueEntities.length = 0;
               }
               
            };

            /**
             * Add a set of nodes to chart
             * elem = {name: "a", type: "xx", label: "hihi"}
             * 
             * If there exist a node having the same name, the new node will not be added 
             */
            svg.addNodes = function( arr ){
               arr.forEach( normalizeNode );
            };

            /**
             * Add a set of links to chart
             * elem = {source: "b", target: "a", label: 1},
             */
            svg.addLinks = function( arr ){
               arr.forEach( normalizeLink );
            };

            svg.hideNodesAndLinks = function( nodeType, isHidden ){
               
               svg.selectAll(".node").attr("display", function( n ){
                  if( n.type == nodeType )
                     n.isHidden = isHidden;
                  
                  if( n.isHidden )
                     return "none";
                  else
                     return "block";
               });
               
               svg.selectAll(".link").attr("display", function( l ){
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
               
               const $modal = MMTDrop.tools.getModalWindow("enodeb-config");
               
               //hide all forms
               $modal.$content.find(".add-form-content").hide();
               //show the form of this type: either ue, enodeb, mme, or gw
               const $form = $modal.$content.find("#form-content-" + type );
               $form.show();
               
               //asign data content to each input control
               for( const i in data ){
                  let val = data[i];
                  if( i == "timestamp" )
                     val = MMTDrop.tools.formatDateTime( val );
                  
                  $form.find(".enodeb-" + i).val( val );
               }
               
               
               let title = type.toUpperCase();
               if( type == TYPE_ENODEB )
                  title = "eNodeB";
               
               $modal.$title.html("Detail of " + title );

               let func = null;
               switch( type ){
               case TYPE_UE:
                  if( data.imsi )
                     func = "showDetailUE('IMSI','"+ data.imsi +"')";
                  break;
               case TYPE_ENODEB:
                  if( data.name )
                     func = "showDetaileNodeB('"+ data.name +"')";
                  break;
               case TYPE_MME:
                  if( data.name )
                     func = "showDetaileMME('"+ data.name +"')";
                  break;
               }
               //show detail button only if there exist something to show
               if( func ){
                  //show a button to goto detail of traffic monitoring of this IP
                  const detailBtn = $modal.$content.find(".btn-detail");
                  detailBtn.show().enable();
                  detailBtn.click( func, function( ev ){
                     const f = ev.data;
                     MMTDrop.tools.gotoURL("traffic", {param:["period", "probe_id"], add: "func=" + f});     
                  });
               }
               
               //show the modal
               $modal.modal();
            };

            window.svg = svg;
            return svg;
         }// end topoChart

         //empty graph
         const svg = drawGraph( "#topo-content" );

         const reloadData = function(){
            MMTDrop.tools.ajax( "/api/lte_topology/find?raw", {}, "GET", {
               success: function( data ){
                  if( data.data == undefined )
                     return;
                  const topo = data.data[0];
                  /*
                  topo = { //other attributes...
                        "links":[{"source":1,"target":2}],
                        "nodes":{"1":{"id":1,"ip":"172.16.0.2","name":"eNB_Eurecom_LTEBox","timestamp":1539855310000,"type":"enodeb"},
                                 "2":{"id":2,"ip":"172.16.0.1","timestamp":1539855310000,"type":"mme"}
                                 }
                        };
                  */
                  const nodes = [];
                  let links   = [];
                  if( topo ){
                     for( const n in topo.nodes ){
                        const node = topo.nodes[n];
                        node.id    = n;
                        nodes.push( node );
                     }
                     if( Array.isArray( topo.links ))
                        links = topo.links;
                  }
                  
                  svg.clearData();
                  svg.addNodes( nodes );
                  svg.addLinks( links );
                  svg.redraw();
               }
            });
         }
         
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
         };
         
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
            });
         };
         
         //load traffic from server when we got server's status in status_db
         status_db.afterReload( function(){
            reloadData();
         });
         
         //disable the default onchange event of fAutoReload
         fAutoReload.onchange = console.log;
         //when the topology has been changed, we received a notification from server via socketio
         socket.on("reload-lte-topology", function( needToClean ){
            if( !fAutoReload.isOn )
               return;
            
            if( needToClean ){
               svg.clearData();
               svg.redraw();
            }
               
            reloadData();
         });
         
         //this is to udpate state of buttons
         hideChartElementsDependingOnButtons();

         
      },
}


const testData =[
   {
      "links": [
         {
            "source": 1,
            "target": 2
         },
         {
            "source": 3,
            "target": 1
         },
         {
            "source": 6,
            "target": 1
         }
         ],
         "nodes": {
            "1": {
               "id": 1,
               "ip": "172.16.0.2",
               "name": "eNB_Eurecom_LTEBox",
               "timestamp": 1546266155000,
               "type": "enodeb"
            },
            "2": {
               "id": 2,
               "ip": "172.16.0.1",
               "timestamp": 1546266155000,
               "type": "mme",
               "name": "develMME"
            },
            "3": {
               "id": 3,
               "ip": "10.0.0.9",
               "m_tmsi": 1112,
               "timestamp": 1546267610000,
               "type": "ue"
            },
            "6": {
               "id": 6,
               "ip": "10.0.0.10",
               "m_tmsi": 1111,
               "timestamp": 1546267650000,
               "type": "ue"
            }
         },
   },
   {
      "links": [
         {
            "source": 1,
            "target": 2
         },
         {
            "source": 6,
            "target": 1
         }
         ],
         "nodes": {
            "1": {
               "id": 1,
               "ip": "172.16.0.2",
               "name": "eNB_Eurecom_LTEBox",
               "timestamp": 1546266155000,
               "type": "enodeb"
            },
            "2": {
               "id": 2,
               "ip": "172.16.0.1",
               "timestamp": 1546266155000,
               "type": "mme",
               "name": "develMME"
            },
            "6": {
               "id": 6,
               "ip": "10.0.0.10",
               "imsi": "nghia",
               "m_tmsi": 1111,
               "timestamp": 1546267650000,
               "type": "ue"
            }
         },
   },
   {
      "links": [
         {
            "source": 1,
            "target": 2
         },
         {
            "source": 6,
            "target": 1
         },
         {
            "source": 3,
            "target": 1
         }
         ],
         "nodes": {
            "1": {
               "id": 1,
               "ip": "172.16.0.2",
               "name": "eNB_Eurecom_LTEBox",
               "timestamp": 1546266155000,
               "type": "enodeb"
            },
            "2": {
               "id": 2,
               "ip": "172.16.0.1",
               "timestamp": 1546266155000,
               "type": "mme",
               "name": "develMME"
            },
            "3": {
               "id": 3,
               "ip": "10.0.0.9",
               "m_tmsi": 1112,
               "timestamp": 1546267805000,
               "type": "ue"
            },
            "6": {
               "id": 6,
               "ip": "10.0.0.10",
               "m_tmsi": 1111,
               "timestamp": 1546267650000,
               "type": "ue"
            }
         }
   },{
      
   }
   ];

function start( i ){
   //do a copy of data
   const topo = JSON.parse( JSON.stringify( testData[i] ));
   const nodes = [];
   let links   = [];
   if( topo ){
      for( const n in topo.nodes ){
         const node = topo.nodes[n];
         node.id    = n;
         nodes.push( node );
      }
      if( Array.isArray( topo.links ))
         links = topo.links;
   }

   svg.clearData();
   svg.addNodes( nodes );
   svg.addLinks( links );
   svg.redraw();

}


//show hierarchy URL parameters on toolbar
//$(function(){
//breadcrumbs.setData(['eNodeB', 'Topology']);
//});
$( breadcrumbs.loadDataFromURL )