var arr = [
    {
        id : "cpu_mem",
        title : "CPU and Memory Usage",
        x : 0,
        y : 4,
        width : 12,
        height : 5,
        type : "success",
        userData : {
            fn : "createCPUMemReport"
        },
    }
    ];

var availableReports = {
        "createCPUMemReport" : "CPU_Memory ",
        "createDropPercentageReport" : "Drop_Percentage"
}

const STAT = MMTDrop.constants.StatColumn;
var ReportFactory = {

        formatTime : function( date ){
            return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
        },
        createCPUMemReport : function(){
            var _this = this;
            var fMetric = MMTDrop.filterFactory.createProbeFilter();
            var $match = {};

            var group = {
                    _id : {}
            };
            //id
            [
                STAT.TIMESTAMP.id, STAT.PROBE_ID.id
                ].forEach( function( el, index ){
                    group["_id"][el] = "$" + el;
                } );

            [
                STAT.CPU_USER, STAT.CPU_SYS, STAT.CPU_IDLE, 
                STAT.MEM_AVAIL, STAT.MEM_TOTAL, STAT.COUNT
                ].forEach( function( el ){
                    group[el.id] = {
                            "$sum" : "$" + el.id
                    };
                } );
            [
                COL.TIMESTAMP.id, STAT.PROBE_ID.id
                ].forEach( function( el, index ){
                    group[el] = {
                            "$last" : "$" + el
                    };
                } );

            var database = new MMTDrop.Database( {
                collection : "data_stat",
                action : "aggregate",
                query : [
                    {
                        "$match" : $match
                    }, {
                        "$group" : group
                    }
                    ]
            } );

            var cLine = MMTDrop.chartFactory
            .createTimeline( {
                getData : {
                    getDataFn : function( db ){
                        var ylabel = "Percentage (%)";

                        var cols = [
                            {id: "ts" },
                            {id: "cpu", label: "CPU"},
                            {id: "mem", label: "Memory"}
                            ];

                        var period = fPeriod.getDistanceBetweenToSamples();

                        var obj = {};
                        var data = db.data();
                        for( var i in data ){
                            let msg = data[i];
                            let ts  = msg[ STAT.TIMESTAMP.id ];
                            let count = msg[ STAT.COUNT.id ];
                            let cpu = (msg[ STAT.CPU_USER.id ] + msg[ STAT.CPU_SYS.id ]) / count;
                            //let mem = (msg[ STAT.MEM_TOTAL.id ] - msg[ STAT.MEM_AVAIL.id ]) / count;
                            let mem = (( msg[ STAT.MEM_TOTAL.id ] - msg[ STAT.MEM_AVAIL.id ] ) * 100 /msg[ STAT.MEM_TOTAL.id ]);
                            
                            obj[ ts ] = { ts: ts, cpu: cpu, mem: mem };
                        }


                        var $widget = $( "#" + cLine.elemID )
                        .getWidgetParent();
                        var height = $widget.find(
                        ".grid-stack-item-content" ).innerHeight();
                        height -= $widget.find( ".filter-bar" )
                        .outerHeight( true ) + 15;

                        //console.log( obj );

                        return {
                            data : obj,
                            columns : cols,
                            ylabel : ylabel,
                            height : height,

                            addZeroPoints : {
                                time_id : 3,
                                time : status_db.time,
                                sample_period : 1000 * fPeriod
                                .getDistanceBetweenToSamples(),
                                probeStatus : status_db.probeStatus
                            },
                        };
                    }
                },

                chart : {
                    data : {
                        type : "step",// step
                        /*
                        axes:{
                            "Memory": "y2"
                        },
                        */
                    },
                    color : {
                        pattern : [
                            'orange', 'green'
                            ]
                    },
                    grid : {
                        x : {
                            show : false
                        },
                        y : {
                            show : true
                        }
                    },
                    axis : {
                        x : {
                            tick : {
                                format : _this.formatTime,
                            }
                        },
                        /*
                        y2: {
                            show : true,
                            label: {
                                text: "Memory (B)",
                                position: "outer"
                            },
                            tick: {
                                count: 5,
                                format: function( v ){
                                    if( v < 0 ) return 0;
                                    return MMTDrop.tools.formatDataVolume( v*1000 );
                                }
                            },
                            min: 0,
                            padding: {
                              top: 10,
                              bottom: 2
                            },
                        }
                        */
                    },
                    zoom : {
                        enabled : false,
                        rescale : false
                    },
                    tooltip : {
                        format : {
                            title : _this.formatTime
                        }
                    },
                    padding: {
                        top: 20,
                    },
                },

                afterRender : function( chart ){
                    // register resize handle
                    var $widget = $("#" + chart.elemID).getWidgetParent();
                    $widget.on("widget-resized", function (event, $widget) {
                        var height = $widget.find(".grid-stack-item-content").innerHeight();
                        height -= $widget.find(".filter-bar").outerHeight(true) + 15;
                        chart.chart.resize({
                            height: height
                        });
                    });
                }
            } );

            var report = new MMTDrop.Report(
                    // title
                    null,

                    // database
                    database,

                    // filers
                    [
                        fMetric
                        ],
                        // [],
                        // charts
                        [
                            {
                                charts : [
                                    cLine
                                    ],
                                    width : 12
                            },
                            ],

                            // order of data flux
                            [
                                {
                                    object : fMetric,
                                    effect : [
                                        {
                                            object : cLine
                                        }
                                        ]
                                }
                                ]
            );
            return report;
        },

        createDropPercentageReport : function(){
            var _this = this;
            var fMetric = MMTDrop.filterFactory.createProbeFilter();
            // var $match = {};
            var $match = {
                    isGen : false
            };
            // $match.isGen = false;
            // $match[COL.FORMAT_ID.id ] = MMTDrop.constants.CsvFormat.STATS_FORMAT;

            var group = {
                    _id : {}
            };
            [
                COL.TIMESTAMP.id, COL.FORMAT_ID.id
                ].forEach( function( el, index ){
                    group["_id"][el] = "$" + el;
                } );
            [
                COL.P_DROP.id, COL.P_DROP_NIC.id, COL.P_DROP_KERNEL.id
                ].forEach( function( el, index ){
                    group[el] = {
                            "$avg" : "$" + el
                    };
                } );
            [
                COL.TIMESTAMP.id, COL.FORMAT_ID.id
                ].forEach( function( el, index ){
                    group[el] = {
                            "$last" : "$" + el
                    };
                } );

            var database = new MMTDrop.Database( {
                collection : "data_session",
                action : "aggregate",
                query : [
                    {
                        "$match" : $match
                    }, {
                        "$group" : group
                    }
                    ]
            } );

            var cLine = MMTDrop.chartFactory
            .createTimeline( {
                getData : {
                    getDataFn : function( db ){
                        var col = fMetric.selectedOption();
                        var ylabel = "Drop (%)";

                        var cols = [
                            COL.P_DROP, COL.P_DROP_NIC,
                            COL.P_DROP_KERNEL
                            ];

                        var period = fPeriod.getDistanceBetweenToSamples();

                        var obj = {};
                        var data = db.data();
                        console.log( "data[0]:" + data[0] );// TODEL

                        for( var i in data ){
                            var msg = data[i];
                            // var proto = msg[COL.APP_ID.id];

                            var time = msg[COL.TIMESTAMP.id];
                            var exist = true;

                            // data for this timestamp does not exist before
                            if( obj[time] == undefined ){
                                exist = false;
                                obj[time] = {};
                                obj[time][COL.TIMESTAMP.id] = time;
                            }

                            for( var j in cols ){
                                var id = cols[j].id;
                                if( msg[id] == undefined )
                                    msg[id] = 0;
                                if( msg[id] > 100 ) // incorrect report
                                    obj[time][id] = 100;
                                else
                                    obj[time][id] = msg[id];
                                // console.log("msg:"+msg[COL.P_DROP.id]);//TODEL
                            }
                        }

                        cols.unshift( COL.TIMESTAMP );

                        var $widget = $( "#" + cLine.elemID )
                        .getWidgetParent();
                        var height = $widget.find(
                        ".grid-stack-item-content" ).innerHeight();
                        height -= $widget.find( ".filter-bar" )
                        .outerHeight( true ) + 15;

                        return {
                            data : obj,
                            columns : cols,
                            ylabel : ylabel,
                            height : height,
                            addZeroPoints : {
                                time_id : 3,
                                time : status_db.time,
                                sample_period : 1000 * fPeriod
                                .getDistanceBetweenToSamples(),
                                probeStatus : status_db.probeStatus
                            },
                        };
                    }
                },

                chart : {
                    data : {
                        type : "line"//step
                    },
                    color : {
                        pattern : [
                            'orange', 'green', 'gray'
                            ]
                    },
                    grid : {
                        x : {
                            show : false
                        },
                        y : {
                            show : true
                        }
                    },
                    axis : {
                        x : {
                            tick : {
                                format : _this.formatTime,
                            }
                        },
                    },
                    zoom : {
                        enabled : false,
                        rescale : false
                    },
                    tooltip : {
                        format : {
                            title : _this.formatTime
                        }
                    },
                },

                afterRender : function( chart ){
                    //register resize handle
                    var $widget = $( "#" + chart.elemID ).getWidgetParent();
                    $widget.on( "widget-resized",
                            function( event, $widget ){
                        var height = $widget.find(
                        ".grid-stack-item-content" )
                        .innerHeight();
                        height -= $widget.find( ".filter-bar" )
                        .outerHeight( true ) + 15;
                        chart.chart.resize( {
                            height : height
                        } );
                    } );
                }
            } );

            var dataFlow = [
                {
                    object : fMetric,
                    effect : [
                        {
                            object : cLine
                        }
                        ]
                }
                ];

            var report = new MMTDrop.Report(
                    // title
                    null,

                    // database
                    database,

                    // filers
                    [
                        fMetric
                        ],
                        //	            		[],
                        // charts
                        [
                            {
                                charts : [
                                    cLine
                                    ],
                                    width : 12
                            },
                            ],

                            //order of data flux
                            dataFlow
                            //						 []
            );
            return report;
        },
}