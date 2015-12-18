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
function collide(node) {
    var r = node.radius + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}

function IPGraph(domElem, w, h) {

    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({
            "id": id,
            radius: 20
        });
        update();

        //flash
        $("#group-ip-" + id).animate({
            opacity: 0
        }, 500, "linear", function () {
            $(this).animate({
                opacity: 1
            }, 300, "linear", function () {
                $(this).animate({
                    opacity: 0
                }, 300, "linear", function () {
                    $(this).animate({
                        opacity: 1
                    }, 300);
                });
            });
        });
    };

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
                links.splice(i, 1);
            } else i++;
        }
        nodes.splice(findNodeIndex(id), 1);
        update();
    };

    this.removeAllNodes = function () {
        nodes.splice(0, links.length);
        update();
    };

    var findNode = function (id) {
        for (var i in nodes) {
            if (nodes[i]["id"] === id) return nodes[i];
        };
    };

    var findNodeIndex = function (id) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id == id) {
                return i;
            }
        };
    };

    // set up the D3 visualisation in the specified element
    var vis = d3.select( domElem )
        .attr("pointer-events", "all")
        .attr("perserveAspectRatio", "xMidYMid meet")
        .append('g');
    this.vis = vis;
    
    this.svg = function(){
        return $(domElem + " > g");
    }
    
    var force = d3.layout.force()
        .nodes([])
        .links([])
        .gravity(0.5)
        .charge(0)
        .friction( .9 )
        .size([w, h]);

    var nodes = force.nodes(),
        links = force.links();

    var update = function () {
        var node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id;
            });

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) {
                return "group-ip-" + d.id;
            })
            .call(force.drag);

        nodeEnter.append("svg:rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("id", function (d) {
                return "node-" + d.id;
            })
            .attr("class", "node-ip");
        /*
            .on("mousedown", function () {
                    d3.event.sourceEvent.stopPropagation();
                });
*/

        nodeEnter.append("svg:text")
            .attr("id", function (d) {
                return "label-" + d.id;
            })
            .attr("class", "label-ip")
            .attr("text-anchor", "middle")
            .attr("x", 15)
            .attr("y", 14)
            .text(function (d) {
                return d.id;
            });

        node.exit().remove();

        force.on("tick", function (e) {
            var nodes = force.nodes();
            var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;

            while (++i < n) {
                q.visit(collide(nodes[i]));
            }
            node
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        });

        force.start();

    };

    this.force = force;
    // Make it all go
    update();
}

