var arr = [
    {
        id: "profile",
        title: "Profile Change",
        x: 0,
        y: 0,
        width: 12,
        height: 6,
        type: "success",
        userData: {
            fn: "createProfileReport"
        },
    },
    {
        id: "ba_bandwidth",
        title: "Bandwidth Usage Change",
        x: 0,
        y: 7,
        width: 12,
        height: 6,
        type: "info",
        userData: {
            fn: "createBandwidthReport"
        },
    },
];

var availableReports = {
    "createProfileReport": "Profile",
    "createBandwidthReport": "Bandwidth"
}

var database = new MMTDrop.Database({
    format: [MMTDrop.constants.CsvFormat.BA_PROFILE_FORMAT,
               MMTDrop.constants.CsvFormat.BA_BANDWIDTH_FORMAT]
});

var fPeriod = MMTDrop.filterFactory.createPeriodFilter();
var filters = [fPeriod,
                MMTDrop.filterFactory.createProbeFilter()];

// Move d to be adjacent to the cluster node.
function myGraph(domID, root) {
    var _this = this;

    // set up the D3 visualisation in the specified element
    $(domID).css("text-align", "center");
    
    var w = $(domID).width(),
        h = $(domID).getWidgetContentOfParent().innerHeight() - 30;
    var diameter = Math.min(w, h);

    var COLOR = d3.scale.category10();
    var color = function (d) {
        if (d === 15)
            return "#999"

        return COLOR(d);
    }

    var index = 0;

    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 70])
        .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        })

    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var vis = d3.select(domID).append("svg:svg")
        .attr("width", diameter)
        .attr("height", diameter)
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
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
            })
            .attr("cursor", function (d) {
                if ((d.children || d._children) && (d.parent))
                    return "pointer";
                return "default";
            })
            .attr("name", function (d) {
                return d.name;
            })
            .on("click", function (d) {
                if ((d.children || d._children) && (d.parent)) {
                    toggle(d);
                    _this.update(d);
                }
            });
        nodeEnter.append("circle")
            .attr("r", function (d) {
                if (d.children || d._children)
                    return 5;
                return 3;
            })
            //.style("fill", function (d, i) {
            //    return d._children ? "lightsteelblue" : "#ff0";
            //})
        ;

        nodeEnter.append("text")
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
            })
            .attr("r", function (d) {
                if (d.children || d._children)
                    return 5;
                return 3;
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
                    var g =  d3.select( 'g[name="' + ip + '"]' );
                    var bbox = g.node().getBBox();
                    var padding = 2;
                    g.insert("rect")
                    .attr( {
                        "x" : bbox.x - padding,
                        "y" : bbox.y - padding ,
                        "width": bbox.width + 2*padding,
                        "height": bbox.height + 2*padding,
                        "fill-opacity": "0",
                        "stroke": "red"
                    });
                    
                    //flash
                    $('g[name="' + ip + '"]').animate({
                        opacity: 0
                    }, 500, "linear", function () {
                        $(this).animate({
                            opacity: 1
                        }, 1000, "linear", function () {
                            $(this).animate({
                                opacity: 0
                            }, 1000, "linear", function () {
                                $(this).animate({
                                    opacity: 1
                                }, 300);
                            });
                        });
                    });

                    setTimeout(function (arr, j, cat) {
                        arr.splice(j, 1);
                        _this.update(cat);
                    }, 4000, arr, j, cat)
                    
                    return 5000;
                }
            }
        }
        return 500;
    }
    this.addIp = function (ip, cat_name) {
        for (var i = 0; i < root.children.length; i++) {
            var cat = root.children[i];
            if (cat.name != cat_name)
                continue;

            //is hidden
            if (cat.children === undefined && cat._children) {
                cat._children.push({
                    name: ip,
                    cat_index: cat.cat_index
                });
                return;
            }

            if (cat.children === undefined)
                cat.children = [];

            cat.children.push({
                name: ip,
                cat_index: cat.cat_index
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
        var timeout = this.removeIp(ip);
        setTimeout(this.addIp, timeout, ip, new_cat);

        return timeout + 1000;
    }

    root.x0 = h / 2;
    root.y0 = 0;

    // Initialize the display to show a few nodes.
    this.update(root);
}

MMTDrop.chartFactory.createProfile = function (param) {
    var _param = {};
    _param = MMTDrop.tools.mergeObjects(_param, param);

    var chart = new MMTDrop.Chart(_param,
        function (elemID, option, data) {

            $('<style type="text/css">\
.node circle { fill: #fff; stroke: steelblue; stroke-width: 1.5px; } \
.node { font: 11px sans-serif; } \
.link { fill: none; stroke-width: 1.5px; } \
td {text-align: right;}\
</style>').appendTo("head");
            var root = data[0][0];
            var graph = new myGraph("#" + elemID, root);

            return graph;
        });
    return chart;
}

var ReportFactory = {
    createProfileReport: function (fProbe, database) {
        var COL = MMTDrop.constants.BehaviourProfileColumn;

        var cLine = MMTDrop.chartFactory.createProfile({
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

                    root.children.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });

                    root.children.push({
                        name: "Inactive",
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
                    var obj = MMTDrop.tools.splitData(data, COL.IP.id);
                    //for each IP, we retain only the last category
                    for (var ip in obj) {
                        data = obj[ip];
                        data.sort(function (a, b) {
                            return b[COL.TIMESTAMP.id] - a[COL.TIMESTAMP.id];
                        });

                        var msg = data[0];
                        var cat_name = msg[COL.PROFILE_AFTER.id];

                        if (cat_name == "null" || cat_name == "" )
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

        var openingRow = null;
        var HISTORY = [];

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var new_data = [];
                    for (var i = 0; i < data.length; i++)
                        if (data[i][0] === MMTDrop.constants.CsvFormat.BA_PROFILE_FORMAT)
                            new_data.push(data[i]);

                        //desc of timestamp
                    new_data.sort(function (a, b) {
                        return a[COL.TIMESTAMP.id] - b[COL.TIMESTAMP.id];
                    });

                    for (var i = 0; i < new_data.length; i++ ) {
                        var msg  = new_data[i];
                        var date = msg[COL.TIMESTAMP.id];
                        msg[COL.TIMESTAMP.id] = moment(date).format("YYYY/MM/DD HH:mm");
                        if (msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id] == "null" || msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id] == "")
                            msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id] = "Inactive";
                        
                        //add index column
                        msg.push( i + 1 );
                    }

                    HISTORY = new_data;

                    return {
                        data: new_data,
                        columns: [{
                            id: COL.DESCRIPTION.id + 1,
                            label: ""
                        }, COL.TIMESTAMP, COL.IP, COL.PROFILE_BEFORE, COL.PROFILE_AFTER]
                    };
                }
            },
            chart: {
                "paging": false,
                "info": true,
                "dom": '<"row" <"col-md-6" i><"col-md-6" f>> <"ba-profile-table overflow-auto-xy" t>',
                "order": [[0, "desc"]],
            },
            afterEachRender: function (_chart) {
                var table = _chart.chart;
                table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                    var $div = $('.ba-profile-table');
                    var h = $div.getWidgetContentOfParent().height() - 70;
                    $div.css('height', h);
                    $div.css('margin-top', 10);
                    $div.css('margin-bottom', 10);
                    $div.css("border", "thin solid #ddd");
                    $div.children().filter("table").css("border", "none");
                });
                //resize when changing window size
                $('.ba-profile-table').getWidgetParent().on('widget-resized', null, table, function (e) {
                    if (e.data)
                        e.data.api().draw(false);
                });
                $('.ba-profile-table').getWidgetParent().trigger('widget-resized');


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
                        if (row.data() == undefined)
                            return;
                        // Open this row
                        var index = row.data()[0];
                        var msg = HISTORY[index - 1];
                        var str = "";
                        for (var i in MMTDrop.constants.BehaviourProfileColumn ) {
                            var col = MMTDrop.constants.BehaviourProfileColumn[ i ];

                            str += "<li>" + col.label + "  = " + msg[ col.id ] + "</li>";
                        }
                        row.child('<div id="detailTest" class="overflow-auto-x code-json"><ul>' + str + '</ul></div>').show();
                        tr.addClass('shown');
                        openingRow = row;
                    }
                    return false;
                });
            }
        })

        var addDataToTable = function (msg) {
            var table = cTable.chart.api();

            var animate = function (elem) {
                //when there is a row being expanding to show its detail
                if (openingRow)
                    return;
                var $elem = $(elem);
                $(".ba-profile-table").animate({
                    scrollTop: 0
                }, 'slow', "linear");

                setTimeout(function ($e) {
                    $e.stop().flash();
                }, 100, $elem)
            }

            //ip does not exist in the table
            msg.push( HISTORY.length + 1);
            HISTORY.push(msg);

            var $row = table.row.add([HISTORY.length, 
                                      moment( msg[ COL.TIMESTAMP.id] ).format("YYYY/MM/DD HH:mm"), 
                                      msg[ COL.IP.id],
                                      msg[ COL.PROFILE_BEFORE.id ],
                                      msg[ COL.PROFILE_AFTER.id ]
                                     ]).draw().node();
            table.columns.adjust();
            
            animate($row);
        };

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
                var msg = this.data.shift();

                //
                addDataToTable(msg);

                var ip       = msg[MMTDrop.constants.BehaviourProfileColumn.IP.id];
                var cat_name = msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id];

                var timeout = cLine.chart.moveIp(ip, cat_name);
                timeout += 1000;

                setTimeout(this.drawElement.bind(this), timeout);
            }
        };

        database.onMessage("ba_profile.report", function (arr) {
            for (var i = 0; i < arr.length; i++) {
                var msg = arr[i];

                if (msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id] == "null" || msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id] == "")
                    msg[MMTDrop.constants.BehaviourProfileColumn.PROFILE_AFTER.id] = "Inactive";

                behaviourChange.data.push(msg);
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
                    width: 7
                },
                {
                    charts: [cTable],
                    width: 5
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
        var COL = MMTDrop.constants.BehaviourBandWidthColumn;
        var openingRow = null;
        var HISTORY = {};
        
        var formatBandwidth = function( msg ){
            var txt = 100;
            var v1 = msg[COL.BW_BEFORE.id],
                v2 =  msg[COL.BW_AFTER.id];
            
            if( v1 == 0 )
                txt = 1000;
            if( v2 !== 0  && v1 > v2 )
                txt = Math.round( v2 / v1 * 100 ) ;
            
            txt = txt + "%";
            return txt;
        }

        var cTable = MMTDrop.chartFactory.createTable({
            getData: {
                getDataFn: function (db) {
                    var data = db.data();
                    var new_data = [];
                    for (var i = 0; i < data.length; i++)
                        if (data[i][0] === MMTDrop.constants.CsvFormat.BA_BANDWIDTH_FORMAT)
                            new_data.push(data[i]);

                     //desc of timestamp
                    new_data.sort(function (a, b) {
                        return a[COL.TIMESTAMP.id] - b[COL.TIMESTAMP.id];
                    });

                    for (var i = 0; i < new_data.length; i++) {
                        var msg = new_data[i];
                        var date = msg[COL.TIMESTAMP.id];
                        msg[COL.TIMESTAMP.id] = moment(date).format("YYYY/MM/DD HH:mm");
                        //add index column
                        msg.push(i + 1);
                    }

                    HISTORY = new_data;

                    return {
                        data: new_data,
                        columns: [{
                            id: COL.DESCRIPTION.id + 1,
                            label: ""
                        }, 
                                  {id: COL.TIMESTAMP.id, label: COL.TIMESTAMP.label         }, 
                                  {id: COL.IP.id,        label: COL.IP.label                }, 
                                  COL.APP, 
                                  {id: COL.BW_BEFORE.id, label: COL.BW_BEFORE.label + " (B)"}, 
                                  {id: COL.BW_AFTER.id,  label: COL.BW_AFTER.label + " (B)" }, 
                                  {id: COL.PROBE_ID.id,  label: "Probe ID"                  }, 
                                  COL.SOURCE_ID,
                                  COL.PROPERTY]
                    };
                }
            },
            chart: {
                "paging": false,
                "info": true,
                "dom": '<"row" <"col-md-6" i><"col-md-6" f>> <"ba-bandwidth-table overflow-auto-xy" t>',
                "order": [[0, "desc"]],
            },
            afterEachRender: function (_chart) {
                var table = _chart.chart;
                table.DataTable().columns.adjust();

                table.on("draw.dt", function () {
                    var $div = $('.ba-bandwidth-table');
                    var h = $div.getWidgetContentOfParent().height() - 70;
                    $div.css('height', h);
                    $div.css('margin-top', 10);
                    $div.css('margin-bottom', 10);
                    $div.css("border", "thin solid #ddd");
                    $div.children().filter("table").css("border", "none");
                });
                //resize when changing window size
                $(window).on('resize', null, table, function (e) {
                    if (e.data)
                        e.data.api().draw(false);
                });
                $(window).trigger('resize');


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
                        if (row.data() == undefined)
                            return;
                        // Open this row
                        var index = row.data()[0];
                        var msg = HISTORY[index - 1];
                        var str = "";
                        for (var i in MMTDrop.constants.BehaviourBandWidthColumn ) {
                            var col = MMTDrop.constants.BehaviourBandWidthColumn[ i ];

                            str += "<li>" + col.label + "  = " + msg[ col.id ] + "</li>";
                        }
                        row.child('<div id="detailTest" class="overflow-auto-x code-json"><ul>' + str + '</ul></div>').show();
                        tr.addClass('shown');
                        openingRow = row;
                    }
                    return false;
                });
            }
        })

        var addDataToTable = function (msg) {
            var table = cTable.chart.api();

            var animate = function (elem) {
                //when there is a row being expanding to show its detail
                if (openingRow)
                    return;
                var $elem = $(elem);
                $(".ba-bandwidth-table").animate({
                    scrollTop: 0
                }, 'slow', "linear");

                setTimeout(function ($e) {
                    $e.stop().flash();
                }, 100, $elem)
            }

            msg[ COL.TIMESTAMP.id] = moment( msg[ COL.TIMESTAMP.id] ).format("YYYY/MM/DD HH:mm")
            
            //ip does not exist in the table
            HISTORY.push(msg);
            var arr = [HISTORY.length, 
                                      msg[ COL.TIMESTAMP.id ], 
                                      msg[ COL.IP.id        ],
                                      msg[ COL.APP.id       ], 
                                      msg[ COL.BW_BEFORE.id ], 
                                      msg[ COL.BW_AFTER.id  ], 
                                      msg[ COL.PROBE_ID.id  ], 
                                      msg[ COL.SOURCE_ID.id ],
                                      msg[ COL.PROPERTY.id  ]
                                     ]
            var $row = table.row.add( arr ).draw().node();
            table.columns.adjust();
            animate($row);
        };

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
                var msg = this.data.shift();

                //
                addDataToTable(msg);

                var timeout = 2000;

                setTimeout(this.drawElement.bind(this), timeout);
            }
        };

        database.onMessage("ba_bandwidth.report", function (arr) {
            for (var i = 0; i < arr.length; i++) {
                var msg = arr[i];
                behaviourChange.data.push(msg);
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