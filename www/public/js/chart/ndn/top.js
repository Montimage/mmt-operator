var arr = [
    {
        id: "top_name",
        title: "Top Names",
        x: 0,
        y: 0,
        width: 6,
        height: 9,
        type: "info",
        userData: {
            fn: "createTopNameReport"
        },
    },
    {
        id: "top_host",
        title: "Top Hosts",
        x: 6,
        y: 0,
        width: 6,
        height: 9,
        type: "success",
        userData: {
            fn: "createTopHostReport"
        },
    },
    {
        id: "top_user",
        title: "Top Machines",
        x: 0,
        y: 0,
        width: 6,
        height: 9,
        type: "warning",
        userData: {
            fn: "createTopMACReport"
        },
    },{
        id: "topo",
        title: "Topology",
        x: 6,
        y: 0,
        width: 6,
        height: 9,
        type: "danger",
        userData: {
            fn: "createTopoReport"
        },
    },
];

var availableReports = {
};

const NDN = MMTDrop.constants.NdnColumn;

if( URL_PARAM.name )
  URL_PARAM.name = decodeURIComponent( URL_PARAM.name );
if( URL_PARAM.host )
  URL_PARAM.host = decodeURIComponent( URL_PARAM.host );
if( URL_PARAM.mac )
  URL_PARAM.mac = decodeURIComponent( URL_PARAM.mac );

if( URL_PARAM.mac != undefined || URL_PARAM.name || URL_PARAM.host){
    var title = "MAC: " + URL_PARAM.mac;
    if( URL_PARAM.name != undefined )
        title = "Name: " + decodeURI( URL_PARAM.name );
    arr = [{
        id: "profile",
        title: title,
        x: 0,
        y: 0,
        width: 12,
        height: 8,
        type: "info",
        userData: {
            fn: "createDetailReport"
        },
    },{
        id: "topo",
        title: "Topology",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "danger",
        userData: {
            fn: "createTopoReport"
        },
    }];
}


function getHMTL( tag ){
    var html = tag[0];
    for( var i=1; i<tag.length; i++)
        html += ' <i class="fa fa-angle-right"/> ' + tag[i];
    return html;
}

