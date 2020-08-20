var arr = [
	{
		id: "traffic",
		title: "Traffic",
		x: 0,
		y: 0,
		width: 12,
		height: 4,
		type: "success",
		userData: {
			fn: "createTrafficReport"
		},
	},
	{
		id: "top_user",
		title: "Top Devices",
		x: 0,
		y: 4,
		width: 6,
		height: 9,
		type: "info",
		userData: {
			fn: "createTopUserReport"
		},
	},
	{
		id: "top_link",
		title: "Top Links",
		x: 6,
		y: 4,
		width: 6,
		height: 9,
		type: "warning",
		userData: {
			fn: "createTopLinkReport"
		},
	},
	{
		id: "topo",
		title: "Topology",
		x: 6,
		y: 13,
		width: 12,
		height: 8,
		type: "danger",
		userData: {
			fn: "createTopoReport"
		},
	}
];

var availableReports = {
	"createTopUserReport": "Top Users",
};


function getHMTL(tag) {
	var html = tag[0];
	for (var i = 1; i < tag.length; i++)
		html += ' <i class="fa fa-angle-right"/> ' + tag[i];
	return html;
}

MMTDrop.filterFactory.createMetricFilter = function () {
	var cols = [
		MMTDrop.constants.StatsColumn.DATA_VOLUME,
		MMTDrop.constants.StatsColumn.PACKET_COUNT,
	];

	var options = [];
	for (var i in cols)
		options.push({ id: cols[i].id, label: cols[i].label });


	var filter = new MMTDrop.Filter({
		id: "metric_filter" + MMTDrop.tools.getUniqueNumber(),
		label: "Metric",
		options: options,
		useFullURI: false,
	},
		function(val, db) {
			//how it filters database when the current selected option is @{val}
		}
	);
	filter.getUnit = function() {
		var val = filter.selectedOption().id;
		switch (val) {
			case MMTDrop.constants.StatsColumn.PAYLOAD_VOLUME:
			case MMTDrop.constants.StatsColumn.DATA_VOLUME:
				return "B";

			case MMTDrop.constants.StatsColumn.PACKET_COUNT:
			case MMTDrop.constants.StatsColumn.ACTIVE_FLOWS:
				return "";
		}
	}
	return filter;
};

const LIMIT = 1000;

//change title of each report
var param = MMTDrop.tools.getURLParameters();
//top profile => detail of 1 profile (list app) => one app
if (param.profile) {
	arr[1].title = param.profile + " &#10095; ";
	if (param.app)
		arr[1].title += param.app;
	else
		arr[1].title += "Top Apps/Protos";
}

//when all paramerters are selected
//==> only one report is shown
if (param.profile && param.app && param.link)
	arr = [{
		id: "detail",
		title: "Details",
		x: 0,
		y: 0,
		width: 12,
		height: 6,
		type: "success",
		userData: {
			fn: "createDetailReport"
		},
	},]


const NO_IP = "no-ip", MICRO_FLOW = "micro-flow", REMOTE = "remote", LOCAL = "_local", NULL = "null";

//MongoDB match expression
function get_match_query(p) {
	var param = MMTDrop.tools.getURLParameters();
	var $match = {};
	var collection = undefined;
	const REPORT_COLLECTION = "reports_all";
	//location
	if (param.loc) {
		$match[COL.DST_LOCATION.id] = decodeURI(param.loc);
		collection = REPORT_COLLECTION;
	}

	if (param.profile) {
		$match[COL.PROFILE_ID.id] = MMTDrop.constants.getCategoryIdFromName(param.profile);
		collection = REPORT_COLLECTION;
	}

	if (param.app) {
		$match[COL.APP_ID.id] = MMTDrop.constants.getProtocolIDFromName(param.app);
		collection = REPORT_COLLECTION;
	}

	//when a specific IP is selected
	if (param.ip) {
		collection = REPORT_COLLECTION;

		if (param.ip == NO_IP) {
			$match[COL.IP_SRC.id] = NULL;
		} else if (param.ip == LOCAL) {
			$match[COL.SRC_LOCATION.id] = LOCAL;
		} else if (param.ip == REMOTE) {
			$match[COL.DST_LOCATION.id] = { "$ne": LOCAL };
		} else {
			var obj = {};
			obj[COL.IP_SRC.id] = param.ip;
			$match["$or"] = [obj];

			obj = {};
			obj[COL.IP_DST.id] = param.ip;
			$match["$or"].push(obj);
		}
	} else {
		$match[COL.IP_SRC.id] = { "$ne": NULL };//{$nin:[NULL, MICRO_FLOW]};
		//$match[ COL.IP_DST.id ] = {$nin:[NULL, MICRO_FLOW]};
	}

	if (param.link) {
		var link = param.link.split(",");
		$match[COL.IP_SRC.id] = { $in: link };
		$match[COL.IP_DST.id] = { $in: link };

		collection = REPORT_COLLECTION;
	}

	if (_.isEmpty($match))
		return null;


	var obj = { match: $match };

	if (collection)
		obj.collection = collection;
	return obj;
}

//whether we show a link to enter detail of each element, such as, each IP, profile, country, etc.
function disableDetail() {

	//if interval of conservation of detail reports >= the period to show 
	if (fPeriod && MMTDrop.config && MMTDrop.config.others)
		return (MMTDrop.config.others.retain_detail_report_period < fPeriod.getSamplePeriodTotal());

	return false;
}

