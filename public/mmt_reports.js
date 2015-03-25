/**
 * mmt_reports.js
 * created 19 Mar 2015 by HuuNghia (huunghia.nguyen@montimage.com)
 * 
 * This file defines a list of reports will be display into the page index.html.
 * Each report is defined by one item of repportsList.
 * One item consists of:
 *   - an unique ID
 *   - a label to display
 *   - a function drawFct to load the report.
 *   
 * When a new item is add to @{repportsList}, it will be add automatically into the page 
 *   and shown its label. 
 *   When user clicks on its label, the function drawFct will be called.
 */

/**
 * List of reports
 * Each report item has an id, a label to display, and a function to load report
 */
var repportsList = {
		dash : {
			label   : "Dash",
			drawFct : initDashReport
		},
		hierarchy : {
			label   : "Hierarchy",
			drawFct : initHierarchyReport
		},
		categories : {
			label   : "Cateogries",
			drawFct : initCategoryReport
		},
		apps : {
			label   : "Applications",
			drawFct : initAppReport
		},
		flow_cloud : {
			label   : "Flow cloud",
			drawFct : initFlowReport
		},
		flow_avg : {
			label   : "Flow avg",
			drawFct : initFlowAVGReport
		},
		flow_density : {
			label   : "Flow density",
			drawFct : initFlowDensityReport
		}
	};

function showLoadingMessage(elemID, msg){
	msg = msg || "Loading ....";
	$('#' + elemID).html('<div id="loading-item">'+ msg +'</div>');
}

function hideLoadingMessage(){
	$('#loading-item').remove();
}

/**
 * Show header items
 * 
 * @param elemID
 */
function printHeader(elemID) {
	var str = "";
	for ( var t in this.repportsList) {
		str += '<li id="' + t + '"><a href="#' + t + '">'
				+ this.repportsList[t].label + '</a></li>';
	}
	$('#' + elemID).html(str);
}

/**
 * Show the current report depending on header item clicked
 * 
 * @param elemID:
 *            id of a HTML element in which we display a chart
 */
function displayReport(elemID) {
	// listen window url change
	$(window).bind('hashchange', function() {
		var key = window.location.hash; //#dash
		key = key.substring(1); 		//remove hash symbol
		var chart = repportsList[key];
		
		if (chart == undefined)
			return;						//report has not yet defined
		
		//clear elemID, and display info div
		showLoadingMessage(elemID);
		
		//draw the corresponding report on elemID
		chart.drawFct(elemID);

		//remove info div
		hideLoadingMessage();
		
		//remove old itembar
		$(".repport-item-bar").removeClass();
		// set active its itembar
		$('#' + key).addClass("active repport-item-bar");
	});
	
	//trigger for the first time: eg, when user enter url: http//blabla.com#app
	if (window.location.hash)
		$(window).trigger('hashchange');
}


