var arr = [
	{
		id: "latency",
		title: "Queue Latency",
		x: 0,
		y: 0,
		width: 12,
		height: 3,
		type: "success",
		userData: {
			fn: "createLatencyReport"
		},
	},
	{
		id: "occups",
		title: "Queue Occups",
		x: 0,
		y: 3,
		width: 12,
		height: 3,
		type: "danger",
		userData: {
			fn: "createOccupsReport"
		},
	},
	{
		id: "nb-mark",
		title: "Number of Marked packets",
		x: 0,
		y: 6,
		width: 12,
		height: 3,
		type: "warning",
		userData: {
			fn: "createMarkReport"
		},
	},
	{
		id: "nb-drop",
		title: "Number of Dropped packets",
		x: 0,
		y: 9,
		width: 12,
		height: 3,
		type: "info",
		userData: {
			fn: "createDropReport"
		},
	},
	{
		id: "mark-probab",
		title: "Mark Probability",
		x: 0,
		y: 12,
		width: 12,
		height: 3,
		type: "success",
		userData: {
			fn: "createMarkProbabReport"
		},
	}
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
function createReport(yLabel, colToCal, unit) {
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

		var cLine = MMTDrop.chartFactory.createTimeline({
			//columns: [MMTDrop.constants.StatsColumn.APP_PATH]
			getData: {
				getDataFn: function(db) {
					var data = db.data();
					const colsToGroup = [COL.TIMESTAMP.id, COL.L4S_QUEUE_ID.id];
					const colsToSum   = [colToCal, COL.PACKET_COUNT.id];

					data = MMTDrop.tools.sumByGroups(data, colsToSum, colsToGroup);

					const arr = [];
					for (var time in data) {
						var o = {};
						o[COL.TIMESTAMP.id] = parseInt(time);

						var msg = data[time];
						for (var qId in msg) {
							let m = msg[qId];
							//get average per packet
							o[qId] = Math.round( m[colToCal] / m[COL.PACKET_COUNT.id] );
						}
						arr.push(o);
					}

					var columns = [COL.TIMESTAMP, {id: 0, label: "Classic Queue"}, {id: 1, label: "LL Queue"}];

					return {
						data: arr,
						columns: columns,
						ylabel: yLabel,
						height: 175,
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
					enabled: false,
					rescale: false
				},
				onmouseover: function() {
					_this.activeChart = cLine;
				},
				onmouseout: function() {
					_this.hideAllTooltip();
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
	createLatencyReport: createReport("Queue Latency", MMTDrop.constants.StatsColumn.L4S_HOP_LATENCY.id, "microsecond"),
	createOccupsReport: createReport("Queue Occups", MMTDrop.constants.StatsColumn.L4S_QUEUE_OCCUPS.id, "packets"),
	createMarkReport: createReport("Nb Mark", MMTDrop.constants.StatsColumn.L4S_NB_MARK.id, "packets"),
	createDropReport: createReport("Nb Drop", MMTDrop.constants.StatsColumn.L4S_NB_DROP.id, "packets"),
	createMarkProbabReport: createReport("Mark probability", MMTDrop.constants.StatsColumn.L4S_MARK_PROBAB.id, "%"),
}


