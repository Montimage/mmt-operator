var Report = {};

/**
 * config:
 *  - elem:        DOM selector to render report
 * 	- channel:     where the report listens data to update its visualation
 *  - title:       title of report
 *  - chartType:   ['timeline', 'pie', 'bar', 'tree', 'table']
 *  - filterTypes: ['class', 'app', 'datatype']
 *  - metric: an array of elements ['stat', 'flow']
 *  		  or a column index, eg, MMTDrop.constants.StatsColumn.DATA_VOLUME
 *  	
 */
Report.render = function( config, database, fProbe ){
	if( EVENTS == undefined )
		throw new Error("Neet EVENTS publish/subscribe");
	
	
	var fMetric = MMTDrop.filterFactory.createMetricFilter();
    
    var cLine   = MMTDrop.chartFactory.createTimeline({
        getData: {
            getDataFn : function( db ){
                var col = fMetric.selectedOption();
                return db.stat.getDataTimeForChart(col, false, fProbe.selectedOption().id != 0);
            }
        }});
        
	var report = new MMTDrop.Report(
	            //title
	            null,
	
	            //database
	            database,
	
	            //filers
	            [fProbe,fMetric],
	
	            //charts
	            [{charts: [cLine]}],
	
	             //order of data flux
	             [{object: fProbe, 
	                       effect:[ {object: fMetric, effect: [{object: cLine, effect:[]} ]}]}]
	               
	    );
   report.renderTo( config.elem )
};