//limit number of rows of a table/number of pies per chart
const LIMIT_SIZE = 1000;
//create reports
var ReportFactory = {
	/**
	 *
	 * @param   {[[Type]]}              Detail report of (1) one application/protocol and (2) one local IP and (3) one remote IP
	 * @returns {object|string|boolean} [[Description]]
	 */
	createDetailReport: function() {
		var self = this;
		var FORMAT = MMTDrop.constants.CsvFormat;

		var database = MMTDrop.databaseFactory.createStatDB({ collection: "reports_all", action: "find", no_group: true });
		//this is called each time database is reloaded
		database.updateParameter = function(param) {
			var $match = get_match_query();
			//query by app_id
			if ($match != undefined) {
				param.query = [{ $match: $match.match }];
			}
		}

		var cTable = MMTDrop.chartFactory.createTable({
			getData: {
				getDataFn: function(db) {
					HISTORY = [];
					var columns = [{ id: COL.START_TIME.id, label: "Start Time", align: "left" },
					{ id: COL.TIMESTAMP.id, label: "Timestamp", align: "left" },
					{ id: COL.IP_DST.id, label: "Remote Address", align: "left" },
					COL.APP_PATH];

					var colSum = [
						{ id: COL.UL_DATA_VOLUME.id, label: "Upload (B)", align: "right" },
						{ id: COL.DL_DATA_VOLUME.id, label: "Download (B)", align: "right" },
					];
					var HTTPCols = [
						{ id: HTTP.CONTENT_LENGTH.id, label: "File Size (B)", align: "right" },
						{ id: HTTP.URI.id, label: HTTP.URI.label },
						{ id: HTTP.METHOD.id, label: HTTP.METHOD.label },
						{ id: HTTP.RESPONSE.id, label: HTTP.RESPONSE.label },
						{ id: HTTP.MIME_TYPE.id, label: "MIME", align: "left" },
						{ id: HTTP.REFERER.id, label: "Referer", align: "left" },

					];
					var SSLCols = [];
					var RTPCols = [SSL.SERVER_NAME];
					var FTPCols = [
						FTP.CONNNECTION_TYPE,
						FTP.USERNAME,
						FTP.PASSWORD,
						FTP.FILE_NAME,
						{ id: FTP.FILE_SIZE.id, label: "File Size (B)", align: "right" }
					];
					var otherCols = [];

					var data = db.data();

					var arr = [];
					var havingOther = false;
					var type = 0;

					for (var i in data) {
						var msg = data[i];

						var format = msg[COL.FORMAT_TYPE.id];
						var obj = {};
						HISTORY.push(msg);

						obj[COL.START_TIME.id] = moment(msg[COL.START_TIME.id]).format("YYYY/MM/DD HH:mm:ss");
						obj[COL.TIMESTAMP.id] = moment(msg[COL.TIMESTAMP.id]).format("YYYY/MM/DD HH:mm:ss");
						obj[COL.APP_PATH.id] = MMTDrop.constants.getPathFriendlyName(msg[COL.APP_PATH.id]);
						obj[COL.FORMAT_TYPE.id] = msg[COL.FORMAT_TYPE.id];
						var host = "";
						if (type == 0 || type == undefined)
							type = msg[COL.FORMAT_TYPE.id];

						//HTTP
						if (type == 1)
							host = msg[HTTP.HOSTNAME.id];
						else if (type == 2)
							host = msg[SSL.SERVER_NAME.id];

						if (host != undefined && host != "" && host != msg[COL.IP_DST.id]) {
							obj[COL.IP_DST.id] = host;
						} else
							obj[COL.IP_DST.id] = msg[COL.IP_DST.id] + ":" + msg[COL.PORT_DST.id]; // ip

						for (var j in colSum) {
							var val = msg[colSum[j].id];
							if (val == undefined)
								val = 0;
							obj[colSum[j].id] = val;
						}
						if (type == 1)
							otherCols = HTTPCols;
						else if (type == 2)
							otherCols = SSLCols;
						else if (type == 3)
							otherCols = RTPCols;
						else if (type == 4)
							otherCols = FTPCols;

						for (var i in otherCols) {
							var c = otherCols[i];
							var val = msg[c.id];
							if (val != undefined && val !== "" && val !== 0 && val !== -1) {
								//if( val == 0 ) val = ""
								obj[c.id] = MMTDrop.tools.formatString(val, 50);
								c.havingData = true;
							}
						}

						arr.push(obj);
					}

					for (var i in otherCols) {
						var c = otherCols[i];
						if (c.havingData === true) {
							colSum.push(c);
							//default value for the rows that have not data of this c
							for (var j in arr)
								if (arr[j][c.id] == undefined || arr[j][c.id] == "null" || arr[j][c.id] == "(null)")
									arr[j][c.id] = "";
						}
					}

					columns = columns.concat(colSum);
					columns.unshift({ id: "index", label: "" });

					//sort by Download
					arr.sort(function(a, b) {
						return b[COL.DL_DATA_VOLUME.id] - a[COL.DL_DATA_VOLUME.id];
					})

					for (var i = 0; i < arr.length; i++) {
						var msg = arr[i];
						msg.index = (i + 1);
						msg[COL.UL_DATA_VOLUME.id] = MMTDrop.tools.formatDataVolume(msg[COL.UL_DATA_VOLUME.id]);
						msg[COL.DL_DATA_VOLUME.id] = MMTDrop.tools.formatDataVolume(msg[COL.DL_DATA_VOLUME.id]);

						//HTTP
						if (msg[COL.FORMAT_TYPE.id] == 1) {
							if (msg[HTTP.CONTENT_LENGTH.id] > 0)
								msg[HTTP.CONTENT_LENGTH.id] = MMTDrop.tools.formatDataVolume(msg[HTTP.CONTENT_LENGTH.id]);
							else {
								msg[HTTP.CONTENT_LENGTH.id] = "";
							}
						}
						//FTP
						else if (msg[COL.FORMAT_TYPE.id] === 4) {
							if (msg[FTP.CONNNECTION_TYPE.id] == 1)
								msg[FTP.CONNNECTION_TYPE.id] = "Connection";
							else
								msg[FTP.CONNNECTION_TYPE.id] = "Data";
							msg[FTP.FILE_SIZE.id] = MMTDrop.tools.formatDataVolume(msg[FTP.FILE_SIZE.id]);

							if (msg[FTP.USERNAME.id] == 0) msg[FTP.USERNAME.id] = "";
							if (msg[FTP.PASSWORD.id] == 0) msg[FTP.PASSWORD.id] = "";
						}
					}
					return {
						data: arr,
						columns: columns,
					};
				}
			},
			chart: {
				"paging": true,
				"info": true,
				//"dom"   : '<"detail-table table-inside-table row-cursor-default" t><<"col-sm-3"i><"col-sm-3"f><"col-sm-6"p>>',
				dom: "<'dataTables_wrapper form-inline dt-bootstrap no-footer'"
					+ "<'row' <'col-sm-6' i> <'col-sm-6' f> >"
					+ "<'dataTables_mix overflow-auto-xy't>"
					+ "<'row'<'col-sm-3'l><'col-sm-9'p>> >",
				"scrollY": "300px",
				"scrollX": true,
				"scrollCollapse": true,
				deferRender: true,
			},

			afterEachRender: function(_chart) {
				var table = _chart.chart;
				if (table === undefined) return;

				table.DataTable().columns.adjust();

				table.on("draw.dt", function() {
					//scrolldiv contain table( header+content) + info + search box + paging
					var $div = $('.dataTables_mix');
					var h = $div.getWidgetContentOfParent().height() - 90;
					$div.css('height', h);

					//scrolldiv contains only body of table
					$div.find(".dataTables_scrollBody").css({
						"max-height": (h - 50) + "px",
						"border-bottom": "thin solid #ddd"
					});
				});
				table.trigger("draw.dt");

				var $widget = $("#" + _chart.elemID).getWidgetParent();
				//resize when changing window size
				$widget.on("widget-resized", null, table, function(event, widget) {
					if (event.data) {
						event.data.api().draw(false);
					}
				});
				$widget.trigger("widget-resized", [$widget]);
			}
		});

		var report = new MMTDrop.Report(
			// title
			null,
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
		return report;

	},

	createTopLinkReport: function(filter) {
		var self = this;


		var database = MMTDrop.databaseFactory.createStatDB({
			collection: "data_link", action: "aggregate",
			query: [], raw: true
		});

		database.updateParameter = function(param) {
			//mongoDB aggregate
			var group = { _id: {} };
			[COL.IP_SRC.id, COL.IP_DST.id].forEach(function(el, index) {
				group["_id"][el] = "$" + el;
			});
			[COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id].forEach(function(el, index) {
				group[el] = { "$sum": "$" + el };
			});
			[COL.TIMESTAMP.id, COL.PROBE_ID.id, COL.FORMAT_ID.id, COL.IP_SRC.id, COL.IP_DST.id].forEach(function(el, index) {
				group[el] = { "$first": "$" + el };
			});

			const sort = {};
			sort[COL.DATA_VOLUME.id] = -1;

			var $match = get_match_query();

			if ($match != undefined) {

				if ($match.collection != undefined) {
					param.collection = $match.collection;
					param.no_group = true;
				}
				else
					group._id = "$link";

				param.query = [{ $match: $match.match }, { $group: group }, { $sort: sort }, { $limit: LIMIT }];
			}

		}

		var fMetric = MMTDrop.filterFactory.createMetricFilter();

		var cPie = MMTDrop.chartFactory.createPie({
			getData: {
				getDataFn: function(db) {
					var col = fMetric.selectedOption();

					var data = [];
					//the first column is Timestamp, so I start from 1 instance of 0
					var columns = [];

					cPie.dataLegend = {
						"dataTotal": 0,
						"label": col.label.substr(0, col.label.indexOf(" ")),
						"data": {}
					};

					var db_data = db.data();
					var sperator = " &#x21cb; ";
					for (var i = 0; i < db_data.length; i++) {
						var val = db_data[i][col.id];
						var ip_src = db_data[i][COL.IP_SRC.id];
						var ip_dst = db_data[i][COL.IP_DST.id];
						var name = ip_src + sperator + ip_dst;
						var in_name = ip_dst + sperator + ip_src;

						//as we do not care dst-src or src-dst
						//=> if there exists a link dst-src ==> use that
						if (cPie.dataLegend.data[in_name] != undefined) {
							name = in_name;
						} else if (cPie.dataLegend.data[name] === undefined)
							cPie.dataLegend.data[name] = { val: 0, ips: [ip_src, ip_dst] };

						cPie.dataLegend.data[name].val += val;
						cPie.dataLegend.dataTotal += val;
					}

					for (var name in cPie.dataLegend.data) {
						/*
								var arr = cPie.dataLegend.data[ name ].ips;
								arr[0] = _IP.number2StringV4( arr[0] );
								arr[1] = _IP.number2StringV4( arr[1] );
								var key = arr.join( sperator );
						   
								cPie.dataLegend.data[ key ] = cPie.dataLegend.data[ name ];
								//delete old data
								delete( cPie.dataLegend.data[ name ] );
								//use the new name
								name = key;
						  */

						data.push({
							"key": name,
							"val": cPie.dataLegend.data[name].val
						});
					}

					data.sort(function(a, b) {
						return b.val - a.val;
					});

					var top = 7;


					if (cPie.showAll === true && data.length > LIMIT_SIZE) {
						top = LIMIT_SIZE;
						cPie.showAll = false;
					}

					if (data.length > top + 2 && cPie.showAll !== true) {
						var val = 0;

						//update data
						for (var i = top; i < data.length; i++) {
							var msg = data[i];
							val += msg.val;

							//remove
							delete (cPie.dataLegend.data[msg.key]);
						}

						//reset dataLegend
						cPie.dataLegend.data["Other"] = { mac: "", val: val };

						data[top] = {
							key: "Other",
							val: val
						};
						data.length = top + 1;
					}
					cPie.dataLegend.length = data.length;

					return {
						data: data,
						columns: [{
							"id": "key",
							label: ""
						}, {
							"id": "val",
							label: ""
						}],
						ylabel: col.label
					};
				}
			},
			chart: {
				size: {
					height: 300
				},
				legend: {
					hide: true,
				},
				data: {
					onclick: function(d, i) {
						var ip = d.id;
						if (ip === "Other") return;

						var _chart = cPie;
						//TODO
					}
				}
			},
			bgPercentage: {
				table: ".tbl-top-link",
				column: 4, //index of column, start from 1
				css: "bg-img-1-red-pixel"
			},
			//custom legend
			afterEachRender: function(_chart) {
				var chart = _chart.chart;
				var legend = _chart.dataLegend;

				var $table = $("<table>", {
					"class": "table table-bordered table-striped table-hover table-condensed tbl-top-link"
				});
				$table.appendTo($("#" + _chart.elemID));
				$("<thead><tr><th></th><th>Links</th><th width='20%'>" + legend.label + "</th><th width='20%'>Percent</th><th></th></tr>").appendTo($table);
				var i = 0;
				for (var key in legend.data) {
					if (key == "Other")
						continue;
					i++;
					var val = legend.data[key].val;
					var ips = legend.data[key].ips;

					var $tr = $("<tr>");
					$tr.appendTo($table);

					$("<td>", {
						"class": "item-" + key,
						"data-id": key,
						"style": "width: 30px; cursor: pointer",
						"align": "right"
					})
						.css({
							"background-color": chart.color(key)
						})
						.on('mouseover', function() {
							chart.focus($(this).data("id"));
						})
						.on('mouseout', function() {
							chart.revert();
						})
						.on('click', function() {
							var id = $(this).data("id");
							chart.toggle(id);
							//$(this).css("background-color", chart.color(id) );
						})
						.appendTo($tr);

					var link = ips.join(",");
					if (disableDetail() || (legend.length == 1 && link == MMTDrop.tools.getURLParameters("link"))) {
						$("<td>", {
							html: key
						}).appendTo($tr);
					} else {
						var $label = $("<a>", {
							html: key,
							title: "click to show detail of this user",
							href: MMTDrop.tools.getCurrentURL(["loc", "profile", "ip", "app", "probe_id", "period"], "link=" + link)
						});

						$("<td>").append($label).appendTo($tr);
					}

					$("<td>", {
						"text": MMTDrop.tools.formatDataVolume(val),
						"align": "right"
					}).appendTo($tr);

					var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
					$("<td>", {
						"align": "right",
						"text": percent

					}).appendTo($tr);

					//ips[0] = _IP.string2NumberV4( ips[0] );
					//ips[1] = _IP.string2NumberV4( ips[1] );

					var $match = {};
					$match[COL.IP_SRC.id] = { $in: ips };
					$match[COL.IP_DST.id] = { $in: ips };
					$match = JSON.stringify($match);

					var fun = "createPopupReport('link'" //collection
						+ ",'match'" //key
						+ ", this.getAttribute('match')" //id
						+ ",'Link: " + key + "'" //title
						+ ")";

					$("<td>", {
						"align": "center",
						"html": '<a title="Click to show graph" onclick="' + fun + '" match=\'' + $match + '\'><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
					}).appendTo($tr);
				}

				//footer of table
				var $tfoot = $("<tfoot>");

				if (legend.data["Other"] != undefined) {
					i++;
					$tr = $("<tr>");
					var key = "Other";
					var val = legend.data[key].val;

					$("<td>", {
						"class": "item-" + key,
						"data-id": key,
						"style": "width: 30px; cursor: pointer",
						"align": "right"
					})
						.css({
							"background-color": chart.color(key)
						})
						.on('mouseover', function() {
							chart.focus($(this).data("id"));
						})
						.on('mouseout', function() {
							chart.revert();
						})
						.on('click', function() {
							var id = $(this).data("id");
							chart.toggle(id);
							//$(this).css("background-color", chart.color(id) );
						})
						.appendTo($tr);

					if (i <= 10) {
						var $a = $("<a>", {
							href: "?show all clients",
							title: "click to show all clients",
							text: "Other",

						});
						$a.on("click", function() {
							_chart.showAll = true;
							_chart.redraw();
							return false;
						});

						$("<td>").append($a).appendTo($tr);
					}
					else
						$("<td>").append("Other").appendTo($tr);

					$("<td>", {
						"align": "right",
						"html": MMTDrop.tools.formatDataVolume(val),
					}).appendTo($tr);

					var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
					$("<td>", {
						"align": "right",
						"text": percent

					}).appendTo($tr);

					$("<td>").appendTo($tr);

					$tfoot.append($tr).appendTo($table);
				}

				$tfoot.append(
					$("<tr>", {
						"class": 'success'
					}).append(
						$("<td>", {
							"align": "center",
							"text": i
						})
					).append(
						$("<td>", {
							"text": "Total"
						})
					).append(
						$("<td>", {
							"align": "right",
							"text": MMTDrop.tools.formatDataVolume(legend.dataTotal)
						})
					).append(
						$("<td>", {
							"align": "right",
							"text": "100%"
						})
					).append(
						$("<td>")
					)
				).appendTo($table);

				$table.dataTable({
					paging: false,
					dom: "t",
					order: [[3, "desc"]],
					"scrollY": "240px",
					"scrollCollapse": true,
				});
			}
		});
		//

		var dataFlow = [{
			object: fMetric,
			effect: [{
				object: cPie
			},]
		}];

		var report = new MMTDrop.Report(
			// title
			null,

			// database
			database,

			// filers
			[fMetric],

			//charts
			[
				{
					charts: [cPie],
					width: 12
				},
			],

			//order of data flux
			dataFlow
		);

		return report;
	},
	createTopUserReport: function(filter, userData) {
		var self = this;
		//mongoDB aggregate
		var group = { _id: "$" + COL.IP_SRC.id };
		/*
		[  ].forEach( function( el, index){
		  group["_id"][ el ] = "$" + el;
		  $project[ el ] = 1;
		} );
		*/
		[COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id].forEach(function(el, index) {
			group[el] = { "$sum": "$" + el };
		});
		[COL.PROBE_ID.id, COL.IP_SRC.id, COL.MAC_SRC.id].forEach(function(el, index) {
			group[el] = { "$first": "$" + el };
		});

		const sort = {};
		sort[COL.DATA_VOLUME.id] = -1;
		var database = MMTDrop.databaseFactory.createStatDB({
			collection: "data_ip", action: "aggregate",
			query: [{ $group: group }, { $sort: sort }], raw: true
		});
		//this is call each time database is reloaded
		database.updateParameter = function(param) {
			var $match = get_match_query();
			if ($match != undefined) {
				param.query = [{ $match: $match.match }, { $group: group }, { $sort: sort }, { $limit: 1000 }];

				if ($match.collection != undefined) {
					param.collection = $match.collection;
					param.no_group = true;
				}
			}
		}

		var fMetric = MMTDrop.filterFactory.createMetricFilter();

		var cPie = MMTDrop.chartFactory.createPie({
			getData: {
				getDataFn: function(db) {
					var col = fMetric.selectedOption();

					var data = [];
					//the first column is Timestamp, so I start from 1 instance of 0
					var columns = [];

					cPie.dataLegend = {
						"dataTotal": 0,
						"label": col.label.substr(0, col.label.indexOf(" ")),
						"data": {}
					};

					var db_data = db.data();

					for (var i = 0; i < db_data.length; i++) {
						var val = db_data[i][col.id];
						var name = db_data[i][COL.IP_SRC.id];
						var mac = db_data[i][COL.MAC_SRC.id];

						if (cPie.dataLegend.data[name] === undefined)
							cPie.dataLegend.data[name] = { mac: mac, val: 0 };

						cPie.dataLegend.data[name].val += val;
						cPie.dataLegend.dataTotal += val;
					}

					for (var name in cPie.dataLegend.data) {
						/*
								var ip = _IP.number2StringV4( name );
								cPie.dataLegend.data[ ip ] = cPie.dataLegend.data[ name ];
						  	
								delete( cPie.dataLegend.data[ name ]);
								*/

						var ip = name;

						data.push({
							"key": ip,
							"val": cPie.dataLegend.data[ip].val
						});
					}


					data.sort(function(a, b) {
						return b.val - a.val;
					});

					var top = 7;


					if (cPie.showAll === true && data.length >= LIMIT_SIZE) {
						top = LIMIT_SIZE;
						cPie.showAll = false;
					}

					if (data.length > top + 2 && cPie.showAll !== true) {
						var val = 0;

						//update data
						for (var i = top; i < data.length; i++) {
							var msg = data[i];
							val += msg.val;

							//remove
							delete (cPie.dataLegend.data[msg.key]);
						}

						//reset dataLegend
						cPie.dataLegend.data["Other"] = { mac: "", val: val };

						data[top] = {
							key: "Other",
							val: val
						};
						data.length = top + 1;
					}
					cPie.dataLegend.length = data.length;
					return {
						data: data,
						columns: [{
							"id": "key",
							label: ""
						}, {
							"id": "val",
							label: ""
						}],
						ylabel: col.label
					};
				}
			},
			chart: {
				size: {
					height: 300
				},
				legend: {
					hide: true,
				},
				data: {
					onclick: function(d, i) {
						var ip = d.id;
						if (ip === "Other") return;

						var _chart = cPie;
						//TODO
					}
				}
			},
			bgPercentage: {
				table: ".tbl-top-users",
				column: 5, //index of column, start from 1
				css: "bg-img-1-red-pixel"
			},
			//custom legend
			afterEachRender: function(_chart) {
				var chart = _chart.chart;
				var legend = _chart.dataLegend;

				var $table = $("<table>", {
					"class": "table table-bordered table-striped table-hover table-condensed tbl-top-users"
				});
				$table.appendTo($("#" + _chart.elemID));
				$("<thead><tr><th></th><th width='40%'>Local IP</th><th width='20%'>MAC</th><th width='15%'>" + legend.label + "</th><th width='15%'>Percent</th><th> </th></tr>").appendTo($table);
				var i = 0;
				for (var key in legend.data) {
					if (key == "Other")
						continue;
					i++;
					var val = legend.data[key].val;
					var mac = legend.data[key].mac;

					var $tr = $("<tr>");
					$tr.appendTo($table);

					$("<td>", {
						"class": "item-" + key,
						"data-id": key,
						"style": "width: 30px; cursor: pointer",
						"align": "right"
					})
						.css({
							"background-color": chart.color(key)
						})
						.on('mouseover', function() {
							chart.focus($(this).data("id"));
						})
						.on('mouseout', function() {
							chart.revert();
						})
						.on('click', function() {
							var id = $(this).data("id");
							chart.toggle(id);
							//$(this).css("background-color", chart.color(id) );
						})
						.appendTo($tr);
					if (disableDetail() || (legend.length == 1 && key == MMTDrop.tools.getURLParameters("ip"))) {
						$("<td>", {
							html: key
						}).appendTo($tr);
					} else {
						var $label = $("<a>", {
							text: key,
							title: "click to show detail of this user",
							href: MMTDrop.tools.getCurrentURL(["loc", "profile", "link", "app", "probe_id", "period"], "ip=" + key)
						});

						$("<td>", { align: "left" }).append($label).appendTo($tr);
					}

					$("<td>", {
						"text": mac,
						"align": "left"
					}).appendTo($tr);


					$("<td>", {
						"text": MMTDrop.tools.formatDataVolume(val),
						"align": "right"
					}).appendTo($tr);

					var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
					$("<td>", {
						"align": "right",
						"text": percent

					}).appendTo($tr);

					var fun = "createPopupReport(" +
						"'ip'"                 //collection
						+ "," + COL.IP_SRC.id  //key
						+ ",'" + key //_IP.string2NumberV4( key )             //id
						+ "','IP: " + key + "'"  //title 
						+ ")";

					$("<td>", {
						"align": "center",
						"html": '<a title="Click to show graph" onclick="' + fun + '"><i class="fa fa-line-chart" aria-hidden="true"></i></a>'
					}).appendTo($tr);
				}

				//footer of table
				var $tfoot = $("<tfoot>");

				if (legend.data["Other"] != undefined) {
					i++;
					$tr = $("<tr>");
					var key = "Other";
					var val = legend.data[key].val;

					$("<td>", {
						"class": "item-" + key,
						"data-id": key,
						"style": "width: 30px; cursor: pointer",
						"align": "right"
					})
						.css({
							"background-color": chart.color(key)
						})
						.on('mouseover', function() {
							chart.focus($(this).data("id"));
						})
						.on('mouseout', function() {
							chart.revert();
						})
						.on('click', function() {
							var id = $(this).data("id");
							chart.toggle(id);
							//$(this).css("background-color", chart.color(id) );
						})
						.appendTo($tr);

					if (i <= 10) {
						var $a = $("<a>", {
							href: "?show all clients",
							title: "click to show all clients",
							text: "Other",

						});
						$a.on("click", function() {
							_chart.showAll = true;
							_chart.redraw();
							return false;
						});

						$("<td>").append($a).appendTo($tr);
					}
					else
						$("<td>").append("Other").appendTo($tr);

					$("<td>").appendTo($tr);

					$("<td>", {
						"align": "right",
						"html": MMTDrop.tools.formatDataVolume(val),
					}).appendTo($tr);

					var percent = MMTDrop.tools.formatPercentage(val / legend.dataTotal);
					$("<td>", {
						"align": "right",
						"text": percent

					}).appendTo($tr);

					$("<td>").appendTo($tr);

					$tfoot.append($tr).appendTo($table);
				}

				$tfoot.append(
					$("<tr>", {
						"class": 'success'
					}).append(
						$("<td>", {
							"align": "center",
							"text": i
						})
					).append(
						$("<td>", {
							"text": "Total"
						})
					).append(
						$("<td>", {
						})
					).append(
						$("<td>", {
							"align": "right",
							"text": MMTDrop.tools.formatDataVolume(legend.dataTotal)
						})
					).append(
						$("<td>", {
							"align": "right",
							"text": "100%"
						})
					).append(
						$("<td>")
					)
				).appendTo($table);

				$table.dataTable({
					paging: false,
					dom: "t",
					order: [[4, "desc"]],
					"scrollY": "240px",
					"scrollCollapse": true,
				});
			}
		});
		//

		var dataFlow = [{
			object: fMetric,
			effect: [{
				object: cPie
			},]
		}];

		var report = new MMTDrop.Report(
			// title
			null,

			// database
			database,

			// filers
			[fMetric],

			//charts
			[
				{
					charts: [cPie],
					width: 12
				},
			],

			//order of data flux
			dataFlow
		);

		return report;
	},

	createTopoReport: function(filter) {

		//draw topo chart
		var topoChart = new MMTDrop.Chart({
			getData: {
				getDataFn: function(db) {
					return {
						data: [[db.data()]],
						columns: [{ id: 0 }]
					};
				}
			}
		},
			function(elemID, option, data) {
				//style defintion
				var str =
					function() {
						/**
						<style type="text/css">
						.node:hover {
						  cursor: pointer;
						}
						.link path {
						  fill: none;
						  stroke: #1f77b4;
						  pointer-events: none;
						}
						.link textPath {
						  pointer-events: none;
						  font: 10px sans-serif;
						  fill: #1f77b4;
						}
						
						.node circle {
						  stroke-width: 2px;
						}
						.node text {
						  cursor: pointer;
						  font: 12px sans-serif;
						}
						</style>
						*/
					}.toString().split('\n').slice(2, -2).join('\n');
				$(str).appendTo("head");

				//draw a topo graph on a DOM element given by eID
				//console.log( data );
				return function(eID, data) {
					var col = fMetric.selectedOption();
					data = data[0][0]
					if (data.length > 100)
						data.length = 100;

					//size of display content
					var width = $(eID).getWidgetContentOfParent().innerWidth() - 20,
						height = $(eID).getWidgetContentOfParent().innerHeight() - 60;

					const COLOR = d3.scale.category10();

					const svg = d3.select(eID).append("svg")
						.attr("width", width)
						.attr("height", height);

					var obj = {};

					var remote_hosts = 0; //number of IP that is not local
					var total_hosts = 0;
					//count remote and total hosts
					for (var i = 0; i < data.length; i++) {
						var msg = data[i];

						//convert IP from a 32bit number to a string
						//msg[ COL.IP_SRC.id ]  = _IP.number2StringV4( msg[ COL.IP_SRC.id ] );
						//msg[ COL.IP_DST.id ] = _IP.number2StringV4( msg[ COL.IP_DST.id ] );

						var name = msg[COL.IP_SRC.id];
						//SRC is local
						msg.is_src_local = (msg[COL.SRC_LOCATION.id] == LOCAL);

						if (obj[name] == undefined) {
							obj[name] = true;
							total_hosts++;
							if (!msg.is_src_local) remote_hosts++;
						}

						//destination
						name = msg[COL.IP_DST.id];
						//DST is local
						msg.is_dst_local = (msg[COL.DST_LOCATION.id] == LOCAL);

						if (obj[name] == undefined) {
							obj[name] = true;
							total_hosts++;
							if (!msg.is_dst_local) remote_hosts++;
						}
					}

					const local_hosts = total_hosts - remote_hosts;
					var combine = false;
					//combine the remote hosts into one
					if (remote_hosts > 50 || (remote_hosts > 30 && local_hosts > 5)) {
						combine = true;
						for (var i = 0; i < data.length; i++) {
							var msg = data[i];
							if (!msg.is_src_local && !msg.is_dst_local)
								continue;

							if (!msg.is_src_local)
								msg[COL.IP_SRC.id] = REMOTE;
							if (!msg.is_dst_local)
								msg[COL.IP_DST.id] = REMOTE;
						}
					}
					//combine local
					if (local_hosts > 100) {
						combine = true;
						for (var i = 0; i < data.length; i++) {
							var msg = data[i];

							if (msg.is_src_local)
								msg[COL.IP_SRC.id] = LOCAL;
							if (msg.is_dst_local)
								msg[COL.IP_DST.id] = LOCAL;
						}
					}

					//update source and target when combination
					if (combine) {
						obj = {};
						for (var i = 0; i < data.length; i++) {
							var msg = data[i];
							var key = msg[COL.IP_SRC.id] + "-" + msg[COL.IP_DST.id];
							if (obj[key] == undefined)
								obj[key] = msg;
							else
								obj[key][col.id] += msg[col.id];
						}

						data = [];
						for (var name in obj)
							data.push(obj[name]);
					}

					//get set of nodes in obj
					obj = {};
					var max_val = 0;

					for (var i = 0; i < data.length; i++) {
						var msg = data[i];
						var name = msg[COL.IP_SRC.id];
						var val = msg[col.id];
						if (name == "null") {
							name = NO_IP;
						}

						//source
						if (val > max_val) max_val = val;
						msg.source = name;
						if (obj[name] == undefined)
							obj[name] = {
								name: name, id: name.replace(/:/g, "_"),
								data: msg,
								val: 0,
								is_local: msg.is_src_local,
								link_count: 0
							};
						obj[name].val += val;

						//destination
						name = msg[COL.IP_DST.id];
						if (name == "null")
							name = NO_IP;

						msg.target = name;
						if (obj[name] == undefined)
							obj[name] = { name: name, id: name.replace(/:/g, "_"), data: msg, val: 0, is_local: msg.is_dst_local, link_count: 0 };

						obj[name].val += val;
					}


					var max_val = 0;
					var min_val = 1000 * 1000 * 1000; //1M

					for (var name in obj) {
						var val = obj[name].val;
						if (max_val < val)
							max_val = val;
						if (val < min_val)
							min_val = val;
					}

					const radius_min = 5, radius_max = 50;

					for (var name in obj) {
						//convert to a readable value
						var o = obj[name];
						o.text = MMTDrop.tools.formatDataVolume(o.val);

						o.show_detail = true;
						o.radius = o.val / max_val * 50;
						if (o.radius < radius_min) {
							o.radius = radius_min;
							o.show_detail = false;
						}
						else if (o.radius > radius_max)
							o.radius = radius_max;
						else if (o.radius < radius_max * 0.5)
							o.show_detail = false;
					}


					var nodes = [];
					//convert obj 2 Array
					for (var i in obj) {
						var n = obj[i];
						n.index = nodes.length;
						nodes.push(n);
					}

					//update index of source and target
					var links = data;
					for (var i = 0; i < data.length; i++) {
						var msg = data[i];
						obj[msg.target].link_count++;
						obj[msg.source].link_count++;

						msg.source = obj[msg.source].index;
						msg.target = obj[msg.target].index;

						//line width of the links
						msg.weight = msg[col.id];

						if (data.length == 1)
							msg.weight = 1.25;
						else {
							msg.weight = msg.weight / max_val * 10;
							if (msg.weight < 1)
								msg.weight = 1;
						}
						//label
						msg.label = MMTDrop.tools.formatDataVolume(msg[col.id], true) + "  >>"; // + " ->";
					}

					//Set up the force layout
					var force = d3.layout.force()
						.gravity(0.1)
						//.charge(function(d, i) { return i ? 0 : 2000; })
						.charge(-1000)
						.friction(0.7)
						.linkDistance(function(d) {
							return 70 + d.source.radius + d.target.radius;
						})
						//.gravity(.7)
						.size([width, height]);

					//Creates the graph data structure out of the json data
					force.nodes(nodes)
						.links(links)
						.start();

					//Create all the line svgs but without locations yet
					var link = svg.selectAll(".link")
						.data(links)
						.enter()
						.append("g")
						.attr("class", "link")
						;
					link.append("path")
						//                  .style("marker-end",  function( d ){
						//                    if( d.weight >= 1.5 )
						//                      return "url(#arrowhead2)";
						//                    return "url(#arrowhead1)";
						//                  })
						.style("stroke-width", function(d) {
							return d.weight;
						})
						.style("stroke-dasharray", function(d) {
							return "3,0";
						})
						.style("stroke-linejoin", "miter")
						.attr('id', function(d, i) { return 'edgepath' + i })
						;
					link.append("text")
						.attr("dx", function(d) {
							return d.source.radius + 10;
						})
						.attr("dy", function(d) {
							return -(d.weight + 3);
						})
						.attr("opacity", 0)
						.append("textPath")
						.text(function(d) { return d.label })
						.attr('xlink:href', function(d, i) { return '#edgepath' + i })
						.style("pointer-events", "none")
						;

					var is_draging = false;
					//Do the same with the circles for the nodes - no
					var node = svg.selectAll(".node")
						.data(nodes)
						.enter()
						.append("g")
						.attr("class", "node")
						.on('mouseover', function(d) {
							if (is_draging === true)
								return;

							//Reduce the opacity of all but the neighbouring nodes
							node.style("opacity", function(o) {
								return d.index == o.index
									//|| d.index==o.data.target.index || d.index==o.data.source.index
									//|| d.data.target.index==o.index || d.data.source.index==o.index 
									? 1 : 0.1;
							});

							link.style("opacity", function(o) {
								if (d.index == o.source.index || d.index == o.target.index) {
									return 1;
								}
								return 0.1;
							});

							if (d.link_count > 20)
								return;

							link.selectAll("text").style("opacity", function(o) {
								if (d.index == o.source.index || d.index == o.target.index) {
									return 1;
								}
								return 0;
							});
						})
						.on('mouseout', function() {
							//Put them back to opacity=1
							node.style("opacity", 1);
							link.style("opacity", 1);
							link.selectAll("text").style("opacity", 0);
						})
						.call(
							d3.behavior.drag()
								.on("dragstart", function(d, i) {
									d.draging = true;
									is_draging = true;
									d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
									force.stop() // stops the force auto positioning before you start dragging
								})
								.on("drag", function(p, i) {
									//ensure that the nodes do not go outside
									var x = d3.event.dx,
										y = d3.event.dy;

									p.px += x;
									p.py += y;
									p.x += x;
									p.y += y;

									var r = 15;
									if (p.y > height - r)
										p.y = height - r;
									if (p.y < r)
										p.y = r;
									if (p.x > width - r)
										p.x = width - r;
									if (p.x < r)
										p.x = r;

									if (p.py > height - r)
										p.py = height - r;
									if (p.py < r)
										p.py = r;
									if (p.px > width - r)
										p.px = width - r;
									if (p.px < r)
										p.px = r;

									updatePosition();
								})
								.on("dragend", function(d, i) {
									d.draging = false;
									is_draging = false;
									force.resume();
								})
						)
						;

					node.append("circle")
						.attr("r", function(d) {
							return d.radius;
						})
						.style("fill", function(d) {
							if (d.is_local)
								return "green";
							else
								return "orange";
						})
						.on('dblclick', function(d) {
							d.fixed = false;
						})
						;

					let _ipLabel = node.append("text")
						.attr("dx", function(d) {
							return d.radius + 5;
						})
						.attr("dy", ".35em")
						.text(function(d) {
							//IP
							return d.name
						})
						;

					//allow to click only when we can goto detail of this IP
					if (!disableDetail())
						_ipLabel
							.on("click", function(d) {
								MMTDrop.tools.reloadPage("ip=" + d.name);
							})
							.append("title").text("click here to view detail of this IP");
					;

					node.append("text")
						.attr("text-anchor", "middle")
						.attr("dy", ".35em")
						.attr("fill", "white")
						.text(function(d) {
							if (!d.show_detail && (d.name != NO_IP || d.name != MICRO_FLOW))
								return "";
							return d.text;
						})
						.on('dblclick', function(d) {
							d.fixed = false;
						})
						;

					function updatePosition() {
						//                  if (force.alpha() < 0.01) 
						//                      return;

						link.selectAll("path")
							.attr("d", function(d) {
								var dr = 0;
								return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
							})
							;
						//label of each link

						node.selectAll("circle")
							.attr("cx", function(d) {
								//fix 2 nodes
								if (d.name == MICRO_FLOW || d.name == NO_IP)
									return d.x = 10 + d.radius;
								return d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
							})
							.attr("cy", function(d) {
								//fix 2 nodes
								if (d.name == MICRO_FLOW)
									return d.y = 10 + d.radius;
								if (d.name == NO_IP)
									return d.y = 50 + d.radius;

								return d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
							})
							.style("stroke", function(d) {
								if (d.fixed)
									return "red";
								return "grey";
							})
							;
						node.selectAll("text")
							.attr("x", function(d) {
								return d.x;
							})
							.attr("y", function(d) {
								return d.y;
							})
							;
					}

					//Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
					force.on("tick", updatePosition);

					//style of end-arrow
					svg.append('defs')
						.append('marker')
						.attr({
							'id': 'arrowhead2',
							'refX': 10,
							'refY': 3,
							'orient': 'auto',
							'markerWidth': 3,
							'markerHeight': 6,
						})
						.append('svg:path')
						.attr('d', 'M0,0 V6 L3,3 Z')
						.attr('fill', '#1f77b4')
						;
					svg.append('defs')
						.append('marker')
						.attr({
							'id': 'arrowhead1',
							'refX': 15,
							'refY': 3,
							'orient': 'auto',
							'markerWidth': 3,
							'markerHeight': 6,
						})
						.append('svg:path')
						.attr('d', 'M0,0 V6 L3,3 Z')
						.attr('fill', '#1f77b4')
						;
					//---End style



					return svg;
				}("#" + elemID, data);
			});//end topoChart

		//get data

		var database = MMTDrop.databaseFactory.createStatDB({
			collection: "data_link", action: "aggregate",
			query: [], raw: true
		});
		database.updateParameter = function(param) {

			//mongoDB aggregate
			var group = { _id: {} };
			[COL.IP_SRC.id, COL.IP_DST.id].forEach(function(el, index) {
				group["_id"][el] = "$" + el;
			});
			[COL.DATA_VOLUME.id, COL.ACTIVE_FLOWS.id, COL.PACKET_COUNT.id, COL.PAYLOAD_VOLUME.id].forEach(function(el, index) {
				group[el] = { "$sum": "$" + el };
			});
			[COL.IP_SRC.id, COL.IP_DST.id].forEach(function(el, index) {
				group[el] = { "$first": "$" + el };
			});

			var $match = get_match_query();
			if ($match.collection != undefined) {
				param.collection = $match.collection;
				param.no_group = true;
			}
			else
				group._id = "$link";

			const sort = {};
			sort[COL.DATA_VOLUME.id] = -1;

			param.query = [{ $match: $match.match }, { $group: group }, { $sort: sort }, { $limit: LIMIT }];
		}

		var fMetric = MMTDrop.filterFactory.createMetricFilter();
		var report = new MMTDrop.Report(
			// title
			null,
			// database
			database,
			// filers
			[fMetric],
			//charts
			[{ charts: [topoChart], width: 12 }],
			//order of data flux
			[{
				object: fMetric,
				effect: [{
					object: topoChart
				},]
			}]
		);

		return report;
	},

	createTrafficReport: function() {
		const _this = this;
		const fMetric = MMTDrop.filterFactory.createMetricFilter();

		var cLine = MMTDrop.chartFactory.createTimeline({
			getData: {
				getDataFn: function(db) {
					var col = fMetric.selectedOption();
					var cols = [];


					var period = fPeriod.getDistanceBetweenToSamples();

					var ylabel = col.label;

					if (col.id === MMTDrop.constants.StatsColumn.PACKET_COUNT.id) {
						ylabel += " (pps)";
					} else if (col.id === MMTDrop.constants.StatsColumn.ACTIVE_FLOWS.id) {
						ylabel += " (total)";
						period = 1;
					} else {
						period /= 8; //  bit/second
						ylabel += " (bps)";
					}

					cols.push(col);

					var obj = {};
					var data = db.data();

					for (var i in data) {
						var msg = data[i];
						var proto = msg[COL.APP_ID.id];
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
							//first time
							if (!exist)
								obj[time][id] = 0;

							var val = (msg[id] != undefined) ? msg[id] : 0;

							//use 99 for noIP
							//100 for IP
							if (cols[j].isNoIP === true && msg[0] == 99
								|| cols[j].isNoIP !== true && msg[0] == 100) {
								obj[time][id] += val;
							}
						}
					}

					//divide to get bit/second
					if (period != 1)
						for (var time in obj) {
							for (var j in cols)
								obj[time][cols[j].id] /= period;
						}

					cols.unshift(COL.TIMESTAMP);

					var $widget = $("#" + cLine.elemID).getWidgetParent();
					var height = $widget.find(".grid-stack-item-content").innerHeight();
					height -= $widget.find(".filter-bar").outerHeight(true) + 15;

					return {
						data: obj,
						columns: cols,
						ylabel: ylabel,
						height: height,
						addZeroPoints: {
							time_id: 3,
							time: status_db.time,
							sample_period: 1000 * fPeriod.getDistanceBetweenToSamples(),
							probeStatus: status_db.probeStatus
						},
					};
				}
			},

			chart: {
				data: {
					type: "line"//step
				},
				color: {
					pattern: ['green']
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
				},
				zoom: {
					enabled: false,
					rescale: false
				},
				tooltip: {
					format: {
						title: _this.formatTime
					}
				},
			},

			afterRender: function(chart) {
				//register resize handle
				var $widget = $("#" + chart.elemID).getWidgetParent();
				$widget.on("widget-resized", function(event, $widget) {
					var height = $widget.find(".grid-stack-item-content").innerHeight();
					height -= $widget.find(".filter-bar").outerHeight(true) + 15;
					chart.chart.resize({
						height: height
					});
				});
			}
		});

		var dataFlow = [{
			object: fMetric,
			effect: [{
				object: cLine
			}]
		}];

		//get true-traffic given by mmt-probe
		var $match = {
			//isGen: false //not for the data_total collection
		};
		var group = { _id: {} };
		[COL.TIMESTAMP.id, COL.FORMAT_ID.id].forEach(function(el) {
			group["_id"][el] = "$" + el;
		});
		[COL.DATA_VOLUME.id, COL.PACKET_COUNT.id]
			.forEach(function(el) {
				group[el] = { "$sum": "$" + el };
			});
		[COL.TIMESTAMP.id, COL.FORMAT_ID.id].forEach(function(el) {
			group[el] = { "$last": "$" + el };
		});
		var database = new MMTDrop.Database({
			collection: "data_total", action: "aggregate",
			query: [{ "$match": $match }, { "$group": group }]
		});

		var report = new MMTDrop.Report(
			// title
			null,

			// database
			database,

			// filers
			[fMetric],

			// charts
			[
				{
					charts: [cLine],
					width: 12
				},
			],

			//order of data flux
			dataFlow
		);
		return report;
	},
	formatTime : function( date ){
          return moment( date.getTime() ).format( fPeriod.getTimeFormat() );
    },
}


//show hierarchy URL parameters on toolbar
$(breadcrumbs.loadDataFromURL);
