/*
//
//These 2 variables are defined in each tab.js (eg: link.js, network.js)
const arr = [
    {
        id: "realtime",
        title: "Traffic in Realtime",
        x: 0,
        y: 0,
        width: 6,
        height: 6,
        type: "success",
        userData: {
            fn: "createRealtimeTrafficReport"
        },
    },
];

const availableReports = {
    "createNodeReport":     "Nodes",
}

*/

MMTDrop.setOptions({
  //serverURL: "http://localhost:8088",
});


if (typeof (ReportFactory) === "undefined")
  ReportFactory = {};

for (var i in ReportFactory)
  MMTDrop.reportFactory[i] = ReportFactory[i];

ReportFactory = MMTDrop.reportFactory;

const fPeriod = MMTDrop.filterFactory.createPeriodFilter();
const fProbe = MMTDrop.filterFactory.createProbeFilter();
const reports = [];

const COL = MMTDrop.constants.StatsColumn;
const HTTP = MMTDrop.constants.HttpStatsColumn;
const SSL = MMTDrop.constants.TlsStatsColumn;
const TLS = MMTDrop.constants.TlsStatsColumn;
const RTP = MMTDrop.constants.RtpStatsColumn;
const FTP = MMTDrop.constants.FtpStatsColumn;
const GTP = MMTDrop.constants.GtpStatsColumn;

//this database is reload firstly when a page is loaded
//this db contains status of probe, interval to get data of reports
const status_db = new MMTDrop.Database({ collection: "status" });

//auto reload button
const fAutoReload = {
  hide: function () {
    $("#autoReload").hide();
    $("#isAutoReloadChk").prop("checked", false);
  },
  show: function () {
    $("#autoReload").show();
  },
  onChange: function (cb) {
    $("#isAutoReloadChk").off("change");
    $("#isAutoReloadChk").change(function () {
      var is_on = $(this).is(":checked");
      fAutoReload.isOn = is_on;
      console.log("autoReload: " + is_on);
      MMTDrop.tools.localStorage.set("autoreload", is_on, false);

      if (typeof (cb) === "function")
        cb(is_on);
    });
  }
};

