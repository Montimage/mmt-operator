var arr = [
    {
        id: "behavior",
        title: "Behavior Analysis",
        x: 0,
        y: 0,
        width: 6,
        height: 8,
        type: "success",
        userData: {
            fn: "createBehaviorReport"
        },
    }
];

var dataBase = {
    "name": "",
    "children": []
};

for (var i in MMTDrop.constants.CategoriesIdsMap) {
    if (i == 0)
        continue;
    var cat_name = MMTDrop.constants.CategoriesIdsMap[i];
    var n = MMTDrop.tools.random(10);
    var arr = [];
    for (var j = 0; j < n; j++) {
        var ip = MMTDrop.tools.random(255) + "." + MMTDrop.tools.random(255) + "." + MMTDrop.tools.random(255) + "." + MMTDrop.tools.random(255)
        arr.push({
            name: ip,
            cat_index: i
        });
    }
    dataBase.children.push({
        name: cat_name,
        cat_index: i,
        children: arr
    });
}

var availableReports = {
    "createBehaviorReport": "Behavior Analysis",
}

var database = MMTDrop.databaseFactory.createFlowDB({
    format: [MMTDrop.constants.CsvFormat.WEB_APP_FORMAT,
               MMTDrop.constants.CsvFormat.SSL_APP_FORMAT]
});

var filters = [MMTDrop.filterFactory.createPeriodFilter(),
                MMTDrop.filterFactory.createProbeFilter()];

// Move d to be adjacent to the cluster node.
function myGraph(domID) {


    // set up the D3 visualisation in the specified element
    var w = $(domID).width(),
        h = $(domID).getWidgetContentOfParent().innerHeight() - 30;
    var diameter = Math.min(w, h);

    var color = d3.scale.category10();

    var i = 0,
        root;

    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; })

    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", zoomed);

    var vis = d3.select( domID ).append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")")
        //.call(zoom)
    ;

    
    function update(source) {
        var duration = d3.event && d3.event.altKey ? 5000 : 500;

        // Compute the new tree layout.
        var nodes = tree.nodes(root);

        // Update the nodes…
        var node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
            })
            .on("click", function (d) {
                toggle(d);
                update(d);
            });

        nodeEnter.append("svg:circle")
            .attr("r", function( d ){
                if( d.children )
                    return 5;
                return 3;
            })
            //.style("fill", function (d, i) {
            //    return d._children ? "lightsteelblue" : "#ff0";
            //})
            ;

        nodeEnter.append("svg:text")
            .attr("x", 10)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .text(function (d) {
                return d.name;
            })
            .style("fill", function (d) {
                return color( d.cat_index );
            })
        ;

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        nodeUpdate.select("circle")
            .style("fill", function (d, i) {
                if( d.children || d._children )
                    return d._children ? color(d.cat_index) : "#fff";
                return "#fff";
                
            })
            .style("stroke", function (d, i) {
                return color(d.cat_index);
            })
        ;

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (source.x - 90) + ")translate(" + source.y + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = vis.selectAll("path.link")
            .data(tree.links(nodes), function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .attr("stroke", function( d,i ){
                //if( d.children )
                //    return color( target.cat_index );
                return "#ccc";
            })
            .attr("d", function (d, i) {
                var o = {
                    x: source.x0,
                    y: source.y0,
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children.
    function toggle(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }
    
    root = dataBase;
        root.x0 = h / 2;
        root.y0 = 0;

        function toggleAll(d) {
            if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
            }
        }

        // Initialize the display to show a few nodes.
        update(root);
    
    // Define the zoom function for the zoomable tree

    function zoomed() {
        vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
}

MMTDrop.chartFactory.createBehavior = function (param) {
    var _param = {};
    _param = MMTDrop.tools.mergeObjects(_param, param);

    var chart = new MMTDrop.Chart(_param,
        function (elemID, option, data) {
            $('<style type="text/css">\
.node circle { fill: #fff; stroke: steelblue; stroke-width: 1.5px; } \
.node { font: 10px sans-serif; } \
.link { fill: none; stroke-width: 1.5px; } \
</style>').appendTo("head");

            elemID = "#" + elemID;


            var graph = new myGraph(elemID);
            /*
                setInterval(function () {
                    var rand = function (i) {
                        return Math.round(Math.random() * i);
                    }
                    var cat1 = MMTDrop.constants.CategoriesIdsMap[rand(2)];
                    var cat2 = MMTDrop.constants.CategoriesIdsMap[rand(15)];
                    var ip = rand(255);
                    //graph.addCategory( cat1 )
                    //graph.addCategory( cat2 )
                    //graph.addLink(cat1, cat2, 10);
                    graph.addIP(ip, cat1);
                }, 2000);
                */

        });
    return chart;
}

var ReportFactory = {
    createBehaviorReport: function (fProbe, database) {
        var cLine = MMTDrop.chartFactory.createBehavior({
            getData: {
                getDataFn: function (db) {
                    var arr = [];
                    return {
                        data: [[arr]],
                        columns: [{
                            id: 0,
                            label: ""
                        }]
                    };
                }
            }
        });
        var dataFlow = [{
            object: fProbe,
            effect: [{
                object: cLine,
            }]
			}, ];

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
                    charts: [cLine],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );

        return report;
    }
};