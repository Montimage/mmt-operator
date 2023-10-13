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

var ReportFactory = {
	createThroughputReport: createReport("Bandwidth (bps)", MMTDrop.constants.StatsColumn.DATA_VOLUME.id, "bps", false,
		//convert from byte to bit 
		function(v){ return Math.round(v*8) }),
	createLatencyReport: createReport("Queue Latency (avg)", MMTDrop.constants.StatsColumn.L4S_HOP_LATENCY.id, "millisecond", true,
		//convert from micro to millisecond 
		function(v){ return Math.round(v/1000) }),
}