//create reports
var ReportFactory = {
    createDetailReport: function ( filter ) {
        var self = this;

        var isMAC = URL_PARAM.mac !== undefined;

        var $group = {_id : {}};

        var $match ={};
        if( URL_PARAM.mac ){
          //either source or destination
          $match[ "$or" ] = [{},{}];
          $match["$or"][0][ NDN.MAC_SRC.id ]  = URL_PARAM.mac;
          $match["$or"][1][ NDN.MAC_DEST.id ] = URL_PARAM.mac;
        }
        if( URL_PARAM.name )
          $match[ NDN.QUERY.id ] = URL_PARAM.name;
        if( URL_PARAM.host )
          $match[ NDN.NAME.id ] = {$regex: URL_PARAM.host};

        var database = new MMTDrop.Database( {collection: "data_ndn", action: "find",
          query: [{$match: $match}], raw : true } );


        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    //sort by asceding of PACKET_ID
                    data.sort( function( a, b){
                      return a[ NDN.PACKET_ID.id ] - b[ NDN.PACKET_ID.id ];
                    })
                    for( var i=0; i<data.length; i++ ){
                      data[i][0] = (i+1);
                      data[i][3] = MMTDrop.tools.formatDateTime( data[i][3] );
                      if( data[i][ NDN.PACKET_TYPE.id ] == 5)
                        data[i][ NDN.PACKET_TYPE.id ] = "Interest";
                      else
                        data[i][ NDN.PACKET_TYPE.id ] = "Data";
                    }

                    var columns = [{id: 0, label: ""         , align: "left"},
                                   ];

                    for(var i in NDN )
                        if( NDN[i].id > 2 ){
                            if( URL_PARAM.name && NDN[i].id === NDN.QUERY.id )
                              continue;

                            columns.push( NDN[i] );
                        }
                    //data.length = 1000;
                    return {
                        data   : data,
                        columns: columns,
                    };
                }
            },
            chart: {
                "paging"     : true,
                "info"       : true,
                "deferRender": true,
                "dom"   : '<"row"  <"col-md-6"><"col-md-6" f>> <"application-table overflow-auto-xy" t><"row" <"col-md-2" l> <"col-md-4" i><"col-md-6" p>> ',
            },

            //custom legend
            afterEachRender: function (_chart) {
                var $widget = $("#" + _chart.elemID).getWidgetParent();

                var table = _chart.chart;
                if( table === undefined ) return;

                table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                    var $div = $('.application-table');
                    var h = $div.getWidgetContentOfParent().height() - 110;
                    $div.css('height', h);
                    $div.css('margin-top', 10);
                    $div.css('margin-bottom', 10);
                    $div.children().filter("table").css("border-top", "thin solid #ddd");
                });
                table.trigger("draw.dt");

                //resize when changing window size
                $widget.on("widget-resized", null, table, function (event, widget) {
                    if (event.data){
                        event.data.api().draw(false);
                    }
                });
                $widget.trigger("widget-resized", [$widget]);

            }
        });
        //
        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[],

            //charts
					[
                {
                    charts: [cTable],
                    width: 12
                },
					 ],
            //order of data flux
            [{ object: cTable }]
        );

        return report;
    },

    createTopNameReport: function (filter, isMAC, fn) {
        isMAC = (isMAC === true);
        var self = this;

        var $group ={_id : {}};

        if( isMAC ){
          //group by pair mac_src - mac_dst
          [NDN.MAC_SRC.id, NDN.MAC_DEST.id].forEach( function( el, index){
            $group["_id"][ el ] = "$" + el;
            $group[ el ]        = {"$first" : "$"+ el};
          } );
        }
        else{
          //group by NAME
          [NDN.QUERY.id].forEach( function( el, index){
            $group["_id"][ el ] = "$" + el;
            $group[ el ]        = {"$first" : "$"+ el};
          } );
        }
        [NDN.CAP_LEN, NDN.NDN_DATA,NDN.INTEREST_LIFETIME, NDN.DATA_FRESHNESS_PERIOD ].forEach( function(el, index ){
             $group[ el.id ] = { "$sum" : "$" + el.id };
         });
         [NDN.INTEREST_NONCE ].forEach( function(el, index ){
              $group[ el.id ] = { "$sum" : 1 };
          });
       [NDN.IFA ].forEach( function(el, index ){
            $group[ el.id ] = { "$last" : "$" + el.id };
        });
        var database = new MMTDrop.Database( {collection: "data_ndn", action: "aggregate",
          query: [{$group: $group}], raw : true } );


        var fMetric = MMTDrop.filterFactory.createNdnMetricFilter();
        var cPie    = MMTDrop.chartFactory.createPie({
            getData: {
                getDataFn: function (db) {
                    var col = fMetric.selectedOption();

                    var data = [];
                    //the first column is Timestamp, so I start from 1 instance of 0
                    var columns = [];

                    cPie.dataLegend = {
                        "dataTotal": 0,
                        "ndnTotal" : 0,
                        "label"    : col.label,
                        "data"     : {}
                    };

                    var db_data = db.data();

                    for( var i=0; i< db_data.length; i++){
                        var val  = db_data[i][ col.id ];
                        var val2 = db_data[i][ NDN.IFA.id ];
                        var name = db_data[i][ NDN.QUERY.id ];
                        if( isMAC )
                            name = db_data[i][ NDN.MAC_SRC.id ];
                        if( fn ){
                          name = fn( name );
                          if(name == null) continue;
                        }

                        if( cPie.dataLegend.data[name] === undefined )
                            cPie.dataLegend.data[name] = {val2: 0, val: 0};

                        cPie.dataLegend.data[name].val  += val;
                        cPie.dataLegend.data[name].val2 += val2;
                        cPie.dataLegend.ndnTotal        += val;
                        cPie.dataLegend.dataTotal       += val2;

                        //mac_dst
                        if( isMAC ){
                          name = db_data[i][ NDN.MAC_DEST.id ];
                          if( cPie.dataLegend.data[name] === undefined )
                              cPie.dataLegend.data[name] = {val2: 0, val: 0};

                          cPie.dataLegend.data[name].val  += val;
                          cPie.dataLegend.data[name].val2 += val2;
                          cPie.dataLegend.ndnTotal        += val;
                          cPie.dataLegend.dataTotal       += val2;
                        }
                    }
                    for( var name in cPie.dataLegend.data )
                        data.push({
                            "key": name,
                            "val": cPie.dataLegend.data[ name ].val,
                            "val2": cPie.dataLegend.data[ name ].val2
                        });


                    data.sort(function (a, b) {
                        return b.val - a.val;
                    });

                    var top = 7;
                    if( cPie.showAll === true ){
                      if( data.length > 49 )
                        top = 49;
                      else
                        top = data.length;
                    }

                    if( data.length > top + 1 ){
                        var val = 0, val2 = 0;

                        //update data
                        for (var i=top; i<data.length; i++ ){
                            var msg = data[i];
                            val  += msg.val;
                            //remove
                            delete( cPie.dataLegend.data[ msg.key ]);
                        }

                        //reset dataLegend
                        cPie.dataLegend.data["Other"] = {val2: 0, val: val};

                        data[top] = {
                            key: "Other",
                            val: val
                        };
                        data.length = top+1;
                    }

                    return {
                        data: data,
                        columns: [{
                            "id": "key",
                            label: ""
                        }, {
                            "id": "val",
                            label: ""
                        }],
                        ylabel: col.label
                    };
                }
            },
            chart: {
                size: {
                    height: 300
                },
                legend: {
                    hide: true,
                },
                data: {
                    onclick: function( d, i ){
                        var ip = d.id;
                        if( ip === "Other") return;

                        var _chart = cPie;
                        //TODO
                    }
                }
            },

            //custom legend
            afterEachRender: function (_chart) {
                var chart = _chart.chart;
                var legend = _chart.dataLegend;

                var $table = $("<table>", {
                    "class": "table table-bordered table-striped table-hover table-condensed tbl-legend"
                });
                var name = "Name";
                if( isMAC )
                    name = "MAC Address";
                $table.appendTo($("#" + _chart.elemID));
                if( isMAC )//add column for
                  $("<thead><tr><th></th><th width='60%'>"+ name  +"</th><th width='20%'>" + legend.label +   "</th><th width='20%'>Percent</th><th>IFA</th></tr>").appendTo($table);
                else {
                  $("<thead><tr><th></th><th width='60%'>"+ name  +"</th><th width='20%'>" + legend.label + "</th><th width='20%'>Percent</th></tr>").appendTo($table);
                }
                var i = 0;
                for (var key in legend.data) {
                    if (key == "Other")
                        continue;
                    i++;
                    var val   = legend.data[key].val;
                    var val2  = legend.data[key].val2;

                    var $tr = $("<tr>");
                    $tr.appendTo($table);

                    $("<td>", {
                            //"class": "item-" + key,
                            "data-id": key,
                            "style": "min-width: 30px; cursor: pointer",
                            "align": "right"
                        })
                        .css({
                            "background-color": chart.color(key)
                        })
                        .on('mouseover', function () {
                            chart.focus($(this).data("id"));
                        })
                        .on('mouseout', function () {
                            chart.revert();
                        })
                        .on('click', function () {
                            var id = $(this).data("id");
                            chart.toggle(id);
                            //$(this).css("background-color", chart.color(id) );
                        })
                        .appendTo($tr);

                    var $label = $("<a>", {
                        text : key,
                        title: "click to show detail of this " + (isMAC ? "machine" : "name" ),
                        href : MMTDrop.tools.getCurrentURL(["probe_id", "period"], (isMAC ? "mac=": (fn != undefined ? "host=": "name=")) + encodeURIComponent( key ) )
                    });

                    $("<td>", {align: "left"
                        }).append($label).appendTo($tr);

                    $("<td>", {
                        "text" : MMTDrop.tools.formatDataVolume( val ),
                        "align": "right"
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text":  legend.ndnTotal == 0 ? "0%" : ((val * 100 / legend.ndnTotal).toFixed(2) + "%")

                    }).appendTo($tr);

                    if( isMAC )
                      $("<td>", {
                          "text" : val2, //val2.toFixed(2),
                          "align": "right"
                      }).appendTo($tr);
                }

                //footer of table
                var $tfoot = $("<tfoot>");

                if (legend.data["Other"] != undefined) {
                    i++;
                    $tr = $("<tr>");
                    var key = "Other";
                    var val = legend.data[key].val;
                    var val2 = legend.data[key].val2;

                    $("<td>", {
                            "class": "item-" + key,
                            "data-id": key,
                            "style": "width: 30px; cursor: pointer",
                            "align": "right"
                        })
                        .css({
                            "background-color": chart.color(key)
                        })
                        .on('mouseover', function () {
                            chart.focus($(this).data("id"));
                        })
                        .on('mouseout', function () {
                            chart.revert();
                        })
                        .on('click', function () {
                            var id = $(this).data("id");
                            chart.toggle(id);
                            //$(this).css("background-color", chart.color(id) );
                        })
                        .appendTo($tr);

                    var $a = $("<a>", {
                        href: "#showAllClients",
                        title: "click to show all clients",
                        text: "Other",

                    });
                    $a.on("click", function( event ){
                        event.preventDefault();
                       _chart.showAll = true;
                       _chart.redraw();
                        return false;
                    });

                    $("<td>").append( $a ).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "html":  MMTDrop.tools.formatDataVolume( val ),
                    }).appendTo($tr);

                    $("<td>", {
                        "align": "right",
                        "text":  legend.ndnTotal == 0 ? "0%" : ((val * 100 / legend.ndnTotal).toFixed(2) + "%")

                    }).appendTo($tr);
                    if( isMAC )
                      $("<td>", {
                      }).appendTo($tr);

                    $tfoot.append($tr).appendTo($table);
                }

                var $total =
                    $("<tr>", {
                        "class": 'success'
                    }).append(
                        $("<td>", {
                            "align": "center",
                            "text": i
                        })
                    ).append(
                        $("<td>", {
                            "text": "Total"
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": MMTDrop.tools.formatDataVolume( legend.ndnTotal )
                        })
                    ).append(
                        $("<td>", {
                            "align": "right",
                            "text": "100%"
                        })
                    )


                if ( isMAC )
                  $total.append($("<td>"));

                $tfoot.append( $total ).appendTo( $table );

                $table.dataTable({
                    paging: false,
                    dom: "t",
                    order: [[3, "desc"]],
                    "scrollY": "240px",
                    "scrollCollapse": true,
                });
            },
            bgPercentage:{
                table : ".tbl-legend",
                column: 4, //index of column, start from 1
                css   : "bg-img-1-red-pixel"
            },
        });
        //

        var dataFlow = [{
                object: fMetric,
                effect: [{
                    object: cPie
                }]
        }];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
					[fMetric],

            //charts
					[
                {
                    charts: [cPie],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    },
    createTopHostReport: function (filter ) {
      return this.createTopNameReport( filter, false,
        //parse host from a name (eGW/GET/http://www.yahoo.com//0)
        //==> retun www.yahoo.com
        function( name ){
          var d = name.indexOf( "http://");
          if( d >= 0 ){
            return name.substring( d + 7, name.indexOf( "/", d + 7) );
          }
          //if does not contain http://
          //eGW/GET/www.yahoo.com//0
          var len = 0;
          var d = name.indexOf("GET/");
          len = "GET/".length;
          if( d == -1 ){
            d = name.indexOf("POST/");
            len = "POST/".length;
          }

          if( d == -1 ){
            d = name.indexOf("HEAD/");
            len = "HEAD/".length;
          }
          if( d == -1 ){
            d = name.indexOf("PUT/");
            len = "PUT/".length;
          }
          if( d == -1 ){
            d = name.indexOf("DELETE/");
            len = "DELETE/".length;
          }
          if( d == -1 ){
            d = name.indexOf("OPTIONS/");
            len = "OPTIONS/".length;
          }
          if( d == -1 ){
            d = name.indexOf("TRACE/");
            len = "TRACE/".length;
          }

          if( d == -1 ){
            d = name.indexOf("CONNECT/");
            len = "CONNECT/".length;
          }

          if( d == -1){
            return null;
          }
          name = name.substring( d + len );
          d = name.indexOf("/");
          if( d == -1 )
            return name;

          name = name.substring(0, d);
          return name;
        });
    },
    createTopMACReport: function (filter) {
        return this.createTopNameReport(filter, true);
    },
    createTopoReport: function (filter) {

      //draw topo chart
      var topoChart = new MMTDrop.Chart({
        getData: {
          getDataFn: function (db) {
            return {
              data: [[db.data()]],
              columns: [{id: 0}]
            };
          }
        }
      },
      function (elemID, option, data) {
//style defintion
var str =
function(){
/**
<style type="text/css">
.node:hover {
  cursor: pointer;
}
.link path {
  fill: none;
  stroke: #1f77b4;
  pointer-events: none;
}
.link textPath {
  pointer-events: none;
  font: 10px sans-serif;
  fill: #1f77b4;
}

.node circle {
  stroke-width: 2px;
}
.node text {
  cursor: pointer;
  font: 12px sans-serif;
}
</style>
*/
}.toString().split('\n').slice(2, -2).join('\n');
$(str).appendTo("head");

            //console.log( data );
          return function( eID, data ){
            data = data[0][0]
            var width = $(eID).getWidgetContentOfParent().innerWidth() - 20,
                height = $(eID).getWidgetContentOfParent().innerHeight() - 30;

            const COLOR = d3.scale.category10();

            const svg = d3.select( eID ).append("svg")
                .attr("width", width)
                .attr("height", height);
              //get set of nodes in obj
              var obj = {};
              var max = 0;
              for( var i=0; i<data.length; i++ ){
                var msg = data[i];
                var name = msg[ NDN.MAC_SRC.id ];
                var val  = msg[ NDN.INTEREST_NONCE.id ];
                if( max < val )
                  max = val;
                msg.source = name;
                if( obj[ name ] == undefined ){
                  obj[ name ] = { name: name, id: name.replace(/:/g, "_"), data: msg, alert: 0 };
                }
                obj[ name ].alert += msg[ NDN.IFA.id ];

                name = msg[ NDN.MAC_DEST.id ];
                msg.target = name;
                if( obj[ name ] == undefined )
                  obj[ name ] = { name: name, id: name.replace(/:/g, "_"), data: msg, alert: 0 };
                obj[ name ].alert += msg[ NDN.IFA.id ];
              }

              var nodes = [];
              //convert obj 2 Array
              for( var i in obj ){
                var n = obj[ i ];
                n.index = nodes.length;
                nodes.push( n );
              }
              //update index of source and target
              var links = data;
              max = max / 5;
              for( var i=0; i<data.length; i++ ){
                var msg = data[i];
                msg.source = obj[ msg.source ].index;
                msg.target = obj[ msg.target ].index;
                //line width of the links
                msg.weight = msg[ NDN.INTEREST_NONCE.id ] ;
                if( data.length == 1 )
                  msg.weight = 1.25;
                else{
                  if( msg.weight < max )
                    msg.weight = 1.25;
                  else if ( msg.weight < max * 2 )
                    msg.weight = 1.25;
                  else if ( msg.weight < max * 3 )
                    msg.weight = 1.5;
                  else if ( msg.weight < max * 4 )
                    msg.weight = 1.75;
                  else
                    msg.weight = 2;
                }
                //label
                msg.label =  msg[ NDN.INTEREST_NONCE.id ] + " pkt, " + msg[ NDN.NDN_DATA.id ] + " B / "
                  + msg[ NDN.INTEREST_NONCE.id + 100 ] + " pkt, " + msg[ NDN.NDN_DATA.id + 100 ] + " B";
              }

              //Set up the force layout
              var force = d3.layout.force()
                  .charge(-800)
                  .friction(0.2)
                  .linkDistance(200)
                  .size([width, height]);

              //Creates the graph data structure out of the json data
              force.nodes(nodes)
                  .links(links)
                  .start();

              //Create all the line svgs but without locations yet
              var link = svg.selectAll(".link")
                  .data(links)
                  .enter()
                  .append("g")
                  .attr("class", "link")
              ;
              link.append("path")
                  .style("marker-end",  function( d ){
                    if( d.weight >= 1.5 )
                      return "url(#arrowhead2)";
                    return "url(#arrowhead1)";
                  })
                  .style("stroke-width", function (d) {
                    return d.weight;
                  })
                  .style("stroke-dasharray", function (d) {
                    if( d[ NDN.CAP_LEN.id ] == 0 )
                      return "3,2";
                    return "3,0";
                  })
                  .style("stroke-linejoin", "miter")
                  .attr('id',function(d,i) {return 'edgepath'+i})
              ;
              link.append("text")
                  .attr("dx", 15)
                  .attr("dy", -5)
                  .attr("opacity", 0)
                  .append("textPath")
                  .text(function(d) { return d.label })
                  .attr('xlink:href',function(d,i) {return '#edgepath'+i})
                  .style("pointer-events", "none")
              ;

              //Do the same with the circles for the nodes - no
              var node = svg.selectAll(".node")
                  .data( nodes )
                  .enter()
                  .append("g")
                  .attr("class", "node")
                  .on('mouseover', function( d ){
                    if( d.draging === true )
                      return;

                    //Reduce the opacity of all but the neighbouring nodes
                    node.style("opacity", function (o) {
                      return d.index==o.index
                              || d.index==o.data.target.index || d.index==o.data.source.index
                              || d.data.target.index==o.index || d.data.source.index==o.index ? 1 : 0.1;
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
                    //Put them back to opacity=1
                    node.style("opacity", 1);
                    link.style("opacity", 1);
                    link.selectAll("text").style("opacity", 0);
                  })
                  .call(
                    d3.behavior.drag()
                      .on("dragstart", function(d, i) {
                        d.draging = true;
                        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
                        force.stop() // stops the force auto positioning before you start dragging
                      })
                      .on("drag", function(p, i) {
                        //ensure that the nodes do not go outside
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
                        force.resume();
                        d.draging = false;
                      })
                  )
              ;

              node.append("circle")
                  .attr("r", 12)
                  .style("fill", function (d) {
                    return "green";
                  })
                  .on('dblclick', function(d) {
                    d.fixed = false;
                  })
              ;
              node.append("text")
                  .attr("dx", 15)
                  .attr("dy", ".35em")
                  .text(function(d) { return d.name })
                  .on("click", function(d){
                    MMTDrop.tools.reloadPage( "mac="+ d.name );
                  })
              ;

              node.append("text")
                  .attr("text-anchor", "middle")
                  .attr("dy", ".35em")
                  .attr("fill", "white")
                  .text(function(d) {
                    return d.alert;
                  })
                  .on('dblclick', function(d) {
                    d.fixed = false;
                  })
              ;

              function updatePosition() {
                  link.selectAll("path")
                    .attr("d", function(d) {
                      var dx = d.target.x - d.source.x,
                      dy = d.target.y - d.source.y,
                      dr = Math.sqrt(dx * dx + dy * dy);
                      dr *= 1.5;
                      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                    })
                  ;
                  //label of each link

                  node.selectAll("circle")
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                      return d.y;
                    })
                    .style("stroke", function (d) {
                      if( d.fixed )
                        return "red";
                      return "grey";
                    })
                  ;
                  node.selectAll("text")
                    .attr("x", function (d) {
                        return d.x;
                    })
                    .attr("y", function (d) {
                        return d.y;
                    })
                  ;
              }
              //Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
              force.on("tick", updatePosition);

              //style of end-arrow
              svg.append('defs')
                .append('marker')
                .attr({'id':'arrowhead2',
                       'refX':10,
                       'refY':2.5,
                       'orient':'auto',
                       'markerWidth':3,
                       'markerHeight':6,
                })
                .append('svg:path')
                    .attr('d', 'M0,0 V6 L3,3 Z')
                    .attr('fill', '#1f77b4')
                ;
                svg.append('defs')
                  .append('marker')
                  .attr({'id':'arrowhead1',
                         'refX':18,
                         'refY':2,
                         'orient':'auto',
                         'markerWidth':3,
                         'markerHeight':6,
                  })
                  .append('svg:path')
                      .attr('d', 'M0,0 V6 L3,3 Z')
                      .attr('fill', '#1f77b4')
                  ;
              //---End style



              return svg;
            }( "#" + elemID, data );
      });//end topoChart

      var $group ={_id : {}};
      [NDN.MAC_SRC.id, NDN.MAC_DEST.id].forEach( function( el, index){
          $group["_id"][ el ] = "$" + el;
          $group[ el ]        = {"$first" : "$"+ el};
        } );
      [NDN.IFA.id].forEach( function( el, index){
          $group[ el ]        = {"$sum" : "$"+ el};
        } );
      //packet : interest and data
     $group[ NDN.INTEREST_NONCE.id ] = { "$sum" : { $cond: { if: { "$eq" : ["$" + NDN.PACKET_TYPE.id, 5] }, then: 1, else: 0 } } };

      $group[ NDN.INTEREST_NONCE.id + 100 ] = { "$sum" : { $cond: { if: { "$eq" : ["$" + NDN.PACKET_TYPE.id, 6] }, then: 1, else: 0 } } };

      //volume: interest and data
      $group[ NDN.NDN_DATA.id ] = { "$sum" : { $cond: { if: { "$eq" : ["$" + NDN.PACKET_TYPE.id, 5] }, then: "$"+ NDN.NDN_DATA.id, else: 0 } } };
      $group[ NDN.NDN_DATA.id + 100] = { "$sum" : { $cond: { if: { "$eq" : ["$" + NDN.PACKET_TYPE.id, 6] }, then: "$"+ NDN.NDN_DATA.id, else: 0 } } };

      var $match ={};
      if( URL_PARAM.mac ){
        //either source or destination
        $match[ "$or" ] = [{},{}];
        $match["$or"][0][ NDN.MAC_SRC.id ]  = URL_PARAM.mac;
        $match["$or"][1][ NDN.MAC_DEST.id ] = URL_PARAM.mac;
      }
      if( URL_PARAM.name )
        $match[ NDN.QUERY.id ] = URL_PARAM.name;
      if( URL_PARAM.host )
        $match[ NDN.NAME.id ] = {$regex: URL_PARAM.host};

      var $project = {}
      $project[ NDN.IFA.id ] = { $cond: { if: { $gt: [ "$" + NDN.IFA.id, 0 ] }, then: 1, else: 0 } };

      [ NDN.MAC_SRC.id, NDN.MAC_DEST.id, NDN.NAME.id, NDN.PACKET_TYPE.id, NDN.NDN_DATA.id, NDN.INTEREST_NONCE.id ].forEach( function( el, index){
          $project[ el ] = 1;
      });


      var database = new MMTDrop.Database( {collection: "data_ndn", action: "aggregate",
        query: [{$match: $match},{$project: $project},{$group: $group}], raw : true } );

      var report = new MMTDrop.Report(
          // title
          null,
          // database
          database,
          // filers
        [],
          //charts
        [{ charts: [topoChart], width: 12 } ],
          //order of data flux
        [{ object: topoChart }]
      );

      return report;
    },
}



//show hierarchy URL parameters on toolbar
$( function(){
    var old = page.id;
    page.id = "ndn/top";
    breadcrumbs.loadDataFromURL();
    page.id = old;
});
