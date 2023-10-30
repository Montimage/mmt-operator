var arr = [
	{
		id: "latency",
		title: "Queue Latency",
		x: 0,
		y: 0,
		width: 12,
		height: 5,
		type: "success",
		userData: {
			fn: "createLatencyReport"
		},
	},
	{
		id: "throughput",
		title: "Bandwidth",
		x: 0,
		y: 15,
		width: 12,
		height: 4,
		type: "success",
		userData: {
			fn: "createThroughputReport"
		},
	},
	{
		id: "security",
		title: "Security",
		x: 0,
		y: 16,
		width: 12,
		height: 2,
		type: "success",
		userData: {
			fn: "createSecurityReport"
		},
	},
];

var availableReports = {
	//"createNodeReport"	 : "Nodes",
}



function inDetailMode() {
	return (fPeriod.selectedOption().id === MMTDrop.constants.period.MINUTE);
}


const formatTime = function(date) {
	return moment(date.getTime()).format(fPeriod.getTimeFormat());
}

//group of charts
const _this = {}
_this.chartGroups = [];
_this.showAllTooltip = function(x) {
	for (var i in _this.chartGroups) {
		var c = _this.chartGroups[i];
		if (c != _this.activeChart) {
			try {
				c.chart.tooltip.show({ x: x });
			} catch (err) { }
		}
	}
};

_this.hideAllTooltip = function() {
	for (var i in _this.chartGroups) {
		var c = _this.chartGroups[i];
		try {
			c.chart.tooltip.hide();
		} catch (ex) { }
	}
};

//create reports
function createReport(yLabel, colToCal, unit, isGetAvg, fn) {
	return function(fPeriod){
		const COL = MMTDrop.constants.StatsColumn;
		const database = new MMTDrop.Database({
			collection: "data_l4s",
			action: "aggregate",
			raw: true,
		});

		database.updateParameter = function(_old_param) {
			const $match = {};
			$match[COL.PROBE_ID.id] = URL_PARAM.probe_id;
			$match[COL.TIMESTAMP.id] = { "$gte": status_db.time.begin, "$lte": status_db.time.end };

			const $group = { _id: {} };
			[COL.L4S_QUEUE_ID.id, COL.TIMESTAMP.id].forEach(function(el) {
				$group["_id"][el] = "$" + el;
			});

			[COL.TIMESTAMP.id, COL.L4S_QUEUE_ID.id].forEach(function(el) {
				$group[el] = { "$last": "$" + el };
			});
			
			[colToCal, COL.PACKET_COUNT.id].forEach(function(el) {
				$group[el] = { "$sum":  "$" + el };
			});

			return { query: [{ $match: $match }, { $group: $group }, { $project: { _id: 0 } }] };
		};

		const isFirstChart = (_this.chartGroups.length == 0)

		var cLine = MMTDrop.chartFactory.createTimeline({
			//columns: [MMTDrop.constants.StatsColumn.APP_PATH]
			getData: {
				getDataFn: function(db) {
					var data = db.data();
					const colsToGroup = [COL.TIMESTAMP.id, COL.L4S_QUEUE_ID.id];
					const colsToSum   = [colToCal, COL.PACKET_COUNT.id];

					data = MMTDrop.tools.sumByGroups(data, colsToSum, colsToGroup);
					//number of seconds
					const period_sampling = fPeriod.getDistanceBetweenToSamples();
					const arr = [];
					for (var time in data) {
						var o = {};
						o[COL.TIMESTAMP.id] = parseInt(time);

						var msg = data[time];
						for (var qId in msg) {
							let m = msg[qId];
							//get average per packet
							if( isGetAvg)
								o[qId] = m[colToCal] / m[COL.PACKET_COUNT.id] / period_sampling;
							else {
								o[qId] = m[colToCal] / period_sampling;
							}
							
							if( fn )
								o[qId] =  fn( o[qId] );
							else
								o[qId] =  Math.round( o[qId] );
						}
						arr.push(o);
					}

					var columns = [COL.TIMESTAMP, {id: 0, label: "Classic Queue"}, {id: 1, label: "Low-latency Queue"}];
					
					var $widget = $("#" + cLine.elemID).getWidgetParent();
					var height = $widget.find(".grid-stack-item-content").innerHeight();
					height -= $widget.find(".filter-bar").outerHeight(true) + 15;

					return {
						data: arr,
						columns: columns,
						ylabel: yLabel,
						height: height, //(isFirstChart? 185 : 110),
						addZeroPoints: {
							time_id: 3,
							time: status_db.time,
							sample_period: 1000 * fPeriod.getDistanceBetweenToSamples(),
							probeStatus: status_db.probeStatus,
						},
					};
				},
			},
			chart: {
				data: {
					type: "line"
				},
				axis: {
					x: {
						tick: {
							format: formatTime
						}
					},
					y: {
						tick: {
							count: (isFirstChart? 5 : 4),
							outer: false
						}
					}
				},
				grid: {
					x: {
						show: false
					}
				},
				tooltip: {
					format: {
						title: function(x) {
							//only fire for the active chart
							if (_this.activeChart == cLine)
								_this.showAllTooltip(x);
							return formatTime(x);
						},
						value: function(value) {
							return MMTDrop.tools.formatLocaleNumber(value) + " " + unit;
						}
					}
				},
				zoom: {
					enabled: true,
					rescale: true
				},
				onmouseover: function() {
					_this.activeChart = cLine;
				},
				onmouseout: function() {
					_this.hideAllTooltip();
				},
				padding: {
					top: 10,
					bottom: -10
				},
				legend: {
					show: isFirstChart //show legend for the first chart only
				}
			},
			afterEachRender: function(_chart) {
				var $widget = $("#" + _chart.elemID).getWidgetParent();
				//resize when changing window size
				$widget.on("widget-resized", null, _chart.chart, function(event, widget) {
					var chart = event.data;
					var height = $widget.find(".grid-stack-item-content").innerHeight();
					height -= $widget.find(".filter-bar").outerHeight(true) + 15;
					chart.resize({
						height: height
					});
				});

			}
		});

		_this.chartGroups.push( cLine );

		var report = new MMTDrop.Report(
			// title
			"",
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
			[{ object: cLine }]
		);
		return report;
	};
}

