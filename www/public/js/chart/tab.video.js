var arr = [
    {
        id: "bitrate",
        title: "",
        x: 0,
        y: 0,
        width: 12,
        height: 11,
        type: "success",
        userData: {
            fn: "createQoSReport"
        },
    }
];

var availableReports = {
    //"createNodeReport"    : "Nodes",
}



function inDetailMode() {
    return (fPeriod.selectedOption().id === MMTDrop.constants.period.MINUTE);
}

//create reports

var ReportFactory = {
   
    formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
    

    createQoSReport: function (fProbe) {
       
        var _this = this;
        var COL = MMTDrop.constants.OTTQoSColumn;        
        var database = new MMTDrop.Database({format : 70, userData : { getProbeStatus: true } });

        var createLineChart = function( columns, height, label, get_avg, opt ){
            //default chart options
            if( height  == undefined ) height  = 200;
            if( label   == undefined ) label   = "Bitrate (bps)";
            if( get_avg == undefined ) get_avg = false;
            var chart_opt = {
                    data:{
                        type: "spline"//step
                    },
                    color: {
                        pattern: ['orange', 'green']
                    },
                    grid: {
                        x: {
                            show: false
                        },
                        y: {
                            show: true
                        }
                    },
                    axis: {
                        x: {
                            tick: {
                                format: _this.formatTime,
                            }
                        },
                        y: {
                            padding:{
                                bottom: 0
                            }
                        }
                    },
                    zoom: {
                        enabled: false,
                        rescale: false
                    },
                    tooltip:{
                        format: {
                            title:  function( x ) {
                                //only fire for the active chart
                                if( _this.activeChart == chart )
                                    _this.showAllTooltip( x );
                                
                                return _this.formatTime( x );
                            }
                        }
                    },
                    line:{
                        connectNull: true
                    },
                    padding:{
                        top: 20
                    },
                    onmouseover: function(){
                        _this.activeChart = chart;
                    },
                    onmouseout: function(){
                        _this.hideAllTooltip();
                    }
                };
            //override default options by the one given by user
            if( opt )
                chart_opt = MMTDrop.tools.mergeObjects( chart_opt, opt );
            
            //create line chart
            var chart = MMTDrop.chartFactory.createTimeline({
                getData: {
                    getDataFn: function (db) {
                        var period = fPeriod.getDistanceBetweenToSamples();
                        var cols = columns.slice( 0 );
                        var obj  = {};
                        var data = db.data();
                        
                        for (var i in data) {
                            var msg   = data[i];

                            var time  = msg[COL.TIMESTAMP.id];
                            var exist = true;

                            //data for this timestamp does not exist before
                            if (obj[time] == undefined) {
                                exist     = false;
                                obj[time] = {};
                                obj[time][COL.TIMESTAMP.id] = time;
                            }


                            for (var j in cols) {
                                var id = cols[j].id;

                                if( msg[id] == undefined )
                                    msg[id] = 0;
                                //percentage of probability of buffering
                                else if( id == COL.PROBABILITY_BUFFERING.id )//
                                    msg[id] *= 100;

                                if (exist){
                                    obj[time][id].val   += msg[id];
                                    obj[time][id].count += 1;
                                }else
                                    obj[time][id]  = { val: msg[id], count: 1 };
                            }
                        }

                        //get the average
                        for( var time in obj ){
                            var o = obj[ time ];
                            for( var id in o)
                                if( o[id].count != undefined ){
                                    if( get_avg )
                                        o[ id ] = o[id].val / o[id].count;
                                    else
                                        o[ id ] = o[id].val;
                                }
                        }
                        
                        //add timestamp as the first column
                        cols.unshift(COL.TIMESTAMP);

                        return {
                            data    : obj,
                            columns : cols,
                            ylabel  : label,
                            height  : height,
                        };
                    }
                },
                chart: chart_opt
            });
            return chart;
        }

        var cLine    = createLineChart( [ COL.NETWORK_BITRATE, COL.VIDEO_BITRATE ] );
        var cQuality = createLineChart( [ COL.VIDEO_QUALITY], 200, "Quality", true, {
            data:  { type: "area-spline"},
            color: { pattern: ["#33CCCC"] },
            line:  { connectNull: true },
            axis:  { y: {max: 5, min: 0, padding: {top: 0} } }
        } );
        var cBuffer  = createLineChart( [ COL.PROBABILITY_BUFFERING], 200, "(%)", true, {
            data:  { type: "area-spline"},
            color: { pattern: ["#CC99CC"] },
            axis:  { y: {max: 100, min: 0, padding: {top: 0} } }
        } );
        var cError   = createLineChart( [ COL.RETRANSMISSION_COUNT, COL.OUT_OF_ORDER ], 200, "(packets)", false, {
            color: { pattern: ["violet","red"] },
            axis : {y : { tick: { format: function( v ){ 
                if (v<1000) return Math.round( v ); 
                return MMTDrop.tools.formatDataVolume( v );
            }}}}
        });
        
        var chart_groups = [ cLine, cQuality, cBuffer, cError ];
        _this.showAllTooltip = function( x ){
            for( var i in chart_groups ){
                var c = chart_groups[i];
                if( c != _this.activeChart ){
                    try{
                        c.chart.tooltip.show( {x: x} );
                    }catch( err ){ console.error( err );}
                }
            }
        };
        
        _this.hideAllTooltip = function(){
            for( var i in chart_groups ){
                var c = chart_groups[i];
                c.chart.tooltip.hide();
            }
        }
        
        var dataFlow = [{ object: cLine }, { object: cQuality }, {object: cBuffer}, {object: cError}];

        var report = new MMTDrop.Report(
            // title
            null,

            // database
            database,

            // filers
			[],

            // charts
					[
                {
                    charts: [cLine],
                    width: 12
                },{
                    charts: [cQuality],
                    width: 12
                },{
                    charts: [cBuffer],
                    width: 12
                },{
                    charts: [cError],
                    width: 12
                },
					 ],

            //order of data flux
            dataFlow
        );
        return report;
    },
}
