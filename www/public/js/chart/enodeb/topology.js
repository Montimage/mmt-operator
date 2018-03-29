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
      arr[1].title += "eNodeB/Network Topology"
}

//topology nodes come from either 
// - "mongodb": when user uses GUI to add a new element
// - "mysql": from Jose's DB
// - "traffic": from network traffic reported by mmt-probe
const FROM_MONGO   = "mongo";
const FROM_MYSQL   = "mysql";
const FROM_TRAFFIC = "traffic";
const FROM_SCTP = "sctp";

const NO_IP = "no-ip", MICRO_FLOW = "micro-flow", REMOTE = "remote", LOCAL = "_local", NULL="null";


//limit number of rows of a table/number of pies per chart
const LIMIT_SIZE=500;
//create reports
var ReportFactory = {
      createTopoReport: function (filter) {
         const findIpField = function( type ){
            var ipField;
            switch( type ){
               case "ue":
                  ipField = "ue_ip";
                  break;
               case "enodeb":
                  ipField = "enb_ip";
                  break;
               case "gw":
                  ipField = "ip";
                  break;
               case "mme":
                  ipField = "ip";
                  break;
            }
            return ipField;
         };
         
         
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
                        //createOption( "upf"   , "User Plane Function"),
                        //createOption( "amf"   , "Access Management Function")
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
                     createInput( "Name", "enb_name", {maxlength: 15, required: true} ),
                     createInput( "MME Code", "mmec", {required: true} ),
                     createInput( "MMT Group Identifier", "mmegi", {required: true} ),
                     createInput( "IP", "enb_ip", {required: true} ),
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
                        class: "btn btn-success pull-right btn-new",
                        value: "Save"
                     }
                  },{
                     type : "<input>",
                     attr : {
                        type : "reset",
                        style: "margin-right: 50px",
                        class: "btn btn-warning pull-right btn-new",
                        html: "Reset"
                     }
                  },{
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
                     html  : '<span class="icon-satellite"></span>'
                  }
               },{
                  type: "<button>",
                  attr: {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle getway",
                     "data-type": "gw",
                     onclick: "toggleChartElements(this)",
                     html  : '<span class="fa fa-random"></span>'
                  },
               }]
            },{
               type : "<div>",
               attr: {
                  class: "btn-group",
                  role : "group",
                  style : "margin-right:30px" 
               },
               children:[{
                  type: "<button>",
                  attr: {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle GTP traffic",
                     "data-type": FROM_TRAFFIC,
                     onclick: "toggleChartElements(this)",
                     html  : "GTP"//'<span class="icon-wireless"></span>'
                  },
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle SCTP traffic",
                     "data-type": FROM_SCTP,
                     onclick: "toggleChartElements(this)",
                     html  : "SCTP"//'<span class="fa fa-random"></span>'
                  }
               },{
                  type : "<button>",
                  attr : {
                     class : "btn btn-primary",
                     type  : "button",
                     title : "Toggle elements from mySQL server",
                     "data-type": FROM_MYSQL,
                     onclick: "toggleChartElements(this)",
                     html  : '<span class="fa fa-database"></span>'
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
                  class: "fa fa-plus"
               }]
            }]
         }));

         window.showConfigFormNew = function(){
            //being modified when user click on one element in graph to show its detail
            $configForm.$content.find("form").trigger("reset");
            $configForm.$content.find("input").enable();
            $configForm.$content.find("#enodeb-type")
               .enable()
               .parent().parent().show();
            
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
               if( nodes_obj[ o.name ] != undefined ){
                  //cummulate "from"
                  if( o.data && o.data.from ){
                     nodes_obj[ o.name ].isHiddens[ o.data.from ] = false;
                  }
                  return;
               }
               
               //init set of "from"
               if( o.data && o.data.from ){
                  const froms = {};
                  froms[ o.data.from ] = false;
                  o.isHiddens = froms;
               }
               
               nodes_obj[ o.name ] = o;
               
               
               //if( o.type == null )
               //   o.type = ["enodeb", "gw", "ue", "mme"][ Math.floor(Math.random() * 5) ];

               switch( o.type ){
                  case "enodeb" : 
                     o.radius = 24;
                     break;
                  case "gw":
                     o.radius = 8;
                     break;
                  case "ue":
                     o.radius = 10;
                     break;
                  case "mme":
                     o.radius = 14;
                     break;
                  case "db":
                     o.radius = 14;
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
                  if( d.target.data &&  d.target.data.from == FROM_SCTP )
                     return "green";
                  //from traffic
                  if( (d.source.data && d.source.data.from == FROM_TRAFFIC) || 
                        (d.target.data &&  d.target.data.from == FROM_TRAFFIC ))
                     return "blue";
                  
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
            svg.fixedNodes = MMTDrop.tools.localStorage.get( "fixedNodes", false ) || {};

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
               
               ;

               nodeEnter.append("circle")
               .attr("r", function(d){
                  if( d.type == "enodeb")
                     return d.radius;
                  else
                     return d.radius + 10;
               })
               .attr("stroke-width", function( d ){
                  if( d.type == "gw" )
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
                  if( d.type == "enodeb" )
                     return ".25em";
                  else
                     return 0;
               })
               .attr('style', function( d ) {
                  const style = "font-size: "+ (d.radius*2) +"px; cursor: default; "
                  if( d.type == "enodeb")
                     return style + "font-family: fontmfizz"
                     else
                        return style + "font-family: fontawesome";
               })
               .attr("fill", "white")
               .text(function(d) {
                  switch( d.type ){
                     case "enodeb": return "\uf104"; //antenna from font-mfizz
                     case "gw"    : return "\uf074"; //router from font-awesome
                     case "mme"   : return "\uf233"; //server from font-awesome
                     case "ue"    : return "\uf10b"; //mobile from font-awesome
                     case "db"    : return "\uf1c0"; //database from font-awesome
                  }
                  return d.type ;
               })
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
                  if( d.type == "enodeb" || d.type == "ue")
                     return d.radius;
                  else
                     return d.radius + 10;
               })
               .attr("dy", ".35em")
               .text(function(d) { 
                  return d.label  //IP
               })
               .attr("style", function( d ){
                  if( d.type == "enodeb" || d.type == "ue" || d.type == "mme")
                     return "cursor:pointer";
                  else
                     return "cursor: default";
               })
               .on("click", function(d){
                  //MMTDrop.tools.reloadPage( "ip="+ d.name );
                  if( d.type == "enodeb" || d.type == "ue" || d.type == "mme")
                     showDetailElement( d );
               })
               .append("title").text( function( d ) {
                  if( d.type == "enodeb" || d.type == "ue")
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

            svg.redraw = function() {
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
            svg.addNodes = function( arr, needToRedraw ){
               for( var i=0; i<arr.length; i++ )
                  normalizeNode( arr[i] );
               if( needToRedraw !== false )
                  svg.redraw();
            }

            /**
             * Add a set of links to chart
             * elem = {source: "b", target: "a", label: 1},
             */
            svg.addLinks = function( arr, needToRedraw ){
               for( var i=0; i<arr.length; i++ )
                  normalizeLink( arr[i] );
               if( needToRedraw !== false)
                  svg.redraw();
            }

            svg.hideNodesAndLinks = function( nodeType, isHidden ){
               
               node.attr("display", function( l ){
                  //global types
                  if( nodeType == FROM_TRAFFIC || nodeType == FROM_SCTP || nodeType == FROM_MYSQL ){
                     //must comme from the same source
                     if( l.isHiddens[ nodeType ] != undefined ) 
                        l.isHiddens[ nodeType ] = isHidden;
                     //mysql and mongodb are considered as the same source
                     if(nodeType == FROM_MYSQL && l.isHiddens[ FROM_MONGO ] != undefined )
                        l.isHiddens[ FROM_MONGO ] = isHidden;

                     //suppose this node is hidden
                     l.isHidden = true;
                     //check if all sources are hidden?
                     for( var src in l.isHiddens )
                        //no, there exist at least one source to show
                        if( ! l.isHiddens[src] ){
                           l.isHidden = false;
                           break;
                        }
                  }else
                     if( l.type == nodeType )
                        l.isHidden = isHidden;
                  
                  if( l.isHidden )
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
            }

            svg.removeNodes = function(){

            }

            svg.createNewNode = function( type, name, from, data ){
               if( data == undefined )
                  data = {};
               //node does not exist
               if( from != undefined )
                  data.from = from;
               else
                  data.from = FROM_TRAFFIC;
               
               return { type: type, name: name + "-" + type, label: name, data: data};
            }
            
            svg.getNodeByIP = function( type, ip, from, data ){
               const ipField = findIpField( type );
               
               for( var name in nodes_obj ){
                  var node = nodes_obj[name];
                  if( node.type == type && node.data && node.data[ ipField ] == ip ){
                     node.isHiddens[ from ] = false;
                     return node;
                  }
               }
               
               //remember IP
               if( data == undefined )
                  data = {};
               data[ ipField ] = ip;
               
               return svg.createNewNode( type, ip, from, data )
            };
            
            svg.getNodeByName = function( type, name, from, data ){
               const key = name + "-" + type;
               if( nodes_obj[ key ] != undefined ){
                  nodes_obj[key].isHiddens[ from ] = false;
                  return nodes_obj[key]; 
               }
               
               return svg.createNewNode( type, name, from, data )
            }
            
         
            /**
             * Add an eNodeB element to chart
             */
            svg.addElement = function( type, elem, needToUpdate ){
               switch( type ){
                  case "enodeb":
                     const enb = svg.getNodeByName( "enodeb", elem.enb_name, elem.from, elem );
                     //enb.label = elem.enb_name + ": " + elem.enb_ip;
                     enb.data = MMTDrop.tools.mergeObjects( enb.data, elem );
                           
                     const mme1 = svg.getNodeByName( "mme",  elem.mmec + "-" + elem.mmegi, elem.from );
                     svg.addNodes( [ enb, mme1 ], false);
                     svg.addLinks([
                        {source: enb.name, target: mme1.name, label: "" }
                     ], needToUpdate)
                     break;
                  case "ue":
                     //add its nodes
                     const ue = svg.getNodeByIP( "ue", elem.ue_ip, elem.from, elem ); 
                     ue.label = elem.imsi ;//+ ": " + elem.ue_ip;
                     ue.data = MMTDrop.tools.mergeObjects( ue.data, elem );
                     
                     const enodeb = svg.getNodeByName( "enodeb", elem.enb_name, elem.from  );
                     //{ type: "enodeb", name: elem.enb_name, label: elem.enb_name, data: {from: elem.from} };
                     const mme2    = svg.getNodeByName( "mme", elem.mmec + "-" + elem.mmegi, elem.from, {mmec: elem.mmec, mmegi: elem.mmegi} ); 
                     
                     svg.addNodes([ enodeb, mme2, ue ], 
                        false //do not redraw immediatelly
                     );
                     svg.addLinks([
                        //UE --> eNodeB
                        {source: ue.name, target: enodeb.name, label: ""},
                        //eNodeB --> MMC
                        {source: enodeb.name, target: mme2.name, label: "" }
                        ], needToUpdate);
                     break;
               }
            }

            svg.addElements = function( type, arr ){
               for( var i=0; i<arr.length; i++ )
                  svg.addElement( type, arr[i], (i == arr.length - 1) );
            }
            
            //when user click on one node => popup the modal containing detailed information
            window.showDetailElement = function( data ){
               console.log( data );
               const type = data.type;
               
               $("#enodeb-type")
                  .val( data.type.toLowerCase() )
                  .trigger("onchange")
                  .parent().parent().hide();
               
               data = data.data || {};
               
               const $modal = MMTDrop.tools.getModalWindow("enodeb-config");
               $modal.$content.find("form").trigger("reset");
               
               for( var i in data ){
                  $(".enodeb-" + i).val( data[i] );
               }
               
               
               var title = type.toUpperCase();
               if( type == "enodeb" )
                  title = "eNodeB";
               $modal.$title.html("Detail of " + title );
               
               //allow edit info only if they are saved in mongodb
               //buttons for updating elements if need
               $modal.$content.find(".btn").setEnable( data.from  == FROM_MONGO );
               $modal.$content.find("input").setEnable( data.from == FROM_MONGO );
               
               //show a button to goto detail of traffic monitoring of this IP
               const ipField = findIpField( type );
               const IP = data[ ipField ];
               const detailBtn = $modal.$content.find(".btn-detail");
               if( IP ){
                  detailBtn.show().enable();
                  detailBtn.click( IP, function( ev ){
                     const ip = ev.data;
                     MMTDrop.tools.gotoURL("traffic", {param:["period", "probe_id"], add: "elem="+ ip})         
                  });
               }else
                  detailBtn.hide();
               
               $modal.modal();
            };
            
            //add a link: gtpIpSrc --> basedIpSrc --> basedIpDst
            svg.addGtpLink = function( basedIpSrc, basedIpDst, gtpIpSrc, gtpIpDst, needToUpdate ){
               //enodeb
               const enodeb = svg.getNodeByIP( "enodeb", basedIpSrc, FROM_TRAFFIC );
               const gw     = svg.getNodeByIP( "gw", basedIpDst, FROM_TRAFFIC );
               //UE
               const ue_1   = svg.getNodeByIP( "ue", gtpIpSrc, FROM_TRAFFIC );
               //const ue_2 = svg.getNodeByIP( "ue", gtpIpSrc );
               svg.addNodes( [ enodeb, gw, ue_1 ], false );
               
               svg.addLinks( [
                  {source: ue_1.name,   target: enodeb.name, label: ""},
                  {source: enodeb.name, target: gw.name,     label: ""},
                  //{source: gw.name,     target: ue_2.name,   label: ""}, 
               ], needToUpdate );
               
            }
            
            
            //add a link: sctIpSrc --> sctpIpDst (eNodeB --> MME)
            svg.addSctpLink = function( ipSrc, ipDst, needToUpdate ){
               //enodeb
               const enodeb = svg.getNodeByIP( "enodeb", ipSrc, FROM_SCTP );
               const mme    = svg.getNodeByIP( "mme", ipDst, FROM_SCTP );
               svg.addNodes( [ enodeb, mme ], false );
               
               svg.addLinks( [
                  {source: enodeb.name, target: mme.name, label: ""}
               ], needToUpdate );
            }
            
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
            [  COL.IP_SRC.id, COL.IP_DST.id, GTP.IP_SRC.id ].forEach( function( el, index){
              group["_id"][ el ] = "$" + el;
            } );
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
              group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.IP_SRC.id, COL.IP_DST.id, GTP.IP_SRC.id ].forEach( function( el, index){
              group[ el ] = {"$first" : "$"+ el};
            });
            
           param.period = status_db.time;
           param.period_groupby = fPeriod.selectedOption().id;
     
           param.query = [ {$group: group}];
         }
         
         //callback is triggered each time database reloaded its data from server
         databaseGTP.afterReload( function( data ){
            for( var i=0; i<data.length; i++ ){
               const msg = data[i];
               svg.addGtpLink( msg[ COL.IP_SRC.id ], msg[ COL.IP_DST.id ], msg[ GTP.IP_SRC.id ], msg[ GTP.IP_DST.id ] );
            }
            svg.redraw();
         });
         
         const databaseSCTP = MMTDrop.databaseFactory.createStatDB( {collection: "data_sctp", 
            action: "aggregate", query: [], raw: true });
         
         //callback is triggered each time database reloaded its data from server
         databaseSCTP.afterReload( function( data ){
            for( var i=0; i<data.length; i++ ){
               const msg = data[i];
               svg.addSctpLink( msg[ COL.IP_SRC.id ], msg[ COL.IP_DST.id ] );
            }
            svg.redraw();
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

            //reload database to get elemetns from network traffic
            if( ! isHidden ){
               switch( type ){
                  case FROM_TRAFFIC:
                     databaseGTP.reload();
                     break;
                  case FROM_SCTP:
                     databaseeNodeB.reload();
                     break;
                  case FROM_MYSQL:
                     loadTopoFromDB();
                     break;
               }
            }
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
         
         function addElems( url, type, source, cb ){
            MMTDrop.tools.ajax( url, {}, "GET", {
               success: function( data ){
                  if( data.data == undefined )
                     return;
                  data = data.data;
                  for( var i in data )
                     data[i].from = source;
                  svg.addElements( type, data );
                  if( cb )
                     cb();
               }
            });
         }
         
         //database to get list of IPs of eNodeB from gtp traffic
         const databaseeNodeB = MMTDrop.databaseFactory.createStatDB( {
            collection : "data_gtp",
            action : "aggregate",
            query : [{"$group": {"_id": "$" + COL.IP_SRC.id, "ip": {"$first": "$" + COL.IP_SRC.id}}}],
            raw : true
         });
         
         //
         databaseeNodeB.updateParameter = function( param ){
            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id;
         };
         
         //load set of eNodeB IPs
         databaseeNodeB.afterReload( function( data ){
            if( data.length == 0 ){
               console.error("Not found any eNodeB IPs from traffic");
               return;
            }
            //list of IPs of eNodeB
            const ipList = [];
            for( var i=0; i<data.length; i++ )
               ipList.push( data[i].ip );

            //get only SCTP traffic having src is an eNodeB
            const match = {};
            match[ COL.IP_SRC.id ] = {"$in": ipList};

            //mongoDB aggregate
            const group = { _id : {} };
            [  COL.IP_SRC.id, COL.IP_DST.id ].forEach( function( el, index){
               group["_id"][ el ] = "$" + el;
            } );
            [ COL.DATA_VOLUME.id, COL.PACKET_COUNT.id ].forEach( function( el, index){
               group[ el ] = {"$sum" : "$" + el};
            });
            [ COL.IP_SRC.id, COL.IP_DST.id ].forEach( function( el, index){
               group[ el ] = {"$first" : "$"+ el};
            });
            const param = {};
            param.period = status_db.time;
            param.period_groupby = fPeriod.selectedOption().id; 

            param.query = [ {$match: match},{$group: group}];

            //load sctp traffic
            databaseSCTP.reload( param );
         });
         
         function loadTopoFromTraffic(){
          //load traffic from server when we got server's status in status_db
            status_db.afterReload( function(){
               //load network traffic
               if( ! MMTDrop.tools.localStorage.get( "toggle-" + FROM_TRAFFIC, false ) )
                  databaseGTP.reload();
               
               //load topo from sctp traffic
               if( ! MMTDrop.tools.localStorage.get( "toggle-" + FROM_SCTP, false ) )
                  databaseeNodeB.reload();
            });
         }
         
         function loadTopoFromDB(){
          //load elements from mongodb
            addElems( "/api/enodeb/find?raw", "enodeb", FROM_MONGO, function(){
               addElems( "/api/ue/find?raw", "ue", FROM_MONGO, function(){
                  //load elements from mysql
                  addElems( '/api/mysql/query?query="select * from enb_data"', "enodeb", FROM_MYSQL, function(){
                     addElems( '/api/mysql/query?query="select * from service_data"', "ue", FROM_MYSQL, function(){
                        loadTopoFromTraffic();
                     });
                  });
               });
            });
         }
         
         if( ! MMTDrop.tools.localStorage.get( "toggle-" + FROM_MYSQL, false ) )
            loadTopoFromDB();
         else
            loadTopoFromTraffic();
         //this is to udpate state of buttons
         hideChartElementsDependingOnButtons();
      },
}


//show hierarchy URL parameters on toolbar
//$(function(){
//breadcrumbs.setData(['eNodeB', 'Topology']);
//});
$( breadcrumbs.loadDataFromURL )