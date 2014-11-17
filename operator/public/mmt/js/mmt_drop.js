/** Class: MMTDrop
 *  An object container for all MMTDrop library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */

MMTDrop = {

	/** Constant: VERSION
	 *  The version of the MMTDrop library.
	 */
	VERSION : "1.0.0",
};

MMTDrop.RT = function() {
        this.eventCallback = [];
        var socket = new io.connect('');

        socket.on('connect', function() {
            console.log("Connected");
        });

        var self = this;
        socket.on('message', function(message){
            var msg = JSON.parse(message);
            for( var c in self.eventCallback[msg.data.id] ) {
                self.eventCallback[msg.data.id][c].clb(msg, self.eventCallback[msg.data.id][c].options);
            }
        }) ;

        socket.on('disconnect', function() {
            console.log('disconnected');
            content.html("<b>Disconnected!</b>");
        });
};

MMTDrop.RT.prototype = {
  addListener : function(event, clb, args) {
    if(! this.eventCallback[event]) {
      this.eventCallback[event] = [{clb: clb, args: args}];
    }else {
      this.eventCallback[event].push({clb: clb, args: args});
    }
  } 
};

/**
 * Class: MMTDrop.DataFactory
 * An object container for all the data creation functions.
 */
MMTDrop.ReportFactory = {
    createHTTPRequestsReport: function(elemid, gstats) {
        report = new MMTDrop.Reports({
            'stats': gstats,
            'elemid': elemid,
            'title': "HTTP Transactions Log",
            'elements': [
               {'chart': [
                 {
                   'type':'table',
                   'options': {
                      'colnames': ["Hostname", "Method", "Response", "Resp Time", "URI", "User Agent", "Content Type/Len"],
                      'getDataFct': MMTDrop.DataFactory.createHTTPLog,
                    }
                  }],
                  'pos': [0, 12]
               },
           ],
        });
        return report;
    },  
        
    createAverageHTTPResponseTimeReport: function(elemid, gstats) {
        report = new MMTDrop.Reports({
            'stats': gstats,
            'elemid': elemid,
            'title': "HTTP Responsivness",
            'elements': [
               {'chart': [
                 {
                   'type':'timeline',
                   'options': {
                      'getDataFct': MMTDrop.DataFactory.createAverageHTTPResponseTime,
                      'seriesName': "response time",
                      'ylabel': "Response time (ms)"
                    }
                  }],
                  'pos': [0, 12]
               },
           ],
        });
        return report;
    },

    createTcpReport: function(elemid, gstats) {
        report = new MMTDrop.Reports({
            'stats': gstats,
            'elemid': elemid,
            'title': "TCP SYN Report",
            'elements': [
               {'chart': [
                 {
                   'type':'timeline',
                   'options': {
                      'getDataFct': MMTDrop.DataFactory.createActiveConnectionsData,
                      'seriesName': "TCP SYNs",
                      'ylabel': "Response time (ms)"
                    }
                  }],
                  'pos': [0, 12]
               },
           ],
        });
        return report;
    },

	createBamQualityReport: function(elemid, gstats) {
		report = new MMTDrop.Reports({
				'stats': gstats,
				'elemid': elemid,
				'title': "e-Service Quality Report",
				'elements': [
                    {'chart': [
                        {
                            'type':'timeline',
                            'options': {
                                'getDataFct': MMTDrop.DataFactory.getQIReport,
                                'seriesName': "Quality Index",
                                'ylabel': "Quality Index (MOS)"
                            }
                        }
                    ],
					'pos': [0, 12]},
				],
				'filter': [
                            {'type': 'eService', 'select': function(e, f){f.eservice = e;},
                                'setData': function(filter_model, report_filter) {
                                    var data = ['All'];
                                    for (i in gstats.model.services) {
                                        data.push(gstats.model.services[i].name);
                                    }
                                    filter_model.data = data;
                                    report_filter.eservice = data[0];
                                }
                            },
                            {'type': 'Period', 'select': function(e, f){f.period = e;},
                                'setData': function(filter_model, report_filter) {
                                    var data = ['30 minutes', '1 Day', '1 Week', '1 Month', '1 Year'];
                                    filter_model.data = data;
                                    report_filter.period = data[0];
                                }
                            }
                          ]
			});
		return report;
	},

	createBamProcessesReport: function(elemid, gstats) {
		report = new MMTDrop.Reports({
				'stats': gstats,
				'elemid': elemid,
				'title': "e-Service Processes Report",
				'elements': [
					{'chart': [{
                        'type':'tree',
                        'options': {
                            'colnames': ["Element"],
                            'getDataFct': MMTDrop.DataFactory.createServiceResourcesTree,
                            'multiSelect': 0, //0 single select, 1 multi select, 2 multi select with criteria
                            'click': function(ev){
                                var apppaths = [];
                                for(p in ev.data.path) {
                                    apppaths.push(ev.data.path[p]);
                                }
                                ev.data.chart.report.setFilter({'apppaths': apppaths});
                                ev.data.chart.report.updateElement(1);
                            },
                            //'link': function(row) {return  "#appreport?appname=" + MMTDrop.getAppName(row[0].toString());}
                            //'dblclick': function(ev){
                            //        window.location = "#appreport?appname=" + MMTDrop.getAppName(ev.data.path.toString());
                            //}
                        }
                    }],
                    'pos': [0, 4]},
                    {'chart': [
                        {
                            'type':'timeline',
                            'options': {
                                'getYlabel': function(filter) {
                                    if(filter.apppaths.length) {
                                        var r = new MMTDrop.ServiceResource(filter.apppaths[0], "-");
                                        if(r.resource_value) {
                                            return 'Seconds';
                                        }else {
                                            return 'Number';
                                        }
                                    }
                                    return '';
                                },
                                'getDataFct': MMTDrop.DataFactory.getProcessTimelineReport
                            }
                        },
                        {
                            'type':'funnel',
                        	'options': {
                                'getDataFct': MMTDrop.DataFactory.getProcessFunnelReport
                            }
                        },
                        /*
                        {
                            'type':'pie',
                        	'options': {
                                'getDataFct': MMTDrop.DataFactory.getProcessPieReport
                            }
                        },
                        */
                    ],
					'pos': [0, 8]},
				],
				'filter': [
                            {'type': 'Period', 'select': function(e, f){f.period = e;},
                                'setData': function(filter_model, report_filter) {
                                    var data = ['30 minutes', '1 Day', '1 Week', '1 Month', '1 Year'];
                                    filter_model.data = data;
                                    report_filter.period = data[0];
                                }
                            }
                          ]
			});
		return report;
	},

	createBamResponseReport: function(elemid, gstats) {
		report = new MMTDrop.Reports({
				'stats': gstats,
				'elemid': elemid,
				'title': "e-Service Responsivness Report",
				'elements': [
                    {'chart': [
                        {
                            'type':'timeline',
                            'options': {
                                'getDataFct': MMTDrop.DataFactory.getResponseTimelineReport,
                                'seriesName': "Packet Count",
                                'ylabel': "Seconds"
                            }
                        },
                    ],
					'pos': [0, 12]},
				],
				'filter': [
                            {'type': 'eService', 'select': function(e, f){f.eservice = e;},
                                'setData': function(filter_model, report_filter) {
                                    var data = [];
                                    for (i in gstats.model.services) {
                                        data.push(gstats.model.services[i].name);
                                    }
                                    filter_model.data = data;
                                    report_filter.eservice = data[0];
                                }
                            },
                            {'type': 'Period', 'select': function(e, f){f.period = e;},
                                'setData': function(filter_model, report_filter) {
                                    var data = ['30 minutes', '1 Day', '1 Week', '1 Month', '1 Year'];
                                    filter_model.data = data;
                                    report_filter.period = data[0];
                                }
                            }
                        ]
			});
		return report;
	},

};