function myGraph(domID) {
    this.ipNodes = [];

    // Add and remove elements on the graph object
    this.addCategory = function (id) {
        if (findNode(id) !== undefined)
            return;

        var newCat = {
            id: id,
            children: [],
            radius: 100
        };
        
        categories.push(newCat);
        update();

        return newCat;
    };

    this.addIP = function (ip, cat) {
        var node = findNode(cat);
        if (node === undefined) {
            node = this.addCategory(cat);
        }
        if (node.graph === undefined)
            node.graph = new IPGraph("#group-" + cat, 20, 20);
        else {
            var w = 10 * node.children.length + 10
            node.graph.force.size([w, w]).resume();
        }
        node.graph.addNode(ip);

        this.ipNodes.push(ip);

        node.children.push({
            id: ip,
            history: []
        });
        
        //
        var c_size = node.graph.svg().get(0).getBBox();
        var max = Math.max( c_size.width, c_size.height );
        if(  max + 10 > node.radius ){
            node.radius = max + 10;

            //update radius of node
            d3.selectAll('#node-' + cat).attr('r', function (d) {
                return d.radius;
            });

            //update label
            d3.selectAll('#label-' + cat).attr('y', function (d) {
                return -(d.radius + 4);
            });
            force.resume();
        }
    }

    this.changeCategory = function (ip, newCat) {
        var exist = false;
        var oldCatObj = null;
        var ipObj = null;

        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            for (var j = 0; j < cat.children.length; j++)
                if (cat.children[j].id == ip) {
                    ipObj = cat.children[j];
                    oldCatObj = cat;
                }
            if (ipObj !== undefined) break;
        }
    }

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
                links.splice(i, 1);
            } else i++;
        }
        categories.splice(findNodeIndex(id), 1);
        update();
    };

    this.removeLink = function (source, target) {
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == source && links[i].target.id == target) {
                links.splice(i, 1);
                break;
            }
        }
        update();
    };

    this.removeallLinks = function () {
        links.splice(0, links.length);
        update();
    };

    this.removeAllcategories = function () {
        categories.splice(0, links.length);
        update();
    };

    this.addLink = function (source, target, value) {
        links.push({
            "source": findNode(source),
            "target": findNode(target),
            "value": value
        });
        update();
    };

    var findNode = function (id) {
        for (var i in categories) {
            if (categories[i]["id"] === id) return categories[i];
        };
    };

    var findNodeIndex = function (id) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].id == id) {
                return i;
            }
        };
    };

    // set up the D3 visualisation in the specified element
    var w = $(domID).width(),
        h = $(domID).getWidgetContentOfParent().innerHeight() - 30;

    var color = d3.scale.category10();

    var vis = d3.select(domID)
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("pointer-events", "all")
        .attr("viewBox", "0 0 " + w + " " + h)
        .attr("perserveAspectRatio", "xMidYMid meet");
    this.vis = vis;
    
    
    var force = d3.layout.force()
        .nodes([])
        .links([])
        .gravity(0.05)
        .charge(10)
        .friction( .5 )
        .size([w, h]);
    this.force = force;
    
    var categories = force.nodes(),
        links = force.links();

    var update = function () {
        var link = vis.selectAll("line")
            .data(links, function (d) {
                return d.source.id + "-" + d.target.id;
            });

        link.enter().append("line")
            .attr("id", function (d) {
                return d.source.id + "-" + d.target.id;
            })
            .attr("class", "link");
        /*
        link.append("title")
            .text(function (d) {
                return d.value;
            });
            */
        link.exit().remove();

        var node = vis.selectAll("g.group")
            .data(categories, function (d) {
                return d.id;
            });

        var nodeEnter = node.enter().append("g")
            .attr("class", "group")
            .attr("id", function (d) {
                return "group-" + d.id;
            })
            .call(force.drag);

        nodeEnter.append("svg:circle")
            .attr("r", function(d){
                return d.radius;
            })
            .attr("id", function (d) {
                return "node-" + d.id;
            })
            .attr("class", "node-category")
        ;

        nodeEnter.append("svg:text")
            .attr("id", function (d) {
                return "label-" + d.id;
            })
            .attr("class", "label-category")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", function( d){
                return -d.radius -10;
            })
            .text(function (d) {
                return d.id;
            });

        // Exit any old nodes.
        node.exit().remove();

        force.on("tick", function () {
            var nodes = force.nodes();
            var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;

            while (++i < n) {
                q.visit(collide(nodes[i]));
            }

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            return;
            link.attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

        });


        // Restart the force layout.
        force.start();

        // because of the way the network is created, nodes are created first, and links second,
        // so the lines were on top of the nodes, this just reorders the DOM to put the svg:g on top
        $(".nodeStrokeClass").each(function (index) {
            var gnode = this.parentNode;
            gnode.parentNode.appendChild(gnode);
        });
    };


    // Make it all go
    update();
}

MMTDrop.chartFactory.createBehavior = function (param) {
    var _param = {};
    _param = MMTDrop.tools.mergeObjects(_param, param);

    var chart = new MMTDrop.Chart(_param,
        function (elemID, option, data) {
            $('<style type="text/css">\
.text { font-size: 11px; pointer-events: none; }\
circle { fill: transparent; stroke: #999; pointer-events: all; cursor:move} \
circle:hover { stroke: #ff7f0e; stroke-width: 3px; } \
.link { stroke: #666666; stroke-width: 1.5px; fill: none} \
.label-category { stroke-width: 3px, fill:grey}\
#group-Web .node-category{ stroke: #00f } \
#group-Web .node-ip {fill: #f0f; stroke: #00F}\
</style>').appendTo("head");

            elemID = "#" + elemID;

        var rand = function (i) {
                    return Math.round(Math.random() * i) - 1;
                }
        

            var graph = new myGraph(elemID);
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