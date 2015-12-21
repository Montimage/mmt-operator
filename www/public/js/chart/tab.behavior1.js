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

MMTDrop.chartFactory.createBehavior = function (param) {
    var _param = {};
    _param = MMTDrop.tools.mergeObjects(_param, param);

    var chart = new MMTDrop.Chart(_param,
        function (elemID, option, data) {
            $('<style type="text/css">\
svg{font-family: Arial, sans-serif;font-size:10px;}\
.axis path,.axis line {fill: none;stroke:#b6b6b6;shape-rendering: crispEdges;}\
/*.tick line{fill:none;stroke:none;}*/\
.tick text{fill:#999;}\
text, rect, circle{ cursor: pointer}\
circle:hover{stroke-width: 2; stroke:#00F}\
rect:hover{stroke-width: 2; stroke:#00F}\
g.journal.active{cursor:pointer;}\
text.label{font-size:12px;font-weight:bold;cursor:pointer;}\
text.value{font-size:12px;font-weight:bold;}\
.circle-animate{ stroke-width:3 !important; stroke:red !important}\
.category-animate{ stroke:red !important; font-size: 12px !important;}\
</style>').appendTo("head");

            elemID = "#" + elemID;

            var animate = {
                stop: function () {
                    this.isStop = true;
                    
                    if( this.timeout )
                        clearTimeout( this.timeout );
                   
                    this.clearColor();
                    this.currentIndex = 0;
                    
                    return this;
                },
                clearColor: function () {
                    $(".circle-animate").attr("class", "");
                    $(".category-animate").attr("class", "");
                     d3.select("#connector").attr("display", "none");
                    return this;
                },
                currentIndex: 0,
                animate: function (arr) {
                    this.data = arr;
                    this.isStop = false;
                    this.animateNow();
                    return this;
                },
                animateNow: function(){
                    if( this.isStop === true )
                        return this;
                
                    
                    //remove animation of the previous element
                    this.clearColor();

                    var obj = this.data[this.currentIndex];

                    $(obj).attr("class", "circle-animate");
                    var cat = $(obj).attr("category");
                    $("#" + cat).attr("class", "category-animate");

                    if (this.currentIndex > 0) {
                        var o_obj = this.data[this.currentIndex - 1];
                        var x1 = $(o_obj).attr("cx"),
                            y1 = $(o_obj).attr("cy");
                        d3.select("#connector").attr({
                            "x1": x1,
                            "y1": y1,
                            "x2": x1,
                            "y2": y1
                        });
                        d3.select("#connector").transition().attr({
                            "x1": x1,
                            "y1": y1,
                            "x2": $(obj).attr("cx"),
                            "y2": $(obj).attr("cy"),
                            display: "block"
                        })
                        .duration(1000)
                        .each("end", function(){
                            this.animateNow();
                        }.bind( this ) );
                    }
                    else{
                        this.timeout = setTimeout( this.animateNow.bind( this ), 500 );
                    }

                    this.currentIndex++;
                    if (this.currentIndex >= this.data.length)
                        this.currentIndex = 0;

                    return this;
                }
            };

            var getLastIpElement = function (ip) {
                //IPv4
                var n = ip.lastIndexOf(".");
                //IPv6
                if (n === -1)
                    n = ip.lastIndexOf(":");
                if (n === -1)
                    n = 0;
                return ip.substr(n);
            };

            var margin = {
                    top: 20,
                    right: 400,
                    bottom: 0,
                    left: 20
                },
                outerWidth = $(elemID).width(),
                width = outerWidth - margin.left - margin.right,
                height = $(elemID).getWidgetContentOfParent().height() - 40;

            var start_year = 2004,
                end_year = 2013;

            var ipArray = [];

            var c20 = d3.scale.category20();
            var color = function (ip) {
                var d = ipArray.indexOf(ip);
                if (d === -1)
                    d = ipArray.push(ip) - 1;
                return c20(d);
            };

            var svg = d3.select(elemID).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("margin-left", margin.left + "px")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var defs = svg.append("defs")

            defs.append("marker")
                .attr("id", "arrowhead")
                .attr("viewBox", "0 0 10 10")
                .attr("refX", 0)
                .attr("refY", 5)
                .attr("markerWidth", 8)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M 0 0 L 10 5 L 0 10 z");
            ;
            svg.append("g")
                .append("line")
                .attr({
                    id: "connector",
                    "stroke-width": 1,
                    "stroke": "#cccccc",
                    "marker-end": "url(#arrowhead)",
                    display: "none"
                });
            svg.append("g")
                .attr({
                    fill: "white"
                })
                .append("text")
                .attr({
                    id: "tooltip",
                    fill:"#999",
                    "text-anchor": "middle"
            });
            
            var dataBase = [{
                "category": [{
                    timestamp: 2006,
                    data: 6,
                    ip: "1.0.0.1"
                }, {
                    timestamp: 2007,
                    data: 10,
                    ip: "1.0.0.2"
                }, {
                    timestamp: 2008,
                    data: 11,
                    ip: "1.0.0.3"
                }, {
                    timestamp: 2009,
                    data: 23,
                    ip: "1.0.0.2"
                }, {
                    timestamp: 2010,
                    data: 1,
                    ip: "1.0.0.5"
                }, {
                    timestamp: 2010,
                    data: 1,
                    ip: "1.0.0.6"
                }],
                "name": "Web"
            }, {
                "category": [{
                    timestamp: 2008,
                    data: 1,
                    ip: "1.0.0.1"
                }, {
                    timestamp: 2010,
                    data: 3,
                    ip: "1.0.0.2"
                }, {
                    timestamp: 2011,
                    data: 4,
                    ip: "1.0.0.3"
                }, {
                    timestamp: 2012,
                    data: 17,
                    ip: "1.0.0.4"
                }, {
                    timestamp: 2013,
                    data: 10,
                    ip: "1.0.0.5"
                }, {
                    timestamp: 2013,
                    data: 10,
                    ip: "1.0.0.6"
                }],
                "name": "P2P"
            }, ];

            function flattern(data) {
                for (var i = 0; i < data.length; i++) {
                    var category = data[i].category;
                    var years = {};
                    for (var j = 0; j < category.length; j++) {
                        var elem = category[j];
                        if (years[elem.timestamp] === undefined) {
                            years[elem.timestamp] = 1;
                            elem.timestampOffset = 0;
                        } else {
                            elem.timestampOffset = years[elem.timestamp];
                            years[elem.timestamp]++;
                        }
                    }
                    data[i].yearCount = years;
                }
            }

            flattern(dataBase);
           var x = d3.scale.linear()
                .range([0, width]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("top");


            var formatYears = d3.format("0000");
            xAxis.tickFormat(formatYears);
        
            x.domain([start_year, end_year]);
        
            var xScale = d3.scale.linear()
                .domain([start_year, end_year])
                .range([0, width]);

            var rScale = d3.scale.linear()
                .domain([0, 10])
                .range([2, 9]);

            var chart = svg.append("g")
                .attr("id", "chart-svg");
            chart._svgGroup = {};
        
            chart._svgGroup.oX = chart.append("g");
            chart._svgGroup.oX
                .append("path")
                .attr("d", "M0,0h" + (outerWidth - 100) )
                .attr("marker-end", "url(#arrowhead)")
            ;
            chart._svgGroup.oX
                .attr("class", "x axis")
                .attr("transform", "translate(0," + 10 + ")")
                .call(xAxis)
            ;
            chart._svgGroup.circles = chart.append("g")
                .attr({
                    id: "circle-group"
                });
            chart._svgGroup.rects = chart.append("g")
                .attr({
                    id: "hot-group",
                    fill: "white"
                });
            chart._svgGroup.category = chart.append("g")
                .attr({
                    id: "cat-group",
                    fill: "white"
                });
            function draw() {
                var vspace = 50;

                for (var j = 0; j < dataBase.length; j++) {
                    var name = dataBase[j].name;

                    chart._svgGroup.circles.selectAll("circle")
                        .data(dataBase[j].category, function (d) {
                            return d.ip + d.timestamp;
                        })
                        .enter()
                        .append("circle")
                        .attr("cx", function (d) {
                            return xScale(d.timestamp) + d.timestampOffset * 5 * 2.2; // 5 is radius
                        })
                        .attr("cy", (j + 1) * vspace)
                        .attr("r", 5)
                        .attr("ip", function (d) {
                            return d.ip;
                        })
                        .attr("ts", function (d) {
                            return d.timestamp;
                        })
                        .style("fill", function (d) {
                            return color(d.ip);
                        })
                        .attr("category", name)
                        //.style("display", "none")
                        .on("mouseover", showHistoric)
                        .on("mouseout", hideHistoric);

                    //category name
                    chart._svgGroup.category.selectAll("text")
                        .data([name], function (d) {
                            return d;
                        })
                        .enter()
                        .append("text")
                        .attr("y", (j + 1) * vspace + 5)
                        .attr("x", outerWidth - 50)
                        .attr("text-anchor", "end")
                        .attr("id", function (d) {
                            return d;
                        })
                        .text(function (d) {
                            return d;
                        })
                        .style("fill", "grey")
                        .on("mouseover", mouseover)
                        .on("mouseout", mouseout);

                    var cur_data = dataBase[j]['category'].filter(function (d) {
                        return d.timestamp >= end_year;
                    });

                    var rects = chart._svgGroup.rects.selectAll("rect")
                        .data(cur_data, function (d) {
                            return d.ip ;
                        });
                    
                    rects
                        .enter()
                        .append("rect")
                        .attr("x", function (d, i) {
                            return width - 10 +  d.timestampOffset *1.2* 30;
                        })
                        .attr("y", (j + 1) * vspace - 9)
                        .attr("ip", function (d) {
                            return d.ip;
                        })
                        .attr("ts", function (d) {
                            return d.timestamp;
                        })
                        .attr("category", name)
                        .attr("width", 30)
                        .attr("height", 18)
                        .style("fill", function (d) {
                            return color(d.ip);
                        })
                        .on("mouseover", showHistoric)
                        .on("mouseout", hideHistoric);
                    
                    var labels = chart._svgGroup.rects.selectAll("text")
                        .data(cur_data, function (d) {
                            return d.ip;
                        })
                    ;
                    
                    labels
                        .enter()
                        .append("text")
                        .attr("y", (j + 1) * vspace - 12)
                        .attr("x", function (d, i) {
                            return width - 10 +  d.timestampOffset *1.2* 30 + 15;
                        })
                        .attr("ip", function (d) {
                            return d.ip;
                        })
                        .attr("ts", function (d) {
                            return d.timestamp;
                        })
                        .attr("text-anchor", "middle")
                        .attr("class", "value")
                        .text(function (d) {
                            return getLastIpElement(d.ip);
                        })
                        .style("fill", "grey")
                    ;
                    
                    rects.exit()
                        .transition()
                        .attr("y", 0)
                        .each("end", function(){ $(this).remove(); })
                    ;
                    /*
                    labels.exit()
                        .transition()
                        .attr("y", 0)
                        .each("end", function(){ $(this).remove(); })
                    ;
                    */
                }
            }
            draw();
            function move( ts ) {
                var duration = 500;
                
                /*var target = chart.selectAll( "circle" );
                target.transition().duration( duration ).attr("cx", function( d ){
                    return xScale( d.timestamp + d.timestampOffset - ts );
                });
                */
                //update aXis
                start_year += ts;
                end_year   += ts;
                
                x.domain([start_year, end_year]);
                chart.selectAll("g.x.axis").transition( duration ).call( xAxis );
            }

            function removeRect( ip ){
                chart._svgGroup.rects.selectAll('*[ip="'+ ip +'"]')
                    .transition()
                    .duration(1000)
                    .attr("height", 5)
                    .each("end", function(){
                        $(this).remove();
                })
            }
            function moveRect( ip ){
                chart._svgGroup.rects.selectAll('*[ip="'+ ip +'"]')
                    .transition()
                    .duration(1000)
                    .attr("x", function(d){
                        return width - 10 +  d.timestampOffset *1.2* 30;
                    })
                ;
            }
        
            function addIp(timestamp, ip, category, data) {
                var obj = {
                    timestamp: timestamp,
                    ip: ip,
                    data: data,
                    timestampOffset: 0
                };

                for (var i = 0; i < dataBase.length; i++) {
                    var cat = dataBase[i];
                    if (cat.name == category) {
                        if (cat.yearCount[timestamp] === undefined) {
                            cat.yearCount[timestamp] = 1;
                        } else {
                            obj.timestampOffset += cat.yearCount[timestamp];
                            cat.yearCount[timestamp] ++;
                        }
                        cat.category.push(obj);
                        
                        //find this ip in the other category
                        return;
                    }
                }
                //not found category
                var new_cat = {
                    category: [obj],
                    name: category,
                    yearCount: {}
                };
                new_cat.yearCount[ timestamp ] = 1;
                dataBase.push( new_cat );
            }

            setTimeout(function () {
                addIp(2013, "1.0.0.6", "Mail", 25);
                addIp(2014, "1.0.0.2", "Mail", 15);
                //dataBase[0].category[5].timestamp += 3;
                //move(1);
                draw();
            }, 2000);

            //setTimeout(move, 1000, 1);
            //setTimeout(move, 2000, 2);
        
            function mouseover(p) {
                var g = d3.select(this).node();
                if (!g) return;
                var cat = g.attributes["id"].value;
                d3.selectAll('circle[category="' + cat + '"]').transition().attr("r", function (d) {
                    return rScale(d.data)
                });
                //d3.select(g).selectAll("rect").style("display", "none");
            }

            function mouseout(p) {
                var g = d3.select(this).node();
                if (!g) return;
                var cat = g.attributes["id"].value;
                d3.selectAll('circle[category="' + cat + '"]').transition().attr("r", 5);
                //d3.select(g).selectAll("rect").style("display", "block");
            }

            function showHistoric(p) {
                var ip = $(this).attr("ip");
                var x  = $(this).attr("cx");
                var y  = $(this).attr("cy");
                
                if( x !== undefined && y !== undefined )
                    //show tooltip
                    $("#tooltip").attr({
                        display: "block",
                        x: x,
                        y: y - 12
                    }).text( ip );

                var arr = $('circle[ip="' + ip + '"]');
                //arr.addClass("animate");
                if (arr.length <= 0)
                    return;

                arr.sort(function (a, b) {
                    return parseInt($(a).attr("ts")) - parseInt($(b).attr("ts"));
                });

                animate.stop().animate(arr);
            };

            function hideHistoric() {
                animate.stop();
                $("#tooltip").attr({
                        display: "none",
                    });
            }
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