MMTDrop.ServiceResource = function(path, seperator) {
    this.eservice = null;
    this.resource = null;
    this.resource_value = null;
    var n = path.indexOf(seperator);
    if (n == -1) {
        this.eservice = path;
    } else {
        this.eservice = path.substring(0, n);
        var p = path.substring(n + 1, path.length);
        var m = p.indexOf(seperator);
        if(m == -1) this.resource = p;
        else {
            this.resource = p.substring(0, m);
            this.resource_value = p.substring(m + 1, p.length);
        }
    }
};

/** Class: MMTDrop.Reports
 *  An object container for all MMTDrop.Reports functions.
 */
MMTDrop.Reports = function(options) {
	this.elements = [];
	this.elempos = [];
	this.filters = [];
	this.active_chart = 0;
	this.stats = options.stats;
	this.elemid = options.elemid;
	this.title = options.title;
	this.isInit = false;
	this.filter = {};
	this.linepos = 0;

	for(elem in options.elements) {
		var elemopts = options.elements[elem];
		elemopts.elemid = this.elemid + '_elem' + elem;
		elem = this.initElement(elemopts);
		for (i in elemopts.chart) {
			var chartopts = elemopts.chart[i];
			var type = chartopts.type;
			var opt = chartopts.options;
            opt.report = this;
			opt.type = type;
			opt.gstats = this.stats;
			opt.elemid = elemopts.elemid + '_chart';
			if (chartopts.isdefault) {
				elem.active_chart = i;
			}
			this.initChart(elem, opt);
		}
	}

	for (i in options.filter) {
		this.initFilter(options.filter[i]);
	}
};