function createSecurityReport(fPeriod){
	const database = MMTDrop.databaseFactory.createStatDB({
		collection: "security",
		action: "aggregate", 
		no_group: true, //do not change to _real, _min, _hour collection when chaning period from "Last 5 minutes" to "Last 24h", ... 
		no_override_when_reload: true,  //do not upate time
		raw: true
	});
	
	database.updateParameter = function( _old_query) {
		return {query: [] };
	};

	function findConcernedIPs( history ){
		let concernt = "";
		for (var i in history) {
			var event = history[i].attributes;
			for (var j in event) {
				var atts = event[j];
				//since mmt-security v 1.2.8, atts is an array [key, value]
				// instead of an object {key: value}
				if (!Array.isArray(atts)) {
					//this is for older version
					const firstKey = Object.keys(atts)[0];
					atts = [firstKey, atts[firstKey]];
				}

				const key = atts[0]; //since mmt-security v 1.2.8, the first element is key, the second one is value
				const val = atts[1];

				//check if key is one of the followings
				const ipArr = ["ip.src", "ip.dst"];

				if (ipArr.indexOf(key) !== -1) {
					//if the att is not yet added
					if (concernt.indexOf(val) === -1) {
						//
						if (concernt != "") concernt += ", ";
						concernt += val;
					}
				}
			}
		}
		return concernt;
	}

	const STORAGE_ID = "is-blocking-attack";
	function isBlockingIP(){
		return MMTDrop.tools.localStorage.get( STORAGE_ID );
	}
	
	window._getButton = function(){
		if( isBlockingIP() ){
			return `<button type="button" class="btn btn-danger" disabled><i class="fa fa-spinner fa-spin"/> Blocking</button> <input type="button" class="btn btn-success" value="Unblock" onclick="unblockIP()">`
		} else {
			return `<input type="button" class="btn btn-danger" value="Block Attack" onclick="blockIP()">`
		}
	}
	
	window.blockIP = function(){
		MMTDrop.tools.localStorage.set( STORAGE_ID, "blocking" )
		$('#block-ip-button').html( _getButton() );
	}
	window.unblockIP = function(){
		MMTDrop.tools.localStorage.remove( STORAGE_ID );
		$('#block-ip-button').html( _getButton() );
	}
	
	var cTable = MMTDrop.chartFactory.createTable({
		getData: {
			getDataFn: function(db){
				const arr = db.data();
				let alert = ["&nbsp;"]
				//get only the last alert
				if( arr.length > 0 ){
					alert = arr[ arr.length - 1];
					
					//reformat timestamp
					alert[3] = MMTDrop.tools.formatDateTime(alert[3]);
					alert._ip = `<span id='concerned-ip'>${findConcernedIPs( alert[8] ) }</span>`;
					
					alert._react = `<span id='block-ip-button' style='width: 300px'> ${window._getButton()} </span>`
				}
					

				return {
					//https://github.com/Montimage/mmt-probe/blob/master/docs/data-format.md#security-reports
					columns: [{id: 3, label: "Timestamp"}, {id: 4, label: "Property ID"}, {id: 5, label: "Verdict"}, {id: 6, label: "Type"}, {id: 7, label: "Description"}, {id: "_ip", label: "Concerned IPs"}, {id: "_react", label: "Reaction"}],
					data: [ alert ]
				};
			}
		},
		chart: {
			dom: "<'row'" //show only data, not "Search" box, neither page navigation, ...
		},
		afterEachRender: function(_chart){
			var table = _chart.chart;
			if( table == undefined )
				return;
			console.log("ok")
			//resize when changing window size
			$(window).resize(function () {
				if (table)
					table.api().draw(false);
			});

		}
	});
	
	return new MMTDrop.Report(
			// title
			"",
			// database
			database,
			// filers
			[],
			//charts
			[
				{
					charts: [cTable],
					width: 12
				},
			],
			//order of data flux
			[{ object: cTable }]
	);
}

var ReportFactory = {
	createThroughputReport: createReport("Bandwidth (bps)", MMTDrop.constants.StatsColumn.DATA_VOLUME.id, "bps", false,
		//convert from byte to bit 
		function(v){ return Math.round(v*8) }),
	createLatencyReport: createReport("Queue Latency (avg)", MMTDrop.constants.StatsColumn.L4S_HOP_LATENCY.id, "millisecond", true,
		//convert from micro to millisecond 
		function(v){ return Math.round(v/1000) }),
	createSecurityReport: createSecurityReport
}


