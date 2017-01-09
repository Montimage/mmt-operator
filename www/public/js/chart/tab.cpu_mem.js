 var arr = [
    {
        id: "cpu_mem",
        title: "CPU and Memory usage (in MMT-Probe)",
        x: 0,
        y: 4,
        width: 12,
        height: 5,
        type: "success",
        userData: {
            fn: "createCPUMemReport"
        },
    },
    {
        id: "p_drop",
        title: "Drop percentage",
        x: 0,
        y: 0,
        width: 12,
        height: 5,
        type: "info",
        userData: {
            fn: "createDropPercentageReport"
        },
    }
];

var availableReports = {
    "createCPUMemReport": "CPU_Memory ",
    "createDropPercentageReport" : "Drop_Percentage"
}

var ReportFactory = {
		createCPUMemReport: function(){
		    var param = {
		        getData : {
		            getDataFn: function( db ){
		                return {data: db.data(), column: [{id:COL.CPU_USAGE, label: "CPU usage"}]}
		            }
		        }
		    };

		    var chart = new MMTDrop.Chart( param, 
		            function( elemID, option, data){
		                $('#' + elemID).html(JSON.stringify(data));
		            }
		    );

		    chart.getIcon = function(){
		        return $('<i>', {'class': 'glyphicons-bar'});
		    };

		    return chart;
		}
	}