MMTDrop.Reports.prototype = {
	/**
	 * Renders the report 
	 */
	render : function(filter) {
		this.setFilter(filter);

		if (this.isInit) {
			this.updateElements();
			return;
		}
		this.setInit();

        report_header =  $('<div>', {
            'class': 'row-fluid'
        });
        report_header.appendTo($('#' + this.elemid));

        if(this.title) {
            report_title = $('<div>', {'class': 'report_title', 'text': this.title});
            report_title.appendTo(report_header);
        }

        control_row = $('<div>', {'class': 'span4 pull-right'});
        control_row.appendTo(report_header);

        for (i in this.filters) {
            var fdiv = $('<div>', {'class': 'input-prepend span6 pull-right'});
            var span = $('<span>', {'class': 'add-on', 'text': i});
            var ftr = $('<select>', {
                'id' : this.elemid + '_ftr_' + i,
                'class' : 'btn span8'
            });
            for (j in this.filters[i].data) {
                var opt = $('<option>', {
                    'text' : this.filters[i].data[j],
                    'value' : this.filters[i].data[j]
                });
                opt.appendTo(ftr);
            }
            span.appendTo(fdiv);
            ftr.appendTo(fdiv);
            fdiv.appendTo(control_row);
        }
        
		elemcount = 0;
		for(l in this.elempos) {
			var line = $('<div>', {
				'class': 'row-fluid'
			});
			line.appendTo($('#' + this.elemid));
			for(e in this.elempos[l]) {
				var row = $('<div>', {
					'class': 'span' + this.elempos[l][e].width
				});
				row.appendTo(line);
				elem = this.elempos[l][e].elem;
				var elem_div = $('<div>', {
						'id' :elem.elemid,
						'class': 'report-element'
					});
				elem_div.appendTo(row);
				
				if (elem.buttons.length > 1) {
					var btngroup = $('<div>', {
						'id' : elem.elemid + '_btngrp',
						'class' : 'report-element-top btn-group center'
					});
					for (i in elem.buttons) {
						var btn = $('<button>', {
							'id' : elem.elemid + '_btn_' + i,
							'class' : 'btn btn-large',
							//'text' : elem.buttons[i]
						}).append(this.getChartTypeIconByName(elem.buttons[i]));
						btn.appendTo(btngroup);
					}
					btngroup.appendTo(elem_div);
				}


				var chart = $('<div>', {
					'id' : elem.elemid + '_chart',
				});

				chart.appendTo(elem_div);
				elem.charts[elem.active_chart].render(this.filter);
			
				if (elem.buttons.length > 1) {
					for (i in elem.buttons) {
						$('#' + elem.elemid + '_btn_' + i).click({
							bid : i,
							elemid : elemcount,
							elem : elem,
							report : this
						}, function(e) {
							if (e.data.elem.chartchange) {
								e.data.elem.chartchange(e.data.bid);
							}
							if (e.data.bid == e.data.elem.active_chart) {
								return;
								//same chart, do nothing
							} else {
								e.data.report.updateChart(e.data.elemid, e.data.bid);
							}
						});
					}
				}
				elemcount ++;
			}
		}

		for (i in this.filters) {
			$('#' + this.elemid + '_ftr_' + i).change({
				fid : i,
				report : this
			}, function(e, ui) {
				if (e.data.report.filters[e.data.fid].select) {
					e.data.report.filters[e.data.fid].select($(this).find('option:selected').val(), e.data.report.filter);
				}
				if (e.data.fid === 'appname') {
					e.data.report.filter.appname = $(this).find('option:selected').val();
				} else if (e.data.fid === 'metric') {
					e.data.report.filter.metric = $(this).find('option:selected').val();
				} else if (e.data.fid === 'appclass') {
					e.data.report.filter.appclass = $(this).find('option:selected').val();
				}
				e.data.report.updateElements();
			});
		}
	},

	/**
	 * Updates the report chart at index id  
	 */
	updateChart : function(elemid, id) {
		elem = this.elements[elemid];
		var old_chart = elem.charts[elem.active_chart];
		old_chart.destroy();
		elem.charts[id].render(this.filter);
		elem.active_chart = id;
	},

	/**
	 * Updates the report element at index id  
	 */
	updateElement : function(id) {
		this.updateChart(id, this.elements[id].active_chart);
	},
	
	/**
	 * Updates the report elements  
	 */
	updateElements : function() {
		for(id in this.elements) {
			this.updateElement(id);
		}
	},
	
	/**
	 * Initializes a report chart based on the given options 
	 */
	initChart : function(elem, options) {
		if (options.type == "bar") {
			elem.charts.push(new MMTDrop.Reports.Chart(options));
			elem.buttons.push(options.type);
		} else if (options.type == "pie") {
			elem.charts.push(new MMTDrop.Reports.Chart(options));
			elem.buttons.push(options.type);
		} else if (options.type == "tree") {
			elem.charts.push(new MMTDrop.Reports.Chart(options));
			elem.buttons.push(options.type);
		} else if (options.type == "table") {
			elem.charts.push(new MMTDrop.Reports.Chart(options));
			elem.buttons.push(options.type);
		} else if (options.type == "timeline") {
			elem.charts.push(new MMTDrop.Reports.Chart(options));
			elem.buttons.push(options.type);
		} else if (options.type == "funnel") {
			elem.charts.push(new MMTDrop.Reports.Chart(options));
			elem.buttons.push(options.type);
		}
	},

	/**
	 * Initializes a report element based on the given options 
	 */
	initElement : function(options) {
		this.elements.push({charts: [], buttons: [], active_chart: 0, elemid: options.elemid,
			chartchange: options.chartchange});
		if(options.pos) {
			if(this.elempos[options.pos[0]]) {
				this.elempos[options.pos[0]].push({width: Math.min(options.pos[1], 12), elem: this.elements[this.elements.length -1]});
			} else {
				this.elempos[options.pos[0]] = [];
				this.elempos[options.pos[0]].push({width: Math.min(options.pos[1], 12), elem: this.elements[this.elements.length -1]});
			}
			this.linepos = Math.max(this.linepos, options.pos[0]);
		}else {
			this.linepos += 1;
			this.elempos[this.linepos] = {width: 12, elem: this.elements[this.elements.length -1]};
		}
		return this.elements[this.elements.length -1];
	},

	/**
	 * Initializes a report filter 
	 */
	initFilter : function(options) {
		if (options.type) {
			this.filters[options.type] = {
				type : options.type
			};
			if (options.select) {
				this.filters[options.type].select = options.select;
			}
            
            if(options.setData) {
                options.setData(this.filters[options.type], this.filter);
            }else {
                if (options.type == "appname") {
                    data = [];
                    data[0] = 'All';
                    this.filters[options.type].data = data.concat(this.stats.getActiveAppNames());
                    this.filter.appname = 'All';
                    this.filter.appid = MMTDrop.ProtocolsNameID[this.filter.appname];				
                } else if (options.type == "appclass") {
                    data = [];
                    data[0] = 'All';
                    this.filters[options.type].data = data.concat(this.stats.getActiveAppCategoriesNames());
                    //this.filter.appclass = this.filters[options.type].data[0]; 
                    this.filter.appclass = 'All';
                    this.filter.appclassid = MMTDrop.CategoriesNamesMap[this.filter.appclass]; 
                } else if (options.type == "metric") {
                    this.filters[options.type].data = MMTDrop.MetricID2Name;
                    this.filter.metric = MMTDrop.MetricID2Name[MMTDrop.MetricId.DATA_VOLUME];
                }
            }
        }
	},

	/**
	 * Sets a filter option (control option) 
	 */
	setFilter : function(filter) {
		if (filter) {
            for(f in filter) {
                if ((f === "appname") && (this.filter.appname != filter.appname)) {
				    this.filter.appname = filter.appname;
				    this.filter.appid = MMTDrop.ProtocolsNameID[filter.appname];
				    //Update the filter if it exists
				    $('#' + this.elemid + '_ftr_appname').val(filter.appname);
                } else if ((f === "metric") && (this.filter.metric != filter.metric)) {
				    this.filter.metric = filter.metric;
				    this.filter.metricid = MMTDrop.MetricName2ID[filter.metric];
				    //Update the filter if it exists
				    $('#' + this.elemid + '_ftr_metric').val(filter.metric);
                } else if ((f === "appclass") && (this.filter.appclass != filter.appclass)) {
				    this.filter.appclass = filter.appclass;
				    this.filter.appclassid = MMTDrop.CategoriesNamesMap[filter.appclass];
				    //Update the filter if it exists
				    $('#' + this.elemid + '_ftr_appclass').val(filter.appclass);
                } else if(!(f === "appclassid" || f === "metricid" || f === "appid") &&  this.filter[f] != filter[f]) {
                    this.filter[f] = filter[f];
                }
            }
		}
	},

    getChartTypeIconByName: function(name) {
        if(name === 'pie') return $('<i>', {'class': 'glyphicons-pie'});
        if(name === 'bar') return $('<i>', {'class': 'glyphicons-bar'});
        if(name === 'timeline') return $('<i>', {'class': 'glyphicons-chart'});
        if(name === 'tree') return $('<i>', {'class': 'glyphicons-table'});
        if(name === 'table') return $('<i>', {'class': 'glyphicons-table'});
        if(name === 'funnel') return $('<i>', {'class': 'glyphicons-filter'});
    },
    
	/**
	 * Sets this report to initialized state 
	 */
	setInit : function() {
		this.isInit = true;
	},
	
	/**
	 * Sets the report to non initilaized state
	 */
	resetInit : function() {
		this.isInit = false;
	},

	/**
	 * Destroys the report  
	 */
	destroy : function() {
		for (i in this.elements) {
			elem = this.elements[i];
			elem.charts[elem.active_chart].destroy();
		}
		this.isInit = this.resetInit();
		$('#' + this.elemid).empty();
	},
};

