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


ReportFactory = {
    createNodeReport : function(fProbe, database){
        var COL = MMTDrop.constants.StatsColumn;
			
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
			var chartOption = {
					getData: {
						getDataFn: function( db, cols ){
							cols = cols || fMetric.selectedOption();
								return db.stat.getDataTableForChart( cols, false);
						}
					}
				};
        
			var cTable = MMTDrop.chartFactory.createTable({
				getData: {
					getDataFn: function( db ){
						var cols = [{id: COL.PACKET_COUNT.id,   label: "Packets"},
				                    {id: COL.DATA_VOLUME.id,    label: "Data"},
				                    {id: COL.PAYLOAD_VOLUME.id, label: "Payload"},
				                    {id: COL.ACTIVE_FLOWS.id,   label: "Flows"}];
						return chartOption.getData.getDataFn( db, cols );
					}
				}
			});
			
			var dataFlow = [ {
							object : fProbe,
							effect : [ {
									object : fMetric,
									effect : [{object: cTable}]
								}]
					} ];

			var report = new MMTDrop.Report(
					// title
					null,

					// database
					database,

					// filers
					[fMetric],

					// charts
					[
					 {charts: [cTable], width: 12},
					 ],

					 //order of data flux
					 dataFlow
			);
			return report;
    },
    createProtocolReport : function(fProbe, database){
        var COL = MMTDrop.constants.StatsColumn;
			
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
			
			var cLine = MMTDrop.chartFactory.createTimeline({
				getData: {
					getDataFn: function( db ){
						var col = fMetric.selectedOption();
						return db.stat.getDataTimeForChart( col, false, false );
					}
				}
			});
			
			var dataFlow = [ {
							object : fProbe,
							effect : [ {
									object : fMetric,
									effect : [{object: cLine}]
								}]
					} ];

			var report = new MMTDrop.Report(
					// title
					"Application Report",

					// database
					database,

					// filers
					[fMetric],

					// charts
					[
					 {charts: [cLine], width: 12},
					 ],

					 //order of data flux
					 dataFlow
			);
			return report;
		},
    
    createTrafficReport : function( fProbe, database ){
            var COL = MMTDrop.constants.StatsColumn;
			
            var fDir     = MMTDrop.filterFactory.createDirectionFilter();
			var fMetric	 = MMTDrop.filterFactory.createMetricFilter();
			
			var cLine = MMTDrop.chartFactory.createTimeline({
				getData: {
					getDataFn: function( db ){
						var col = fMetric.selectedOption();
						var obj = db.stat.getDataTimeForChart( col, false, false );
                        obj.columns[0].type = "area";
                        
                        return obj;
					}
				}
			});
			
			var dataFlow = [{
                    object: fDir,
                    effect: [ {
							object : fProbe,
							effect : [ {
									object : fMetric,
									effect : [{object: cLine}]
								}]
					} ]}];

			var report = new MMTDrop.Report(
					// title
					"Application Report",

					// database
					database,

					// filers
					[fDir, fMetric],

					// charts
					[
					 {charts: [cLine], width: 12},
					 ],

					 //order of data flux
					 dataFlow
			);
			return report;
    }
}