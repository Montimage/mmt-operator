var arr = [
    {
        id: "behaviour",
        title: "Profile Analysis",
        x: 0,
        y: 8,
        width: 12,
        height: 8,
        type: "success",
        userData: {
            fn: "createBehaviourReport"
        },
    },
    {
        id: "ba_bandwidth",
        title: "Bandwidth Analysis",
        x: 0,
        y: 0,
        width: 12,
        height: 4,
        type: "info",
        userData: {
            fn: "createBandwidthReport"
        },
    },
];

var availableReports = {
    "createBehaviourReport": "Profile Analysis",
    "createBandwidthReport": "Bandwidth Analysis"
}

var database = MMTDrop.databaseFactory.createFlowDB({
    format: [MMTDrop.constants.CsvFormat.BA_PROFILE_FORMAT,
               MMTDrop.constants.CsvFormat.BA_BANDWIDTH_FORMAT]
});

var filters = [MMTDrop.filterFactory.createPeriodFilter(),
                MMTDrop.filterFactory.createProbeFilter()];

// Move d to be adjacent to the cluster node.
function myGraph(domID, root) {
    var _this = this;

    // set up the D3 visualisation in the specified element
    var w = $(domID).width(),
        h = $(domID).getWidgetContentOfParent().innerHeight() - 30;
    var diameter = Math.min(w, h);

    var color = d3.scale.category10();

    var index = 0;

    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        })

    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var vis = d3.select(domID).append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");


    this.update = function (source) {
        var duration = d3.event && d3.event.altKey ? 5000 : 500;

        // Compute the new tree layout.
        var nodes = tree.nodes(root);

        // Update the nodes…
        var node = vis.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++index);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
            })
            .attr("cursor", function (d) {
                if (d.children || d._children)
                    return "pointer";
                return "default";
            })
            .attr("name", function (d) {
                return d.name;
            })
            .on("click", function (d) {
                if (d.children || d._children) {
                    toggle(d);
                    _this.update(d);
                }
            });

        nodeEnter.append("svg:circle")
            .attr("r", function (d) {
                if (d.children || d._children)
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
                return color(d.cat_index);
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            });

        nodeUpdate.select("circle")
            .style("fill", function (d, i) {
                if (d.children || d._children)
                    return d._children ? color(d.cat_index) : "#fff";
                return "#fff";

            })
            .style("stroke", function (d, i) {
                return color(d.cat_index);
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "rotate(" + (source.x - 90) + ") translate(" + source.y + ")";
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
            .attr("stroke", function (d, i) {
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


    this.removeIp = function (ip) {
        for (var i in root.children) {
            var cat = root.children[i];
            var arr = cat.children;
            for (var j in arr) {
                var e = arr[j];
                if (e.name == ip) {
                    //flash
                    $('g[name="' + ip + '"]').animate({
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
                    setTimeout(function (arr, j, cat) {
                        arr.splice(j, 1);
                        _this.update(cat);
                    }, 2000, arr, j, cat)
                    return true;
                }
            }
        }
        return false;
    }

    this.addIp = function (ip, cat_name) {
        for (var i in root.children) {
            var cat = root.children[i];
            if (cat.name != cat_name)
                continue;

            //is hidden
            if (cat.children === undefined && cat._children) {
                cat._children.push({
                    name: ip,
                    cat_index: i
                });
                return;
            }
            if (cat.children === undefined)
                cat.children = [];

            cat.children.push({
                name: ip,
                cat_index: i
            });
            _this.update(cat);
            //flash
            /*
            setTimeout(function () {
                $('g[name="' + ip + '"]').animate({
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
            }, 1000)
            */
            return;
        }
    }

    this.moveIp = function (ip, new_cat) {
        this.removeIp(ip);
        setTimeout(this.addIp, 3000, ip, new_cat);
    }

    root.x0 = h / 2;
    root.y0 = 0;

    // Initialize the display to show a few nodes.
    this.update(root);
}

MMTDrop.chartFactory.createBehaviour = function (param) {
    var _param = {};
    _param = MMTDrop.tools.mergeObjects(_param, param);

    var chart = new MMTDrop.Chart(_param,
        function (elemID, option, data) {

            $('<style type="text/css">\
.node circle { fill: #fff; stroke: steelblue; stroke-width: 1.5px; } \
.node { font: 10px sans-serif; } \
.link { fill: none; stroke-width: 1.5px; } \
</style>').appendTo("head");
            var root = data[0][0];
            var graph = new myGraph("#" + elemID, root);

            return graph;
        });
    return chart;
}

var ReportFactory = {
    createBehaviourReport: function (fProbe, database) {
        var COL = MMTDrop.constants.BehaviourColumn;

        var cLine = MMTDrop.chartFactory.createBehaviour({
            getData: {
                getDataFn: function (db) {
                    var root = {
                        "name": "",
                        "children": []
                    };
                    //add all categories
                    for (var i in MMTDrop.constants.CategoriesIdsMap) {
                        if (i == 0)
                            continue;
                        var cat_name = MMTDrop.constants.CategoriesIdsMap[i];

                        root.children.push({
                            name: cat_name,
                            cat_index: i,
                            children: []
                        });
                    }

                    root.children.push({
                        name: "Inactive",
                        cat_index: root.children.length,
                        children: []
                    })
                    root.children.push({
                        name: "*",
                        cat_index: root.children.length,
                        children: []
                    })
                    var addToRoot = function (ip, cat_name) {
                        for (var i in root.children) {
                            var cat = root.children[i];
                            if (cat.name == cat_name) {
                                cat.children.push({
                                    name: ip,
                                    cat_index: cat.cat_index
                                });
                                return;
                            }
                        }

                    }

                    var data = db.data();
                    var new_data = [];
                    for (var i = 0; i < data.length; i++)
                        if (data[i][0] === MMTDrop.constants.CsvFormat.BA_PROFILE_FORMAT)
                            new_data.push(data[i]);


                    data = new_data;

                    for (var i in data) {
                        var msg = data[i];
                        var ip = msg[COL.IP.id];
                        var cat_name = msg[COL.AFTER.id];

                        if (cat_name == "null")
                            cat_name = "Inactive";

                        addToRoot(ip, cat_name);
                    }

                    return {
                        data: [[root]],
                        columns: [{
                            id: 0,
                            label: ""
                        }]
                    };
                }
            }
        });
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var new_data = [];
                    for (var i = 0; i < data.length; i++)
                        if (data[i][0] === MMTDrop.constants.CsvFormat.BA_PROFILE_FORMAT)
                            new_data.push(data[i]);

                    var obj = MMTDrop.tools.splitData(new_data, COL.IP.id);
                    data = [];

                    var colObj = {};
                    colObj["IP"] = "IP";

                    for (var ip in obj) {
                        var o = {
                            IP: ip
                        };

                        var arr = obj[ip];
                        for (var j = 0; j < arr.length; j++) {
                            var msg = arr[j];
                            var ts = msg[COL.TIMESTAMP.id]
                            var cat_name = msg[COL.AFTER.id];
                            if (cat_name == "null")
                                cat_name = "Inactive";

                            colObj[ts] = ts;
                            o[ts] = cat_name;
                        }

                        data.push(o);
                    }
                    var cols = [];
                    for (var id in colObj) {
                        var label = id;
                        if (id != "IP") {
                            var d = new Date(parseInt(id));
                            label = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + "H";
                        }
                        cols.push({
                            id: colObj[id],
                            label: label
                        });
                    }

                    return {
                        data: data,
                        columns: cols
                    };
                }
            },
            chart: {
                "paging": false,
                "scrollX": true,
                "scrollY": true,
                "info": false
            }
        })

        var behaviourChange = {
            isUpdating: false,
            data: [],
            update: function () {
                if (this.isUpdating)
                    return;
                if (this.data.length == 0)
                    return;

                this.drawElement();

            },

            drawElement: function () {
                if (this.data.length === 0) {
                    this.isUpdating = false;
                    return;
                }
                this.isUpdating = true;
                //get the first element of data
                var obj = this.data.shift();
                cLine.chart.moveIp(obj.ip, obj.cat_name);

                setTimeout(this.drawElement.bind(this), 5000);
            }
        };


        database.onMessage("ba_profile.report", function (arr) {
            for (var i = 0; i < arr.length; i++) {
                var msg = arr[i];
                var ip = msg[MMTDrop.constants.BehaviourColumn.IP.id];
                var cat_name = msg[MMTDrop.constants.BehaviourColumn.AFTER.id];

                if (cat_name == "null")
                    cat_name = "Inactive";

                behaviourChange.data.push({
                    ip: ip,
                    cat_name: cat_name
                });
                behaviourChange.update();
            }
        });

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
                    width: 5
                },
                {
                    charts: [cTable],
                    width: 7
                }
					 ],

            //order of data flux
            [{
                object: fProbe,
                effect: [
                    {
                        object: cLine
                },
                    {
                        object: cTable
                }
            ]
			}, ]
        );

        return report;
    },

    createBandwidthReport: function (fProbe, database) {
        var openingRow = null;
        var COL = MMTDrop.constants.BehaviourColumn;
        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var new_data = [];
                    for (var i = 0; i < data.length; i++)
                        if (data[i][0] === MMTDrop.constants.CsvFormat.BA_BANDWIDTH_FORMAT)
                            new_data.push(data[i]);

                    var obj = MMTDrop.tools.splitData(new_data, COL.IP.id);

                    data = [];

                    for (var ip in obj) {
                        var cats = [];
                        var arr = obj[ip];
                        for (var j = 0; j < arr.length; j++) {
                            var msg = arr[j];
                            var cat_name = msg[COL.AFTER.id];
                            //if( cat_name == "null" )
                            //    cat_name = "Inactive";
                            cats.push(cat_name);
                        }

                        data.push([ip, cats.join()]);
                    }
                    return {
                        data: data,
                        columns: [
                            {
                                id: 0,
                                label: "IP Address"
                            },
                            {
                                id: 1,
                                label: "History"
                            }
                        ]
                    };
                }
            },
            chart: {
                "paging": false,
                //"scrollX": true,
                //"scrollY": true,
                "info": false
            },
            afterRender: function (_chart) {
                var table = _chart.chart;
                table.DataTable().columns.adjust();

                var $currentRow;
                // Add event listener for opening and closing details
                table.on('click', 'tr[role=row]', function () {
                    var tr = $(this);
                    var row = _chart.chart.api().row(tr);

                    if (row.child.isShown()) {
                        // This row is already open - close it
                        row.child.hide();
                        tr.removeClass('shown');
                        openingRow = null;
                    } else {
                        //close the last opening
                        if (openingRow) {
                            openingRow.child.hide();
                            $(openingRow.node()).removeClass('shown');
                        }

                        // Open this row
                        var index = row.data()[0] - 1;
                        var history = detailOfPopupProperty[index];
                        if (history) history = history[COL.HISTORY.id];

                        var str = "";
                        for (var ev in history) {
                            var event = history[ev];

                            if (typeof (event.timestamp) === "number") {
                                event.timestamp *= 1000;
                                event.timestamp = MMTDrop.tools.formatDateTime(new Date(event.timestamp), true);
                            }
                            event = JSON.stringify(event, function (key, val) {
                                    if (typeof val === "string")
                                        return "<string>" + val + "</string>";
                                    if (typeof val === "number")
                                        return "<number>" + val + "</number>";
                                    return val;
                                })
                                .replace(/(\"<string>)/g, '<string>"').replace(/<\/string>\"/g, '"</string>')
                                .replace(/\"<number/g, "<number").replace(/number>\"/g, "number>")
                                .replace(/\"(.+)\":/g, "<label>$1</label> :");

                            str += "<li>" + event + "</li>";
                        }

                        row.child('<div id="detailTest"><ul>' + str + '</ul></div>').show();
                        tr.addClass('shown');
                        openingRow = row;
                    }
                    return false;
                });
            }
        })


        database.onMessage("ba_bandwidth.report", function (arr) {
            for (var i = 0; i < arr.length; i++) {
                var msg = arr[i];
                var ip = msg[MMTDrop.constants.BehaviourColumn.IP.id];
                var cat_name = msg[MMTDrop.constants.BehaviourColumn.AFTER.id];

                //if( cat_name == "null" )
                //    cat_name = "Inactive";
            }
        });

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
                }
					 ],

            //order of data flux
            [{
                object: fProbe,
                effect: [
                    {
                        object: cTable
                }
            ]
			}, ]
        );

        return report;
    }
};