MMTDrop.Reports.Chart = function(options) {
	this.type = options.type;
	this.appstats = options.gstats;
	this.elemid = options.elemid;
	this.colnames = options.colnames;
	this.title = options.title;
	this.getdata = options.getDataFct;
    this.getdatargs = null;
    this.multiselect = 0;
    if(options.multiSelect)  {
        this.multiselect = options.multiSelect;
    }
    if(options.getDataArgs) {
	    this.getdatargs = options.getDataArgs;
    }
	this.ylabel = options.ylabel;
	this.seriesName = options.seriesName;
    this.report = null;
    if(options.report) {
        this.report = options.report;
    }

	this.click = null;
	this.dblclick = null;
    this.link = null;

	if (options.click) {
		this.click = options.click;
	}
	if (options.dblclick) {
		this.dblclick = options.dblclick;
	}
    if (options.link) {
        this.link = options.link;
    }
	this.filter = {};
	this.isInit = false;

	var oTable = null;
	this.chart = null;
    
    if(options.getYlabel) this.getYlabel = options.getYlabel;
    else this.getYlabel = function(filter) {return '';};
};

MMTDrop.Reports.Chart.prototype = {
	/**
	 * Renders the chart 
	 */
	render : function(filter) {
		this.setFilter(filter);

		if (this.isInit)
			return;
		this.setInit();
        
        this.getData();
	},

	doRender : function(data, chart) {
		if (chart.type == "bar") {
			chart.render_bar(data);
		} else if (chart.type == "pie") {
			chart.render_pie(data);
		} else if (chart.type == "tree") {
			chart.render_tree(data);
		} else if (chart.type == "table") {
			chart.render_table(data);
		} else if (chart.type == "timeline") {
			chart.render_timeline(data);
		}else if (chart.type == "funnel") {
			chart.render_funnel(data);
		}
	},

	doUpdate : function(data, chart) {
		if (chart.type == "bar") {
			chart.chart.addSeries(data);
		} else if (chart.type == "pie") {
			chart.chart.addSeries(data);
		} else if (chart.type == "tree") {
			
		} else if (chart.type == "table") {
			
		} else if (chart.type == "timeline") {
			chart.chart.addSeries(data);
		}else if (chart.type == "funnel") {
			chart.chart.addSeries(data);
		}
	},
    
    doRenderError: function(err, chart) {
        var alertMessage = $("<div/>", {
            class: 'alert'
        }).html('<h4>Warning!</h4><br> ' + err);
        alertMessage.appendTo($('#' + chart.elemid));
    },
    
    getData : function() {
        this.getdata({stats: this.appstats, filter: this.filter, args: this.getdatargs, chart: this, success: this.doRender, update: this.doUpdate, error: this.doRenderError});
    },
    
	/**
	 * Renders tree table chart
	 */
	render_tree : function(data) {
        var treeWrapper = $('<div>', {
            'class' : 'report-element-tree'                                         
        });
        
		var treetable = $('<table>', {
			'id' : this.elemid + '_treetable',
			'cellpadding' : 0,
			'cellspacing' : 0,
			'border' : 0
		});
		var caption = $('<caption>');
		var expand = $('<a>', {
			'href' : '#',
			'class' : 'btn',
			'onclick' : 'jQuery("#' + this.elemid + '_treetable").treetable("expandAll"); return false;',
			'text' : 'Expand All'
		});
		var collapse = $('<a>', {
			'href' : '#',
			'class' : 'btn',
			'onclick' : 'jQuery("#' + this.elemid + '_treetable").treetable("collapseAll"); return false;',
			'text' : 'Collapse All'
		});
		expand.appendTo(caption);
		collapse.appendTo(caption);
		var thead = $('<thead>');
		var tr = $('<tr>');
		for ( i = 0; i < this.colnames.length; i++) {
			var th = $('<th>', {
				'text' : this.colnames[i]
			});
			th.appendTo(tr);
		}

		tr.appendTo(thead);
		var tbody = $('<tbody>');
		var arrData = data;
		for (i in arrData) {
			if (arrData[i].length >= 3) {
				var row_tr;
				if (arrData[i][0] == arrData[i][1]) {
					row_tr = $('<tr>', {
						'data-tt-id' : arrData[i][0]
					});
				} else {
					row_tr = $('<tr>', {
						'data-tt-id' : arrData[i][0],
						'data-tt-parent-id' : arrData[i][1]
					});
				}
                if(this.link == null) {
				    var row_name = $('<td>', {
    					'text' : arrData[i][2]
	    			});
                }else {
                    var row_name = $('<td>');
                    var row_name_link = $('<a>', {
                      'text' : arrData[i][2],
                      'href' : this.link(arrData[i])
                    });
                    row_name_link.appendTo(row_name);
                }
				row_name.appendTo(row_tr);
				
				for ( j = 3; j < Math.min(arrData[i].length, this.colnames.length + 2); j++) {
					var cell = $('<td>', {
						'text' : arrData[i][j]
					});
					cell.appendTo(row_tr);
				}
				row_tr.appendTo(tbody);
			}
		}

		thead.appendTo(treetable);
		tbody.appendTo(treetable);
		caption.appendTo(treetable);
        //append tretable to wrapper
        treetable.appendTo(treeWrapper);
        treeWrapper.appendTo($('#' + this.elemid));

		$("#" + this.elemid + "_treetable").treetable({
			expandable : true
		});
		$("#" + this.elemid + "_treetable").treetable("expandAll");

        if(this.multiselect == 2) {
    		$("#" + this.elemid + "_treetable tbody tr").click({
	    		chart : this
		    }, function(e) {
		        // Highlight selected row
                if ( $(this).hasClass('selected') ) {
                    $(this).removeClass('selected');
                }else {
                    if($(".selected").length) {
                        var this_id = String($(this).data("ttId"));
                        $(".selected").each(function(){
                            select_id = String($(this).data("ttId"));
                            if((MMTDrop.getGenericParent(select_id, "-") != MMTDrop.getGenericParent(this_id, "-")) && 
                                (MMTDrop.getGenericIdFromPath(select_id, "-") != MMTDrop.getGenericIdFromPath(this_id, "-"))) {
                                $(".selected").removeClass("selected");
                            }
                        });
                    }
                    $(this).addClass('selected');
                }
                var selection = [];
                $(".selected").each(function(){selection.push(String($(this).data("ttId")));});
			    if (e.data.chart.click) {
                    ev = {data: {chart: e.data.chart, path: selection}};
	    			e.data.chart.click(ev);
		    	}
		    });
        }else if(this.multiselect == 1) {
    		$("#" + this.elemid + "_treetable tbody tr").click({
	    		chart : this
		    }, function(e) {
		        // Highlight selected row
                if ( $(this).hasClass('selected') ) {
                    $(this).removeClass('selected');
                }else {
                    $(this).addClass('selected');
                }
                var selection = [];
                $(".selected").each(function(){selection.push(String($(this).data("ttId")));});
			    if (e.data.chart.click) {
                    ev = {data: {chart: e.data.chart, path: selection}};
	    			e.data.chart.click(ev);
		    	}
		    });
        }else {
            $("#" + this.elemid + "_treetable tbody tr").click({
                chart : this
            }, function(e) {
                // Highlight selected row
                $(".selected").not(this).removeClass("selected");
                $(this).addClass("selected");
                if (e.data.chart.click) {
                    var selection = [String($(this).data("ttId"))];
                    ev = {data: {chart: e.data.chart, path: selection}};
                    e.data.chart.click(ev);
                }
            });
        }

		$("#" + this.elemid + "_treetable tbody tr").dblclick({
			chart : this
		}, function(e) {
			if (e.data.chart.dblclick) {
                ev = {data: {chart: e.data.chart, path: String($(this).data("ttId"))}};
				e.data.chart.dblclick(ev);
			}
		});
        
        /* check if no path is selected, then to click in the first 'tr'
         * of the tree element
	     */
        apppaths = this.filter.apppaths;
        //Sets the first tr as the default view
        if(typeof apppaths  === 'undefined'){                   
            $("#" + this.elemid + "_treetable tbody tr:first").addClass("selected");
            selection = [];
            $("#" + this.elemid + "_treetable tbody tr:first").each(function(){selection.push(String($(this).data("ttId")));});
            if(this.report) this.report.filter.apppaths = selection;
        }else {
            for(p in apppaths) {
                 $("#" + this.elemid + "_treetable tbody tr").each(function(){if(String($(this).data("ttId")) == apppaths[p]) $(this).addClass("selected");});
            }
        }
	},

	/**
	 * Renders data table chart
	 */
	render_table : function(data) {
		var arrData = data;
		var cnames = [];
		for ( i = 0; i < this.colnames.length; i++) {
			if (i == 0) {
				cnames.push({
					"sTitle" : this.colnames[i]
				});
			} else {
				cnames.push({
					"sTitle" : this.colnames[i],
					//"fnRender" : function(obj) {
					//	var sReturn = obj.aData[obj.iDataColumn];
					//	var returnButton = "<div class='progress'><div class='bar' style='width: 60%;'></div></div>";
					//	return returnButton;
					//}
				});
			}
		}

		$('#' + this.elemid).html('<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered" id="' + this.elemid + '_datatable"></table>');
		this.oTable = $('#' + this.elemid + '_datatable').dataTable({
			//"sDom" : "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
            //"sDom": 'T<"clear">lfrtip',
            "sDom": "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
			"sPaginationType" : "bootstrap",
			"oLanguage" : {
				"sLengthMenu" : "_MENU_ records per page"
			},
			"aaData" : arrData,
			"aoColumns" : cnames,
            "oTableTools": {
                "aButtons": [
                    //"copy",
                    "print",
                    {
                        "sExtends":    "collection",
                        "sButtonText": "Save",
                        "aButtons":    [ "csv", "pdf" ]
                    }
                ]
            }
		});

		$('#' + this.elemid + ' tbody tr').dblclick({
			chart : this,
			eid : $('#' + this.elemid + '_datatable').dataTable()
		}, function(e) {
			if (e.data.chart.dblclick) {
				e.data.chart.dblclick($('td:eq(0)', this).html());
			}
		});
		$('#' + this.elemid + ' tbody tr').click({
			chart : this,
			eid : $('#' + this.elemid + '_datatable').dataTable()
		}, function(e) {
			if ($(this).hasClass('row_selected')) {
				$(this).removeClass('row_selected');
			} else {
				e.data.eid.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
			if (e.data.chart.click) {
				e.data.chart.click($('td:eq(0)', this).html());
			}
		});
	},

	/**
	 * Renders a bar chart 
	 */
	render_bar : function(data) {
		var arrData = data;
		if(arrData.series) {
			series = arrData.series;
		}else {
			series = arrData;
		}
		if(arrData.categories) {
			this.colnames = arrData.categories;
		}
		this.chart = new Highcharts.Chart({
			chart : {
				renderTo : this.elemid,
                borderColor: '#ccc',
                borderWidth: 1,
				defaultSeriesType : 'column',
				zoomType : 'xy',
                spacingTop:30,
                spacingRight:30 
			},
            navigation:{
                buttonOptions: {
                    verticalAlign: 'top',
                    y: -25,
                    x: 20
                }
            },
			title : {
				text : this.title
			},
            credits: {
                text: 'Montimage',
                href: 'http://www.montimage.com',
                position: {
                    align: 'right',
                    x: -40,
                    verticalAlign: 'top',
                    y: 20                             
                }   
            },
            legend: {
                enabled: false
            },            
			xAxis : {
				categories : this.colnames
			},
			yAxis : {
				title : {
					text : MMTDrop.getYLabel(this.filter)
				}
			},
			series : series
		});
	},

	/**
	 * Renders a pie chart 
	 */
	render_pie : function(data) {
		this.chart = new Highcharts.Chart({
			chart : {
				renderTo : this.elemid,
                borderColor: '#ccc',
                borderWidth: 1,
				type : 'pie',
                spacingTop:30,
                spacingRight:30
			},
            navigation:{
                buttonOptions: {
                    verticalAlign: 'top',
                    y: -25,
                    x: 20
                }
            },
            credits: {
                text: 'Montimage',
                href: 'http://www.montimage.com',
                position: {
                    align: 'right',
                    x: -40,
                    verticalAlign: 'top',
                    y: 20                             
                }   
            },
			tooltip : {
				formatter : function() {
					return '<b>' + this.point.name + '</b>: ' + this.y;
				}
			},
			plotOptions : {
				pie : {
					//startAngle : 270,
					allowPointSelect : true,
					cursor : 'pointer',
					dataLabels : {
						enabled : true,
						formatter : function() {
							return '<b>' + this.point.name + '</b>: ' + Highcharts.numberFormat(this.percentage, 2) + ' %';
						}
					},
					showInLegend : true,
					events : {
						click : function(event) {
						}
					},
					showInLegend : true
				}
			},
			title : {
				text : this.title
			},
			series : [{
				type : 'pie',
				name : this.seriesName,
				data : data
			}]
		});
	},

	/**
	 * Renders a timeline chart 
	 */
	render_timeline : function(data) {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
		this.chart = new Highcharts.Chart({
			chart : {
				renderTo : this.elemid,
                borderColor: '#ccc',
                borderWidth: 1,
                type : 'line',
				zoomType : 'xy',
                spacingTop:30,
                spacingRight:30
			},
            navigation:{
                buttonOptions: {
                    verticalAlign: 'top',
                    y: -25,
                    x: 20
                }
            },
            credits: {
                text: 'Montimage',
                href: 'http://www.montimage.com',
                position: {
                    align: 'right',
                    x: -40,
                    verticalAlign: 'top',
                    y: 20                             
                }   
            },
			xAxis : {
                maxZoom: 15000, // 15seconds
                gridLineWidth: 1,
				type : 'datetime'
			},
			yAxis : {
				title : {
                    text: this.ylabel || this.getYlabel(this.filter),
				},
				min : 0
			},
			title : {
				text : this.title?this.title:""
			},
            tooltip: {
                shared: true
            },
            plotOptions: {
                area: {
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    stacking: 'normal',
                },
                line: {
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },                    
                },
            },
			series : data
		});
	},

	/**
	 * Renders a funnel chart 
	 */
	render_funnel : function(data) {
		this.chart = new Highcharts.Chart({
			chart : {
				renderTo : this.elemid,
                borderColor: '#ccc',
                borderWidth: 1,
                type : 'funnel',
                spacingTop:30,
                spacingRight:30
			},
            navigation:{
                buttonOptions: {
                    verticalAlign: 'top',
                    y: -25,
                    x: 20
                }
            },
            credits: {
                text: 'Montimage',
                href: 'http://www.montimage.com',
                position: {
                    align: 'right',
                    x: -40,
                    verticalAlign: 'top',
                    y: 20                             
                }   
            },
			title : {
				text : this.title?this.title:""
			},
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b> ({point.y:,.0f})',
                        color: 'black',
                        softConnector: true
                    },
                    neckWidth: '25%',
                    neckHeight: '25%',
                    width: '60%'
                }
            },
            series : data
		});
	},

	/**
	 * Sets a filter options 
	 */
	setFilter : function(filter) {
		if (filter) {
            for(f in filter) {
			    if ((f === "appname") && (this.filter.appname != filter.appname)) {
				    this.filter.appname = filter.appname;
				    this.filter.appid = MMTDrop.ProtocolsNameID[filter.appname];
				    this.resetInit();
			    } else if ((f === "metric") && (this.filter.metric != filter.metric)) {
				    this.filter.metric = filter.metric;
				    this.filter.metricid = MMTDrop.MetricName2ID[filter.metric];
				    this.resetInit();
			    } else if ((f === "appclass") && (this.filter.appclass != filter.appclass)) {
				    this.filter.appclass = filter.appclass;
				    this.filter.appclassid = MMTDrop.CategoriesNamesMap[filter.appclass];
				    this.resetInit();
                } else if(!(f === "appclassid" || f === "metricid" || f === "appid") &&  this.filter[f] != filter[f]) {
                    this.filter[f] = filter[f];
                    this.resetInit();
                }
		    }
        }
	},

	/**
	 *Sets the chart to initialized state 
	 */
	setInit : function() {
		this.isInit = true;
	},

	/**
	 * Sets the chart to non initialized state
	 */
	resetInit : function() {
		this.isInit = false;
	},

	/**
	 * Destroys the chart 
	 */
	destroy : function() {
		this.isInit = 0;
		if (this.type == "bar") {
            if(this.chart) this.chart.destroy();
			this.chart = null;
		} else if (this.type == "pie") {
            if(this.chart) this.chart.destroy();
			this.chart = null;
		} else if (this.type == "tree") {
		} else if (this.type == "table") {
			$('#' + this.elemid + '_datatable').dataTable().fnDestroy();
		} else if (this.type == "timeline") {
            if(this.chart) this.chart.destroy();
			this.chart = null;
		}else if (this.type == "funnel") {
            if(this.chart) this.chart.destroy();
			this.chart = null;
		}
		$('#' + this.elemid).empty();
	},
};