$(function () {
  'use strict'
  if (MMTDrop.config.others && !MMTDrop.config.others.auto_reload_report)
    fAutoReload.hide();

  if (typeof arr === "undefined") {
    console.error("No Reports are defined!");
    $("#waiting").hide();
    return;
  }

  $("#waiting").on("click", function () {
    $("#waiting").hide();
  });

  if (fPeriod == undefined) {
    throw new Error("Need to defined fPeriod filter")
  }

  if (typeof availableReports == "undefined")
    var availableReports = [];

  //init toolbar-box
  if (arr.length == 1)
    $("#deleteBtn").hide();
  if (MMTDrop.tools.object2Array(availableReports).length == 0)
    $("#addBtn").hide();

  //fProbe: list of available probes in the period selected by fPeriod
  fProbe.storeState = false;
  fProbe.renderTo("toolbar-box");
  fProbe.onFilter(function (opt) {
    MMTDrop.tools.reloadPage("probe_id=" + opt.id);
  });

  //SLA
  if (MMTDrop.config.others && MMTDrop.config.others.modules
    && MMTDrop.config.others.modules_config.sla != undefined
    && MMTDrop.config.others.modules.indexOf("sla") != -1 //active SLA
  ) {

    const SLAs = MMTDrop.config.others.modules_config.sla;
    if (SLAs != undefined) {
      //list of reaction agents
      const $reactionsAgents = $($(".menu_enforcement")[0].children[1]);
      for (var act in SLAs.actions) {
        var action = SLAs.actions[act];
        var name = act.replace(/_/g, " ");
        $reactionsAgents.append('<li class="sub_menu_' + act + '" title="' + action.agent_description + '"><a style="text-transform: capitalize;" onclick=\'MMTDrop.tools.modal("agent-des","' + name + ' Agent","","' + action.agent_description + '").$title.css("text-transform","capitalize")\'>' + name + ' Agent</a></li>');
      }

      //list of fixed metrics
      const $metrics_list = $($(".menu_sla")[0].children[1]);
      const queryString = "&app_id=" + URL_PARAM.app_id + (URL_PARAM.probe_id == undefined ? "" : ("&probe_id=" + URL_PARAM.probe_id));
      for (var i = 0; i < SLAs.init_metrics.length; i++) {
        var m = SLAs.init_metrics[i];
        $metrics_list.append('<li class="sub_menu_' + m.name + '"><a href="/chart/sla/alerts?metric_id=' + m.id + queryString + '">' + m.title + '</a></li>');
      }
      //add  separator
      if (SLAs.init_metrics.length > 0)
        $metrics_list.append('<li role="separator" class="divider"></li>');
    }
    //update list of metrics getting from SLA
    const app_id = (MMTDrop.tools.getURLParameters().app_id == undefined ? "__app" : MMTDrop.tools.getURLParameters().app_id);
    MMTDrop.tools.ajax("/api/metrics/find?raw", [{ $match: { app_id: app_id } }], "POST", {
      error: function () { },
      success: function (data) {
        var obj = data.data[0];
        //does not exist ?
        if (obj == undefined)
          return;

        //set of unique metrics
        const metrics = {};

        //components
        const components = obj.components;

        //for each probe ID
        for (var j = 0; j < components.length; j++) {
          //get set of unique metrics
          var me = components[j].metrics;
          for (var k = 0; k < me.length; k++)
            metrics[me[k].title] = me[k];
        }

        const $metrics_list = $($(".menu_sla")[0].children[1]);
        const queryString = "&app_id=" + URL_PARAM.app_id + (URL_PARAM.probe_id == undefined ? "" : ("&probe_id=" + URL_PARAM.probe_id));
        for (var m in metrics) {
          if (metrics[m].title == null)
            return;
          if (metrics[m].support === true)
            $metrics_list.append('<li class="sub_menu_' + metrics[m].name + '"><a href="/chart/sla/alerts?metric_id=' + metrics[m].id + queryString + '">' + metrics[m].title + '</a></li>');
          else
            $metrics_list.append('<li class="sub_menu_' + metrics[m].id + ' disabled"><a>' + metrics[m].title + '</a></li>');
        }
      }
    });

    // INFLUENCE Alerts
    const isInfluence = MMTDrop.config.others.modules_config.sla.init_components.some(item => item.title === "INFLUENCE5G");
    let alertCount =  MMTDrop.tools.localStorage.get("alertCount", false);
    if (alertCount == undefined) alertCount = 0;

    if (isInfluence) {
      // Check if there is any new alert/violation since last reload and issue a warning
      setInterval(() => {
        MMTDrop.tools.ajax("/api/metrics_alerts/find?raw", [], "POST", {
          error: function () { },
          success: function (data) {
            const obj = data.data;
            if (obj == undefined) return;
            const newAlertCount = obj.length;
            if (newAlertCount > alertCount) {
              MMTDrop.alert.warning("INFLUENCE5G has " + (newAlertCount - alertCount) + " new alerts/violations!!", 2500);
              alertCount = newAlertCount;
              MMTDrop.tools.localStorage.set("alertCount", alertCount, false);
            } else if (newAlertCount < alertCount) {
              MMTDrop.alert.success("INFLUENCE5G has " + (alertCount - newAlertCount) + " alerts/violations cleared!!", 2500);
              alertCount = newAlertCount;
              MMTDrop.tools.localStorage.set("alertCount", alertCount, false);
            }
          }
        });
      }, 5 * 1000);
    }
  }
  //endSLA

  //update options of this combobox based on value in status_db: replace probe id by component name
  fProbe.reloadOptions = function () {
    var probes_status = status_db.probeStatus;
    const select_id = URL_PARAM.probe_id;

    //this is applied when sla
    var initialComponents = {};
    if (fProbe.isVisible() && MMTDrop.config.others && MMTDrop.config.others.modules && MMTDrop.config.others.modules.indexOf("sla") != -1) {

      //load metric from DB
      const app_id = (MMTDrop.tools.getURLParameters().app_id == undefined ? "__app" : MMTDrop.tools.getURLParameters().app_id);
      MMTDrop.tools.ajax("/api/metrics/find?raw", [{ $match: { app_id: app_id } }], "POST", {
        error: function () { },
        success: function (data) {
          var obj = data.data[0];
          //does not exist ?
          if (obj == undefined)
            return;

          //components
          const components = obj.components;
          const pOption = fProbe.option();
          const newProbeOption = []; //this array contains only probes defined by sla application
          const selectedProbe = URL_PARAM.probe_id;

          //hide All: this option will lead to get data of all available probes in DB
          //containing even probes inexisting in the current application
          if (components.length > 1)
            newProbeOption.push({ label: "All", id: "undefined", selected: URL_PARAM.probe_id == undefined });

          components.sort(function (a, b) {
            return a.id - b.id;
          });

          //for each probe ID
          for (var j = 0; j < components.length; j++) {
            if (components[j].id == selectedProbe)
              newProbeOption.push({ label: "C" + components[j].id + ": " + components[j].title, id: components[j].id, selected: true });
            else
              newProbeOption.push({ label: "C" + components[j].id + ": " + components[j].title, id: components[j].id });
          }

          //update component list
          fProbe.option(newProbeOption);
          fProbe.redraw();
        }
      });
    }
    //end sla

    const newProbeOption = [];
    for (var i in probes_status) {
      if (i == select_id)
        newProbeOption.push({ id: i, label: "Probe " + i, selected: true });
      else if (i != "null")
        newProbeOption.push({ id: i, label: "Probe " + i });
    }

    if (newProbeOption.length > 1) {
      if (select_id == undefined || select_id == "all")
        newProbeOption.unshift({ id: "undefined", label: "All", selected: true });
      else
        newProbeOption.unshift({ id: "undefined", label: "All" });
    } else {
    }

    if (newProbeOption.length > 0) {
      fProbe.option(newProbeOption);
      fProbe.redraw();
    }
  }
  //end fProbe

  //
  fPeriod.storeState = false;
  fPeriod.renderTo("toolbar-box");
  if (URL_PARAM.period)
    fPeriod.selectedOption({ id: URL_PARAM.period });
  fPeriod.onFilter(function (opt) {
    //MMTDrop.tools.reloadPage("period=" + opt.id );
    //enodeb: remove elem from URL
    MMTDrop.tools.reloadPage("elem=null&&period=" + opt.id);
  });


  const renderReport = function (node) {
    try {
      const key = node.userData.fn;
      const cb = ReportFactory[key];
      const domID = node.id + "-content"; //DOM element on which the report will be rendered

      if (MMTDrop.tools.isFunction(cb)) {
        //trigger the function that generates the report
        const rep = ReportFactory[key](fPeriod, { domID: domID, node: node });
        if (rep) {
          rep.renderTo(domID);
          reports.push(rep);
        } else {
          //rep is not a real report (it could be a form, ...)
          //=> hide loading icon
          loading.onHide();
        }
      }

      //loading is defined in each tab
      if (loading)
        loading.totalChart++;

    } catch (ex) {
      console.error("Error when rending report [" + node.userData.fn + "] to the DOM [" + node.id + "]");
      console.error(ex.stack);
    }
  }

  var data = Grid.together(arr);

  for (var i in data) {
    var node = data[i];
    renderReport(node);
  }

  //reload databases of reports
  var reloadReports = function (data, group_by) {
    //reload options of fProbe
    fProbe.reloadOptions();

    //there are no reports
    if (reports.length == 0) {
      loading.onHide();
    } else {
      var probe_id = URL_PARAM.probe_id;
      try {
        for (var i = 0; i < reports.length; i++) {
          //update parameter
          var param = {};
          param.period = status_db.time;
          param.period_groupby = group_by;
          if (probe_id != undefined) {
            param.probe = parseInt(probe_id);
          }


          reports[i].database.reload(param, function (new_data, rep) {
            //for each element in dataFlow array
            for (var j in rep.dataFlow) {
              var filter = rep.dataFlow[j];
              if (!filter) return;

              filter = filter.object;
              if (filter instanceof MMTDrop.Filter)
                filter.filter();
              else if (filter) { //chart
                filter.attachTo(rep.database);
                filter.redraw();
              }
            }
          }, reports[i]);
        }
      } catch (err) {
        loading.onHide();
        console.error(err);
      }
    }//end if
  }

  //fire the chain of filters
  setTimeout(function () {
    console.log("loading status_db");
    status_db.reload({ action: fPeriod.getSamplePeriodTotal() * 1000 }, reloadReports, fPeriod.selectedOption().id);
  }, 500);

  //update the modal show list of reports to user
  var $modal = $("#modal");

  $modal.find(".btn-group .btn").on("click", function () {
    var $el = $(this);
    $("#reportColor").val($el.data("type"));
  })

  var $sel = $("#reportList");
  for (var i in availableReports) {
    var label = availableReports[i];
    $sel.append($("<option>", {
      "value": i,
      "text": label + " Report"
    }));
  }

  //when use selected a kind of report and click on "Done"
  $modal.find("#doneBtn").on("click", function () {

    $modal.modal("hide");

    var id = $sel.val();
    var label = $("#reportTitle").val();

    if (label == undefined || label == "")
      label = availableReports[id] + " Report";

    var node = {
      id: "custom-report-" + MMTDrop.tools.getUniqueNumber(),
      title: label,
      width: 12,
      height: 4,
      x: 0,
      y: 0,
      type: $("#reportColor").val(),
      userData: {
        fn: id
      }
    };

    Grid.add_widget(node);
    Grid.save_grid();

    window.location.reload();
    //renderReport(node);

  });


  var reloadCount = 0;
  var auto_reload_timer = null;
  function start_auto_reload_timer() {
    if (auto_reload_timer)
      clearInterval(auto_reload_timer);

    var p = fPeriod.getDistanceBetweenToSamples() * 1000;
    if (p <= 60 * 1000)
      p = 60 * 1000;
    //always reload each 60 seconds
    p = 60 * 1000;

    //overwrite by interval of fAutoReload
    if (fAutoReload.interval)
      p = fAutoReload.interval;

    auto_reload_timer = setInterval(function () {
      reloadCount++;
      console.log(reloadCount + " Reload ======>");

      if (reloadCount >= 10) {
        location.reload();
        throw new Error("Stop");
      }

      loading.onShowing();
      status_db.reload({}, reloadReports, fPeriod.selectedOption().id);
    }, p);
  }
  //if fAutoReload.onchange is defined somewhere => fire it
  if (fAutoReload.onchange)
    fAutoReload.onChange(fAutoReload.onchange);
  else
    fAutoReload.onChange(function (is_on) {
      if (is_on) {
        start_auto_reload_timer();
      } else {
        clearInterval(auto_reload_timer);
      }
    });


  var checked = MMTDrop.tools.localStorage.get("autoreload", false);
  //checkbox default is "true"
  if (checked === false) {
    $("#isAutoReloadChk").prop("checked", false);
  } else
    //checkbox is already checked ==> trigger its event
    $("#isAutoReloadChk").trigger("change");


  //download images
  $("#exportBtn").click(function () {
    d3.selectAll("path").attr("fill", "none");
    d3.selectAll(".tick line, path.domain, c3-ygrid").attr("stroke", "black");
    d3.selectAll(".c3-line").attr("stroke-width", "2px");
    d3.selectAll(".c3-ygrid").attr("stroke", "#aaa").attr("stroke-dasharray", "3 3");

    var $form = $("#frmUploadImage");
    //for the first time
    if ($form.length == 0) {

      $form = MMTDrop.tools.createDOM({
        type: "<form>",
        attr: {
          id: "frmUploadImage",
          method: "POST",
          style: "display: none"
        },
        children: [{
          type: "<input>",
          attr: {
            name: "data",
          }
        }]
      });
      $("body").append($form);
    }

    function render_image(index) {
      if (index >= data.length) return;
      var node = data[index];
      var targetElem = $("#" + node.id);

      console.log("Rendering image for tab." + node.id)

      // First render all SVGs to canvases
      var elements = targetElem.find('svg').map(function () {
        var svg = $(this);
        var canvas = $('<canvas>');

        // Get the raw SVG string and curate it
        var content = svg[0].outerHTML.trim();
        canvg(canvas[0], content);

        //temporary replace the svg by the canvas
        //the svg will be put back after rendering image
        svg.replaceWith(canvas);

        return {
          svg: svg,
          canvas: canvas
        };
      });
      //return;
      // At this point the container has no SVG, it only has HTML and Canvases.
      html2canvas(targetElem, {
        //allowTaint: true,
        letterRendering: true,
        onrendered: function (canvas) {
          var ctx = canvas.getContext("2d");

          // Put the SVGs back in place
          elements.each(function () {
            this.canvas.replaceWith(this.svg);
          });

          //add water mark
          ctx.font = "14px Arial";
          ctx.fillStyle = "grey";
          var copyright = String.fromCharCode(169);
          ctx.fillText(copyright + " Montimage", 15, canvas.height - 12);

          var fileName = node.title + "-" + (new Date()).toLocaleString() + ".png";

          try {
            var isFileSaverSupported = !!new Blob;
            //OK, your browser support Blog
            canvas.toBlob(function (blob) {
              saveAs(blob, fileName);
            });
          } catch (e) {
            $form.attr("action", "/export/img?filename=" + fileName);
            $form.attr("method", "POST");
            //get image based_64
            $form.children().val(canvas.toDataURL("image/png"));
            $form.submit();
          }


          //for others reports
          if (index < data.length - 1)
            setTimeout(render_image, 1000, index + 1);
        }
      });// end html2canvas
    }
    render_image(0);

  })//end $("#exportBtn").click

  //download as html page
  $("#exportHtmlBtn").click(function () {
    waiting.show();

    getPlainHtml();

    waiting.hide();

    setTimeout(function () {
      const data = $("html").html();

      /*
      * Save a text file locally with a filename by triggering a download
      */

      const blob = new Blob([data], { type: 'text/plain' }),
        anchor = document.createElement('a');

      anchor.download = $('head').find('title').text() + ".html";
      anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
      anchor.dataset.downloadurl = ['text/html', anchor.download, anchor.href].join(':');
      anchor.click();

      setTimeout(MMTDrop.tools.reloadPage, 1000);
    }, 500);
  })//end $("#exportHtmlBtn").click
});

