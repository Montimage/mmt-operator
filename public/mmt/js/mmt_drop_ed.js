/** Class: MMTDrop 
 *  An object container for all MMTDrop library functions. 
 * 
 *  This class is just a container for all the objects and constants 
 *  used in the library.  It is not meant to be instantiated, but to 
 *  provide a namespace for library objects, constants, and functions. 
 */ 
 
MMTDrop = { 
//TODO 
    /** Constant: VERSION 
     *  The version of the MMTDrop library. 
     */ 
    VERSION : "1.0.0", 
 
}; 
 
/** 
 * Class: MMTDrop.DataFactory 
 * An object container for all the data creation functions. 
 */ 
MMTDrop.ReportFactory = { 
    createHTTPRequestsReport: function(elemid, gstats) { 
        report = new MMTDrop.Reports({ 
                'type':'table', 
                'stats': gstats, 
                'elemid': elemid, 
                'title': "HTTP Requests Report: List of requests and response times", 
                'colnames': ["Hostname", "Source IP", "Source Port", "Destination IP", "Destination Port", "Response Time", "Device ID"], 
                'getDataFct': MMTDrop.DataFactory.createTableHTTPRequests, 
                'pos': [0, 12]} 
        ); 
        return report; 
    }, 
 
    createAverageHTTPResponseTimeReport: function(elemid, gstats) { 
        report = new MMTDrop.Reports.Chart({ 
                'type':'bubble', 
                'gstats': gstats, 
                'elemid': elemid, 
                'title': "HTTP Requests Report: Average Response Times (in ms) over time", 
                'getDataFct': MMTDrop.DataFactory.createAverageHTTPResponseTime, 
                'seriesName': "Number of requests", 
                'ylabel': "Average response time in ms", 
                'pos': [0, 12]}                   
        ); 
        return report; 
    }, 
 
    createTcpReport: function(elemid, gstats) { 
        report = new MMTDrop.Reports.Chart({ 
           'type':'bubble', 
           'gstats': gstats, 
           'elemid': elemid, 
           'title': "HTTP SYN Report: Active, new and not yet acknowleged TCP connections over time", 
           'ylabel': "Number", 
           'pos': [0, 12],                   
           'elements': [ 
               {'chart': [{ 
                    'type':'timeline',  
                    'options': {  
                         'getDataFct': MMTDrop.DataFactory.createActiveConnectionsData,  
                         'seriesName': "Active Connections", 
                    }  
                }],  
                },  
               {'chart': [{ 
                    'type':'timeline',  
                    'options': {  
                         'getDataFct': MMTDrop.DataFactory.createNewConnectionsData,  
                         'seriesName': "New Connections", 
                    }  
                }],  
                },  
               {'chart': [{ 
                    'type':'timeline',  
                    'options': {  
                         'getDataFct': MMTDrop.DataFactory.createConnectionsNotYetAcknowlegedData,  
                         'seriesName': "Connections not yet acknowleged", 
                    }  
                }],  
                }]  
        }); 
        return report; 
    }, 
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
 
                report_header =   ('<div>', { 
                                    'class': 'row-fluid' 
                                 }); 
                report_header.appendTo( ('#' + this.elemid)); 
 
                if(this.title) { 
                    report_title =  ('<div>', {'class': 'report_title', 'text': this.title}); 
                    report_title.appendTo(report_header); 
                } 
 
                control_row =  ('<div>', {'class': 'span4 pull-right'}); 
                control_row.appendTo(report_header); 
 
                for (i in this.filters) { 
                    var fdiv =  ('<div>', {'class': 'input-prepend span6 pull-right'}); 
                    var span =  ('<span>', {'class': 'add-on', 'text': i}); 
                    var ftr =  ('<select>', { 
                        'id' : this.elemid + '_ftr_' + i, 
                        'class' : 'btn span8' 
                }); 
                for (j in this.filters[i].data) { 
                    var opt =  ('<option>', { 
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
            var line =  ('<div>', { 
                'class': 'row-fluid' 
            }); 
            line.appendTo( ('#' + this.elemid)); 
            for(e in this.elempos[l]) { 
                var row =  ('<div>', { 
                    'class': 'span' + this.elempos[l][e].width 
                }); 
                row.appendTo(line); 
                elem = this.elempos[l][e].elem; 
                var elem_div =  ('<div>', { 
                        'id' :elem.elemid, 
                        'class': 'report-element' 
                    }); 
                elem_div.appendTo(row); 
                 
                if (elem.buttons.length > 1) { 
                    var btngroup =  ('<div>', { 
                        'id' : elem.elemid + '_btngrp', 
                        'class' : 'report-element-top btn-group center' 
                    }); 
                    for (i in elem.buttons) { 
                        var btn =  ('<button>', { 
                            'id' : elem.elemid + '_btn_' + i, 
                            'class' : 'btn btn-large', 
                            //'text' : elem.buttons[i] 
                        }).append(this.getChartTypeIconByName(elem.buttons[i])); 
                        btn.appendTo(btngroup); 
                    } 
                    btngroup.appendTo(elem_div); 
                } 
                               
                var chart =  ('<div>', { 
                    'id' : elem.elemid + '_chart'                                          
                }); 
 
                chart.appendTo(elem_div); 
                elem.charts[elem.active_chart].render(this.filter); 
             
                if (elem.buttons.length > 1) { 
                    for (i in elem.buttons) { 
                         ('#' + elem.elemid + '_btn_' + i).click({ 
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
             ('#' + this.elemid + '_ftr_' + i).change({ 
                fid : i, 
                report : this 
            }, function(e, ui) { 
                if (e.data.report.filters[e.data.fid].select) { 
                    e.data.report.filters[e.data.fid].select( (this).find('option:selected').val()); 
                } 
                if (e.data.fid === 'appname') { 
                    e.data.report.filter.appname =  (this).find('option:selected').val(); 
                } else if (e.data.fid === 'metric') { 
                    e.data.report.filter.metric =  (this).find('option:selected').val(); 
                } else if (e.data.fid === 'appclass') { 
                    e.data.report.filter.appclass =  (this).find('option:selected').val(); 
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
                     ('#' + this.elemid + '_ftr_appname').val(filter.appname); 
                } else if ((f === "metric") && (this.filter.metric != filter.metric)) { 
                    this.filter.metric = filter.metric; 
                    this.filter.metricid = MMTDrop.MetricName2ID[filter.metric]; 
                    //Update the filter if it exists 
                     ('#' + this.elemid + '_ftr_metric').val(filter.metric); 
                } else if ((f === "appclass") && (this.filter.appclass != filter.appclass)) { 
                    this.filter.appclass = filter.appclass; 
                    this.filter.appclassid = MMTDrop.CategoriesNamesMap[filter.appclass]; 
                    //Update the filter if it exists 
                     ('#' + this.elemid + '_ftr_appclass').val(filter.appclass); 
                } else if(!(f === "appclassid" || f === "metricid" || f === "appid") &&  this.filter[f] != filter[f]) { 
                    this.filter[f] = filter[f]; 
                } 
            } 
        } 
    }, 
 
        getChartTypeIconByName: function(name) { 
        if(name === 'pie') return  ('<i>', {'class': 'glyphicons-pie'}); 
        if(name === 'bar') return  ('<i>', {'class': 'glyphicons-bar'}); 
        if(name === 'timeline') return  ('<i>', {'class': 'glyphicons-chart'}); 
        if(name === 'tree') return  ('<i>', {'class': 'glyphicons-table'}); 
        if(name === 'table') return  ('<i>', {'class': 'glyphicons-table'}); 
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
         ('#' + this.elemid).empty(); 
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
    this.multiselect = false; 
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
 
        if (this.type == "bar") { 
            this.render_bar(this.filter); 
        } else if (this.type == "pie") { 
            this.render_pie(this.filter); 
        } else if (this.type == "tree") { 
            this.render_tree(this.filter); 
        } else if (this.type == "table") { 
            this.render_table(this.filter); 
        } else if (this.type == "timeline") { 
            this.render_timeline(this.filter); 
        } else if (this.type == "bubbletimeline") { 
            this.render_bubbletimeline(this.filter); 
        } 
    }, 
 
    /** 
     * Renders bubble timeline chart 
     */ 
    render_bubbletimeline : function(filter) { 
//TODO 
    }, 
 
    /** 
     * Renders tree table chart 
     */ 
    render_tree : function(filter) { 
           
        var treeWrapper =  ('<div>', { 
            'class' : 'report-element-tree'                                          
        });          
             
        var treetable =  ('<table>', { 
            'id' : this.elemid + '_treetable', 
            'cellpadding' : 0, 
            'cellspacing' : 0, 
            'border' : 0 
        }); 
        var caption =  ('<caption>'); 
        var expand =  ('<a>', { 
            'href' : '#', 
            'class' : 'btn', 
            'onclick' : 'jQuery("#' + this.elemid + '_treetable").treetable("expandAll"); return false;', 
            'text' : 'Expand All' 
        }); 
        var collapse =  ('<a>', { 
            'href' : '#', 
            'class' : 'btn', 
            'onclick' : 'jQuery("#' + this.elemid + '_treetable").treetable("collapseAll"); return false;', 
            'text' : 'Collapse All' 
        }); 
        expand.appendTo(caption); 
        collapse.appendTo(caption); 
        var thead =  ('<thead>'); 
        var tr =  ('<tr>'); 
        for ( i = 0; i < this.colnames.length; i++) { 
            var th =  ('<th>', { 
                'text' : this.colnames[i] 
            }); 
            th.appendTo(tr); 
        } 
 
        tr.appendTo(thead); 
        var tbody =  ('<tbody>'); 
        var arrData = this.getdata(this.appstats, this.filter, this.getdatargs); 
        for (i in arrData) { 
            if (arrData[i].length > 3) { 
                var row_tr; 
                if (arrData[i][0] == arrData[i][1]) { 
                    row_tr =  ('<tr>', { 
                        'data-tt-id' : arrData[i][0].replace(/\./g,"-") 
                    }); 
                } else { 
                    row_tr =  ('<tr>', { 
                        'data-tt-id' : arrData[i][0].replace(/\./g,"-"), 
                        'data-tt-parent-id' : arrData[i][1].replace(/\./g,"-") 
                    }); 
                } 
                if(this.link == null) { 
                    var row_name =  ('<td>', { 
                        'text' : arrData[i][2] 
                    }); 
                }else { 
                    var row_name =  ('<td>'); 
                    var row_name_link =  ('<a>', { 
                      'text' : arrData[i][2], 
                      'href' : this.link(arrData[i]) 
                    }); 
                    row_name_link.appendTo(row_name); 
                } 
                row_name.appendTo(row_tr); 
                 
                for ( j = 3; j < Math.min(arrData[i].length, this.colnames.length + 2); j++) { 
                    var cell =  ('<td>', { 
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
                treeWrapper.appendTo( ('#' + this.elemid)); 
         
         ("#" + this.elemid + "_treetable").treetable({ 
            expandable : true 
        }); 
         ("#" + this.elemid + "_treetable").treetable("expandAll"); 
 
                if(this.multiselect) { 
                     ("#" + this.elemid + "_treetable tbody tr").click({ 
                chart : this 
            }, function(e) { 
                // Highlight selected row 
                    if (  (this).hasClass('selected') ) { 
                         (this).removeClass('selected'); 
                    }else { 
                         (this).addClass('selected'); 
                    } 
                    var selection = []; 
                     (".selected").each(function(){selection.push(String( (this).data("ttId")).replace(/\-/g,"."));}); 
                     
                    if (e.data.chart.click) { 
                    ev = {data: {chart: e.data.chart, path: selection}}; 
                    e.data.chart.click(ev); 
                } 
            }); 
                }else { 
                     ("#" + this.elemid + "_treetable tbody tr").click({ 
                        chart : this 
                        }, function(e) { 
                        // Highlight selected row 
                             (".selected").not(this).removeClass("selected"); 
                             (this).addClass("selected"); 
                        if (e.data.chart.click) { 
                            ev = {data: {chart: e.data.chart, path: String( (this).data("ttId")).replace(/\-/g,".")}}; 
                            e.data.chart.click(ev); 
                        } 
                    }); 
                } 
 
         ("#" + this.elemid + "_treetable tbody tr").dblclick({ 
            chart : this 
        }, function(e) { 
            if (e.data.chart.dblclick) { 
                ev = {data: {chart: e.data.chart, path: String( (this).data("ttId")).replace(/\-/g,".")}}; 
                e.data.chart.dblclick(ev); 
            } 
        }); 
        /*check if no path is selected, then to click in the first 'tr' 
           of the tree element 
        */ 
        apppaths = filter.apppaths; 
        //Sets the first tr as the default view 
        if(typeof apppaths  === 'undefined'){                    
             ("#" + this.elemid + "_treetable tbody tr:first").addClass("selected"); 
            selection = []; 
             ("#" + this.elemid + "_treetable tbody tr:first").each(function(){selection.push(String( (this).data("ttId")).replace(/\-/g,"."));}); 
            if(this.report) this.report.filter.apppaths = selection; 
        }else { 
            for(p in apppaths) { 
                  ("#" + this.elemid + "_treetable tbody tr").each(function(){if(String( (this).data("ttId")).replace(/\-/g,".") == apppaths[p])  (this).addClass("selected");}); 
            } 
        } 
             
    }, 
 
    /** 
     * Renders data table chart 
     */ 
    render_table : function(filter) { 
        var arrData = this.getdata(this.appstats, this.filter, this.getdatargs); 
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
                    //    var sReturn = obj.aData[obj.iDataColumn]; 
                    //    var returnButton = "<div class='progress'><div class='bar' style='width: 60%;'></div></div>"; 
                    //    return returnButton; 
                    //} 
                }); 
            } 
        } 
 
         ('#' + this.elemid).html('<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered" id="' + this.elemid + '_datatable"></table>'); 
        this.oTable =  ('#' + this.elemid + '_datatable').dataTable({ 
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
 
         ('#' + this.elemid + ' tbody tr').dblclick({ 
            chart : this, 
            eid :  ('#' + this.elemid + '_datatable').dataTable() 
        }, function(e) { 
            if (e.data.chart.dblclick) { 
                e.data.chart.dblclick( ('td:eq(0)', this).html()); 
            } 
        }); 
         ('#' + this.elemid + ' tbody tr').click({ 
            chart : this, 
            eid :  ('#' + this.elemid + '_datatable').dataTable() 
        }, function(e) { 
            if ( (this).hasClass('row_selected')) { 
                 (this).removeClass('row_selected'); 
            } else { 
                e.data.eid. ('tr.row_selected').removeClass('row_selected'); 
                 (this).addClass('row_selected'); 
            } 
            if (e.data.chart.click) { 
                e.data.chart.click( ('td:eq(0)', this).html()); 
            } 
        }); 
    }, 
 
    /** 
     * Renders a bar chart  
     */ 
    render_bar : function(filter) { 
        var arrData = this.getdata(this.appstats, this.filter, this.getdatargs); 
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
                    text : MMTDrop.getYLabel(filter) 
                } 
            }, 
            series : series 
        }); 
    }, 
 
    /** 
     * Renders a pie chart  
     */ 
    render_pie : function(filter) { 
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
                data : this.getdata(this.appstats, this.filter, this.getdatargs) 
            }] 
        }); 
    }, 
 
    /** 
     * Renders a timeline chart  
     */ 
    render_timeline : function(filter) { 
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
                    text : MMTDrop.getYLabel(filter) 
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
            series : this.getdata(this.appstats, this.filter, this.getdatargs) 
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
            this.chart.destroy(); 
            this.chart = null; 
        } else if (this.type == "pie") { 
            this.chart.destroy(); 
            this.chart = null; 
        } else if (this.type == "tree") { 
        } else if (this.type == "table") { 
             ('#' + this.elemid + '_datatable').dataTable().fnDestroy(); 
        } else if (this.type == "timeline") { 
            this.chart.destroy(); 
            this.chart = null; 
        } 
         ('#' + this.elemid).empty(); 
    }, 
}; 
 
/** 
 * Class: MMTDrop.DataFactory 
 * An object container for all the data creation functions. 
 */ 
MMTDrop.DataFactory = { 
//TODO 
    createTableHTTPRequests : function(appstats, options, args) { 
    }, 
    createAverageHTTPResponseTime : function(appstats, options, args) { 
    }, 
    createActiveConnectionsData : function(appstats, options, args) { 
    }, 
    createNewConnectionsData : function(appstats, options, args) { 
    }, 
    createConnectionsNotYetAcknowlegedData : function(appstats, options, args) { 
    }, 
}; 
