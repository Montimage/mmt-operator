var arr = [
	{
		id: "int",
		title: "In-band Network Telemtry",
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
	//"createNodeReport"	 : "Nodes",
}



function inDetailMode() {
	return (fPeriod.selectedOption().id === MMTDrop.constants.period.MINUTE);
}

//create reports

var ReportFactory = {

	formatTime: function(date) {
		return moment(date.getTime()).format(fPeriod.getTimeFormat());
	},


	createQoSReport: function(fProbe) {
		fProbe.selectedOption({ id: MMTDrop.constants.period.MINUTE });
		fPeriod.hide();
		var _this = this;
		var COL = MMTDrop.constants.OTTQoSColumn;
		var database = new MMTDrop.Database({ format: 70, userData: { getProbeStatus: true } });
		var last_message = null;

		var createLineChart = function(columns, height, label, get_avg, opt) {
			//default chart options
			if (height == undefined) height = 200;
			if (label == undefined) label = "Bitrate (bps)";
			if (get_avg == undefined) get_avg = false;
			var chart_opt = {
				data: {
					type: "step"//step
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
						padding: {
							bottom: 0
						}
					}
				},
				zoom: {
					enabled: false,
					rescale: false
				},
				tooltip: {
					format: {
						title: function(x) {
							//only fire for the active chart
							if (_this.activeChart == chart && x)
								_this.showAllTooltip(x);

							return _this.formatTime(x);
						}
					}
				},
				line: {
					connectNull: true
				},
				padding: {
					top: 20
				},
				onmouseover: function() {
					//_this.activeChart = chart;
				},
				onmouseout: function() {
					//_this.hideAllTooltip();
				}
			};
			//override default options by the one given by user
			if (opt)
				chart_opt = MMTDrop.tools.mergeObjects(chart_opt, opt);

			//create line chart
			var chart = MMTDrop.chartFactory.createTimeline({
				getData: {
					getDataFn: function(db) {
						var period = fPeriod.getDistanceBetweenToSamples();
						var cols = columns.slice(0);
						var obj = {};
						var data = db.data();

						for (var i in data) {
							var msg = data[i];

							var time = msg[COL.TIMESTAMP.id];
							var exist = true;

							//data for this timestamp does not exist before
							if (obj[time] == undefined) {
								exist = false;
								obj[time] = {};
								obj[time][COL.TIMESTAMP.id] = time;
							}


							for (var j in cols) {
								var id = cols[j].id;

								if (msg[id] == undefined)
									msg[id] = 0;
								//percentage of probability of buffering
								else if (id == COL.PROBABILITY_BUFFERING.id)//
									msg[id] *= 100;

								if (exist) {
									obj[time][id].val += msg[id];
									obj[time][id].count += 1;
								} else
									obj[time][id] = { val: msg[id], count: 1 };
							}
						}

						//get the average
						for (var time in obj) {
							var o = obj[time];
							for (var id in o)
								if (o[id].count != undefined) {
									if (get_avg)
										o[id] = o[id].val / o[id].count;
									else
										o[id] = o[id].val;
								}
						}

						//addd zero-point
						var end = db.time.end;
						var begin = db.time.begin;
						if (begin < end - 5 * 60 * 1000)
							begin = end - 5 * 60 * 1000;

						var last_val = {};
						for (var time = begin; time <= end; time += 1000) {
							for (var j in cols) {
								var id = cols[j].id;
								if (obj[time] == undefined) {
									obj[time] = {};
									obj[time][COL.TIMESTAMP.id] = time;
								}
								if (obj[time][id] == undefined) {
									if (id == COL.PROBABILITY_BUFFERING.id || id == COL.VIDEO_QUALITY.id || id == COL.NETWORK_BITRATE.id || id == COL.VIDEO_BITRATE.id)
										obj[time][id] = last_val[id];
									else if (id == COL.DL_RETRANSMISSION.id || id == COL.OUT_OF_ORDER.id)
										obj[time][id] = 0;
								} else
									last_val[id] = obj[time][id];
							}

							if (last_message == undefined || last_message[COL.TIMESTAMP.id] <= time)
								last_message = MMTDrop.tools.mergeObjects(last_message, obj[time]);
						}

						//add timestamp as the first column
						cols.unshift(COL.TIMESTAMP);

						var val = {
							data: obj,
							columns: cols,
							ylabel: label,
							height: height
						};
						return val;
					}
				},
				chart: chart_opt
			});
			chart._COLS = columns;
			return chart;
		}

		var cLine = createLineChart([COL.NETWORK_BITRATE, COL.VIDEO_BITRATE], 200, "Bitrate (kbps)", true, {
			axis: {
				y: {
					tick: {
						format: function(v) {
							return Math.round(v / 1000);
							//return MMTDrop.tools.formatDataVolume( v );
						}
					}
				}
			}
		});
		var cQuality = createLineChart([COL.VIDEO_QUALITY], 200, "Quality", true, {
			data: { type: "area-step" },
			color: { pattern: ["#33CCCC"] },
			line: { connectNull: true },
			axis: { y: { max: 5, min: 0, padding: { top: 0 } } }
		});
		var cBuffer = createLineChart([COL.PROBABILITY_BUFFERING], 200, "Probability buffering (%)", true, {
			data: { type: "area-step" },
			color: { pattern: ["#CC99CC"] },
			axis: { y: { max: 100, min: 0, padding: { top: 0 } } }
		});
		var cError = createLineChart([COL.DL_RETRANSMISSION, COL.OUT_OF_ORDER], 200, "(packets)", false, {
			color: { pattern: ["violet", "red"] },
			axis: {
				y: {
					tick: {
						format: function(v) {
							if (v < 1000) return Math.round(v);
							return MMTDrop.tools.formatDataVolume(v);
						}
					}
				}
			}
		});

		var chart_groups = [cLine, cQuality, cBuffer, cError];
		_this.showAllTooltip = function(x) {
			for (var i in chart_groups) {
				var c = chart_groups[i];
				if (c != _this.activeChart) {
					try {
						c.chart.tooltip.show({ x: x });
					} catch (err) { }
				}
			}
		};

		_this.hideAllTooltip = function() {
			for (var i in chart_groups) {
				var c = chart_groups[i];
				try {
					c.chart.tooltip.hide();
				} catch (ex) { }
			}
		};

		//add one report on the charts
		var addReport = function(msg) {
			if (msg[3] <= last_message[3])
				return;

			msg[COL.PROBABILITY_BUFFERING.id] *= 100;
			if (last_message == undefined)
				last_message = msg;
			//show only last minute (to override performance pb)
			if (msg[3] - last_message[3] > 60 * 1000)
				last_message[3] = msg[3] - 60 * 1000;

			var getSpace = function(id) {
				var arr = [];
				for (var i = last_message[3] + 1000; i <= msg[3] - 1000; i += 1000)
					if (id == 3)//time
						arr.push(i);
					else
						arr.push(last_message[id]);
				//add the last val
				arr.push(msg[id]);
				return arr;
			}

			//timestamp
			var col_time = ["x"];
			var tmp = getSpace(3);
			for (var i in tmp)
				col_time.push(new Date(tmp[i]));

			for (var i in chart_groups) {
				var chart = chart_groups[i];

				var columns = [col_time];
				for (var j in chart._COLS) {
					var c = chart._COLS[j];
					tmp = getSpace(c.id);
					tmp.unshift(c.label);//add label

					columns.push(tmp);
				}
				//load new data on the chart
				chart.chart.flow({
					columns: columns
				});
			}
			last_message = msg;
		};


		window._load = addReport;

		//update report received from server
		setTimeout(function() {
			io().on('qos', addReport);
		}, 2000)



		var dataFlow = [
			{ object: cLine }, 
			{ object: cQuality }, 
			{ object: cBuffer }, 
			{ object: cError}
		];

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
				}, {
					charts: [cQuality],
					width: 12
				}, {
					charts: [cBuffer],
					width: 12
				}, {
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