/**
 * Class: MMTDrop.DataFactory
 * An object container for all the data creation functions.
 */
MMTDrop.DataFactory = {
    //'colnames': ["Hostname", "Method", "Response", "Resp Time", "URI", "User Agent", "Content Type/Len"],
    createHTTPLog : function(options) {
        if( !options.chart.data ) {
          options.chart.data = [];
          options.stats.rt.addListener('http.responsetime', function(msg, args){
            options.chart.data.push([
              msg.attributes.req.attributes['http.host'], 
              msg.attributes.req.data.value, 
              msg.attributes.rep.data.value,
              msg.data.value,
              msg.attributes.req.attributes['http.uri'], 
              msg.attributes.req.attributes['http.user_agent'], 
              msg.attributes.rep.attributes['http.content_type'] + ' / ' + msg.attributes.rep.attributes['http.content_len'] 
            ]);
            //options.chart.data.push([1, 2]);
          });
        }
        if(options.success) options.success(options.chart.data, options.chart);
    },

    createAverageHTTPResponseTime : function(options) {
        if( !options.chart.data ) {
          options.chart.data = [{name: 'response time', data: []}];
          options.stats.rt.addListener('http.responsetime', function(msg, args){
            options.chart.data[0].data.push([msg.ts, msg.data.value]);
            if(options.chart.chart) {
              //options.chart.chart.series[0].addPoint([msg.ts, msg.data.value]);
            }
          });
        }
        if(options.success) options.success(options.chart.data, options.chart);
    },
    createActiveConnectionsData : function(options) {
        if( !options.chart.data ) {
          options.chart.data = [{name: 'tcp_syn', data: []}, {name: 'tcp_established', data: []}];
          options.stats.rt.addListener('tcp.syn_received_', function(msg, args) {
            console.log("zifit");
            options.chart.data[0].data.push([msg.ts, msg.data.value]);
            if(options.chart.chart) {
              //options.chart.chart.series[0].addPoint([msg.ts, msg.data.value]);
            }
          });
          options.stats.rt.addListener('tcp.established', function(msg, args){
            options.chart.data[1].data.push([msg.ts, msg.data.value]);
            if(options.chart.chart) {
              //options.chart.chart.series[1].addPoint([msg.ts, msg.data.value]);
            }
          });
        }
        if(options.success) options.success(options.chart.data, options.chart);
    },
    createNewConnectionsData : function(options) {
        if(options.success) options.success({name: 'zifit', data: [[Date.now(), 19], [Date.now() + 9000, 12]]}, options.chart);
    },
    createConnectionsNotYetAcknowlegedData : function(options) {
        if(options.success) options.success({name: 'zifit', data: [[Date.now(), 19], [Date.now() + 9000, 12]]}, options.chart);
    },

    getEserviceId: function(services, service) {
        for(i in services) {
            if(services[i].name === service) return services[i].id
        }
    },

    getQIReport : function(options) {
        options.type = 'timeline';
        options.metric = 'QualityIndex';
        options.bubble = false;
        if(options.filter.eservice === 'All') {
            if(options.success) options.success([], options.chart);
            options.do_update = true;
            for (i in options.stats.model.services) {
                options.label = options.stats.model.services[i].name;
                options.filter.eservice = options.stats.model.services[i].name;
                MMTDrop.DataFactory.getReport(options, options.stats.model.services[i].name);
            }
        }else {
            MMTDrop.DataFactory.getReport(options);
        }
    },

    getProcessTimelineReport : function(options) {
        options.type = 'timeline';
        options.metric = 'ProcessNb';
        options.bubble = false;
        options.label = 'Processes Number';
        
        if(options.filter.apppaths.length) {
            var r = new MMTDrop.ServiceResource(options.filter.apppaths[0], "-");
            if(r.resource) {
            }
            if(r.resource_value) {
                options.bubble = true;
                options.label = 'Average Task Duration';
                options.bubble_label = 'Tasks Number';
            }
        }
        MMTDrop.DataFactory.getReport(options, options.label);
    },

    getProcessFunnelReport : function(options) {
        options.type = 'funnel';
        options.metric = 'ProcessNb';
        MMTDrop.DataFactory.getReport(options);
    },

    getProcessPieReport : function(options) {
        options.type = 'pie';
        options.metric = 'ProcessNb';
        MMTDrop.DataFactory.getReport(options);
    },

    getResponseTimelineReport : function(options) {
        options.type = 'timeline';
        options.metric = 'ResponseTime';
        options.bubble = true;
        options.label = 'Average Response Time';
        options.bubble_label = 'Requests Number';
        MMTDrop.DataFactory.getReport(options, options.label);
    },
    
    getReport : function(options, chart_label) {
        stats = options.stats;
        args = options.args;
        var url = stats.server + "api/reports/";
        if(options.filter.eservice) {
            url = url + MMTDrop.DataFactory.getEserviceId(stats.model.services, options.filter.eservice) + '/' + options.metric + '?type=' + options.type;
        }else if(options.filter.apppaths.length) {
            var r = new MMTDrop.ServiceResource(options.filter.apppaths[0], "-");
            url = url + r.eservice;
            if(r.resource) {
                url = url + '/' + r.resource;
            }
            url = url + '/' + options.metric + '?type=' + options.type;
            if(r.resource_value) {
                url = url + '&filter=' + r.resource_value;
            }
        }
        if(options.filter.period) {
            url = url + '&period=' + options.filter.period;
        }
        $.ajax({
            url: url,
            success: function(report) {
                if(!report.data || report.data.length == 0) {
                    if(options.error) options.error("OUPS!!! No data available!", options.chart);
                }else {
                    if(options.type == 'timeline') {
                        var label = chart_label?chart_label:report.metric;
                        var bubble_label = options.bubble_label?options.bubble_label:report.metric;
                        var lineData = [], bubbleData = [];
                        for(var i in report.data) {
                            lineData.push([report.data[i][0], report.data[i][1]]);
                            bubbleData.push([report.data[i][0], report.data[i][1], report.data[i][2]]);
                        }
                        if(options.do_update === true) {
                            if(options.bubble) {
                                options.update({"name": label, "data": lineData}, options.chart);
                                if(options.update) options.update({"name": bubble_label, type: "bubble", "data": bubbleData}, options.chart);
                            }else {
                                options.update({"name": label, "data": lineData}, options.chart);
                            }
                        }else {
                            var data;
                            if(options.bubble) data = [{"name": label, "data": lineData}, {"name": bubble_label, type: "bubble", "data": bubbleData}];
                            else data = [{"name": label, "data": lineData}];
                            //var data = [{"name": report.metric, "data": lineData}];
                            if(options.success) options.success(data, options.chart);
                        }
                    }else if(options.type == 'funnel') {
                        if(options.success) options.success(report.data, options.chart);
                    }else if(options.type == 'pie') {
                        if(options.success) options.success(report.data, options.chart);
                    }else {
                        if(options.success) options.success(report.data, options.chart);
                    }
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                if(options.error) options.error("OUPS!!! An error was encountered!", options.chart);
            }
        });
    },

	createServiceResourcesTree : function(options) {
        model = options.stats.model;
        args = options.args;
		var arrData = [];
		for (i in model.services) {
            row = [];
            row.push(model.services[i].id.toString());
            row.push(model.services[i].id.toString()); //no parent
            row.push(model.services[i].name);
            arrData.push(row);
			for (r in model.services[i].processes) {
                row = [];
                row.push(model.services[i].id.toString() + "-" + model.services[i].processes[r].id.toString());
                row.push(model.services[i].id.toString()); // parent
                row.push(model.services[i].processes[r].processTypeName);
                arrData.push(row);
                for (v in model.services[i].processes[r].tasks) {
                    row = [];
                    row.push(model.services[i].id.toString() + "-" + model.services[i].processes[r].id.toString() + "-" + model.services[i].processes[r].tasks[v].id.toString());
                    row.push(model.services[i].id.toString() + "-" + model.services[i].processes[r].id.toString()); // parent
                    row.push(model.services[i].processes[r].tasks[v].TaskName);
                    arrData.push(row);
                }
			}
		}
		if(options.success) options.success(arrData, options.chart);
	},

	createTreeTableData : function(options) {
        appstats = options.stats;
        args = options.args;
		var arrData = [[]];
		for (i in appstats.rootapps) {
			for (j in appstats.rootapps[i].stats) {
				appstats.rootapps[i].stats[j].getGlobalStats(arrData, args);
			}
		}
		arrData.splice(0, 1);
		for (i in arrData) {
			arrData[i][2] = MMTDrop.getProtocolNameFromID(arrData[i][2]);
		}
		if(options.onData) options.onData(arrData);
	},

};