////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Get data from MMT-Operator
 * @param param = { format: {99, 0, 1, 2, 3},			//default:  99     <br/>
   			probe : number								//			any    <br/>
   			source: text								//			any    <br/>
   			period: {minute, hour, day, week, month}	//			minute <br/>
   			raw	  : {true, false}						//			true   <br/>
 * @param callbackErr(xhr, status, error): callback when error happen
 * @param callbackSuccess(data)			 : callback when getting data successfully
 */
function getData(param, callbackErr, callbackSuccess){
	var url = "http://192.168.56.101:8088/traffic/data" 
	$.ajax({
		url		: url,
		type	: "get",
		dataType: "json",
		data	: param,
		cache	: false,
		
		error 	: callbackErr, //(xhr, status, error),
		success	: callbackSuccess, // (data)
	});
}

var PERIOD = {
	MINUTE 	: "minute",
	HOUR	: "hour",
	DAY		: "day",
	WEEK	: "week",
	MONTH	: "month",
	
	/**
	 * This is to compatible with mmt_drop.
	 * mmt_drop uses a dropbox Period {1 Hour, 1 Day, 1 Week, 1 Month}
	 */
	getPeriod : function( txt ){
		var p = PERIOD.MINUTE;
		if (txt === '1 Hour')
			p = PERIOD.HOUR;
		else if (txt === '1 Day')
			p = PERIOD.DAY;
		else if (txt === '1 Week')
			p = PERIOD.WEEK;
		else if (txt === '1 Month')
			p = PERIOD.MONTH;
		return p;
	}
		
};


/*///////////////////////////////////////////////////////////////////////////////////////////
One function for each report
///////////////////////////////////////////////////////////////////////////////////////////*/
function initDashReport(elem){
	var param = {period: PERIOD.MINUTE};
	
	//show report of the last 10 minute data
	getData(param,
			function (xhr, status, error){
			},
			function (data){
	            var gstats = new MMTDrop.GlobalStats();
	            gstats.meta = {numberOfEntries: data.length};
	            for (i in data) {
	                if (data[i][MMTDrop.StatsColumnId.FORMAT_ID] == MMTDrop.CsvFormat.STATS_FORMAT) {
	                    gstats.processEntry(data[i]);
	                }
	            }	

	            var report = new MMTDrop.Reports({
                    'stats': gstats,
                    'elemid': elem,
                    'title': "Real-time Traffic",
                    'elements': [
                        {'chart': [{'type':'timeline',
                            'options': {
                                'getDataFct': MMTDrop.DataFactory.createDashTimeLineChart,
                                'seriesName': "Packet Count",
                            }}
                        ],
                        'pos': [0, 12]},
                    ],
                    //'filter': [{'type': 'metric', 'select': function(e){}}]
                });
	            chartsElemMap["tview"] = [{"chart": report}];
	            
	            report.render();
			});
	
	//append real-time data to the report==============================================
	var socket = new io.connect("http://192.168.56.101:8088/");
    var newDataPoints = [];
    //var metric = $('#treport_ftr_metric').val();
    var metric = "Data Volume";
    socket.on('connect', function() {
        console.log("Connected");
    });
    var ready = false;
    
    socket.on('stats', function(message){
        if( ! message ) return;
        var series = $('#'+ elem +'_elem0_chart').highcharts().series;

        //If this is the root app then initialize new datapoints
        if(message.app == message.path && ready) {
          console.log('new period');
          //newDataPoints = [];
          
          for( s in series ) {
              if( newDataPoints[s] ) {
                series[s].addPoint(newDataPoints[s], true, true);
              }else {
                series[s].addPoint([message.time, 0], true, true);
              }
              newDataPoints[s] = [message.time, 0];
          }
        }else ready = true;
        
        for( s in series ) {
          if( (series[s].name).toUpperCase() === (MMTDrop.ProtocolsIDName[message.app]).toUpperCase() ) {
            if( metric === "Data Volume" ) newDataPoints[s] = [message.time, message.bytecount];
            else if( metric === "Packet Count" ) newDataPoints[s] = [message.time, message.packetcount];
            if( metric === "Payload Volume" ) newDataPoints[s] = [message.time, message.payloadcount];
            if( metric === "Active Flows" ) newDataPoints[s] = [message.time, message.ative_flowcount];
          }
        }
    }) ;
    socket.on('disconnect', function() {
        console.log('disconnected');
    });
}

function initHierarchyReport(elem){
	var param = {period: PERIOD.HOUR};
	getData(param,
			function (xhr, status, error){
			},
			function (data){
	            var gstats = new MMTDrop.GlobalStats();
	            gstats.meta = {numberOfEntries: data.length};
	            for (i in data) {
	                if (data[i][MMTDrop.StatsColumnId.FORMAT_ID] == MMTDrop.CsvFormat.STATS_FORMAT) {
	                    gstats.processEntry(data[i]);
	                }
	            }	
	            var toverviewReport = MMTDrop.ReportFactory.createTrafficOverviewReport(elem, gstats);
	            chartsElemMap["tview"] = [{"chart": toverviewReport}];
	            toverviewReport.render();
			});
}

function initCategoryReport(elem){
	var param = {period: PERIOD.HOUR, format: 99};
	getData(param,
			//if error
			function (xhr, status, error){},
			//ok
			function (data){
	            var gstats = new MMTDrop.GlobalStats();
	            gstats.meta = {numberOfEntries: data.length};
	            for (i in data) {
	                if (data[i][MMTDrop.StatsColumnId.FORMAT_ID] == MMTDrop.CsvFormat.STATS_FORMAT) {
	                    gstats.processEntry(data[i]);
	                }
	            }	

	            var categoriesReport = MMTDrop.ReportFactory.createAppCategoriesReport(elem, gstats); 

	            chartsElemMap["categories"] = [{"chart": categoriesReport}];
	            
	            categoriesReport.render();
			});
}

function initAppReport(elem, period){
	var param = {period: period || PERIOD.HOUR};
	getData(param,
			function (xhr, status, error){
			},
			function (data){
				var gstats = new MMTDrop.GlobalStats();
				gstats.meta = {
					numberOfEntries : data.length
				};
				for (i in data) {
					if (data[i][MMTDrop.StatsColumnId.FORMAT_ID] == MMTDrop.CsvFormat.STATS_FORMAT) {
						gstats.processEntry(data[i]);
					}
				}

				var appReport = MMTDrop.ReportFactory.createApplicationReport(
							elem, gstats);

				chartsElemMap["appreport"] = [ {
					"chart" : appReport
				} ];

				//show report
				appReport.render();
				
				//show Period
				var p = param.period;

				if (p === PERIOD.HOUR)
					$('#appreport_ftr_period').val('1 Hour');
				else if (p === PERIOD.DAY)
					$('#appreport_ftr_period').val('1 Day');
				else if (p === PERIOD.WEEK)
					$('#appreport_ftr_period').val('1 Week');
				else if (p === PERIOD.MONTH)
					$('#appreport_ftr_period').val('1 Month');
				
				//encapsulate some data in $('#appreport_ftr_period') when redraw() is called
				$('#appreport_ftr_period').data("elem", elem);
			});
}

/**
 * this function is called from mmt_drop 
 *      when $('#appreport_ftr_period') changes its current item index
 * TODO: to restructure this
 */
function redraw(period){
	
	var p = PERIOD.getPeriod (period);
	
	var elem = $('#appreport_ftr_period').data("elem");
	showLoadingMessage(elem);
	
	initAppReport(elem, p);
	
	hideLoadingMessage();
}


function _splitFlowData ( data ){
	//get array of data. Each element of array contains data captured by one probe
	var flows = MMTDrop.tools.object2Array( MMTDrop.splitDataByProbe( data ));
	var gstats = [];
	
	for (var i=0; i<flows.length; i++)
		gstats.push( new MMTDrop.FlowStats( flows[i] ));
	
	//if there exists only data from one probe
	if (gstats.length == 1)
		gstats = gstats[0];
	return gstats;
}

function initFlowReport(elem, period){
	var param = {period: PERIOD.DAY, format: 0, probe : [], source:['eth0'], raw: true};
	
	var db = new MMTDrop.Database("http://192.168.56.101:8088/traffic/data");
	var data = db.get(param);
	data = MMTDrop.Tools.object2Array(data);
	
	var gstats = [];
	for (var i=0; i<data.length; i++)
		gstats.push( new MMTDrop.FlowStats( data[i] ));
	
	//if there exists only data from one probe
	if (gstats.length == 1)
		gstats = gstats[0];
	
	if (gstats.length == 1)
		gstats = gstats[0];
            	
            	var report = new MMTDrop.Reports({
                    'sources': 'zifit',	//???
                    'stats': gstats,
                    'elemid': elem,
                    'title': "Flow Metrics Cloud",
                    'elements': [{
                        'chart': [{
                            'type': 'scatter',
                                'options': {
                                'getDataFct': function (gstats, options) {
                                    var metric = options.flowmetricid;
                                    var retval = gstats.getTimePoints(metric);
                                    
                                    //change serial name to ProbeID
                                    for (var t in gstats.flowitems){
                                    	retval.name = "Probe " + gstats.flowitems[t].probe;
                                    	break;
                                    }
                                    return [retval];
                                },
                                'seriesName': "RTP QoS test",
                            }
                        }],
                        'pos': [0, 12]
                    }],
                    'filter': [{'type': 'period', 'label': 'Period', 'select': function(e){
                    				showLoadingMessage(elem);
                    				initFlowReport(elem, PERIOD.getPeriod(e));
                    				hideLoadingMessage();
                    			}},
                               {'type': 'flowmetric', 'label': 'Metric', 'select': function(e){}}]
                });
            	
            	chartsElemMap["flowview"] = [{
                    "chart": report
                }];

                report.render()	
	
}

function initFlowAVGReport(elem){
	var param = {period: PERIOD.HOUR, format: 0};
	getData(param,
			function (xhr, status, error){
			},
			function (data){
				var gstats = _splitFlowData (data);
				
				var report = new MMTDrop.Reports({
                    'stats': gstats,
                    'elemid': elem,
                    'title': "HTTP Average Metrics",
                    'elements': [{
                        'chart': [{
                            'type': 'timeline',
                                'options': {
                                'getDataFct': function (gstats, options) {
                                    var metric = options.httpmetric;
                                    var retval = gstats.getTimePoints(metric);
                                    return [retval];
                                },
                                'seriesName': "RTP QoS test",
                            }
                        }],
                        'pos': [0, 12]
                    }],
                    'filter': [{'type': 'httpmetric', 'data': MMTDrop.HTTPMetricID2Name, 'label': 'Metric', 'select': function(e){ }}]
                });
				
				chartsElemMap["flowview"] = [{
					"chart": report
	            }];

	            report.render();
			});
}

function initFlowDensityReport(elem){
	var param = {period: PERIOD.DAY, format: 0, probe : [], source:['eth0'], raw: true};
	
	var db = new MMTDrop.Database("http://192.168.56.101:8088/traffic/data");
	var data = db.get(param);
	data = MMTDrop.Tools.object2Array(data);
	
	var gstats = [];
	for (var i=0; i<data.length; i++)
		gstats.push( new MMTDrop.FlowStats( data[i] ));
	
	//if there exists only data from one probe
	if (gstats.length == 1)
		gstats = gstats[0];
	
	if (gstats.length == 1)
		gstats = gstats[0];
	
				//var gstats = _splitFlowData (data);
				
            	//create report
            	var report = new MMTDrop.Reports({
                     'sources': 'zifit', //???
                     'stats': gstats,
                     'elemid': elem,
                     'title': "HTTP Flows Metrics Probability Density Distribution",
                     'elements': [{
                         'chart': [{
                             'type': 'xy',
                                 'options': {
                                 'getDataFct': function(gstats, options){
                                	 var metric = options.flowmetricid;// || MMTDrop.FlowMetricId.DATA_VOLUME;
                                     var retval = gstats.getDistribution(metric);
                                     //change serial name to ProbeID
                                     for (var t in gstats.flowitems){
                                     	retval.name = "Probe " + gstats.flowitems[t].probe;
                                     	break;
                                     }
                                     return [retval];
                                 },
                                 'seriesName': "RTP QoS test",
                             }
                         }],
                         'pos': [0, 12]
                     }],
                     'filter': [{'type': 'flowmetric', 'label': 'Metric', 'select': function(e){}}]
                 });
            	 
                chartsElemMap["flowview"] = [{
                    "chart": report
                }];

                report.render();
}
