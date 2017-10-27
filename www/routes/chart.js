var express = require('express');
var router = express.Router();
var HttpException = require('../libs/HttpException.js');
var url = require("url");
const config = require("../libs/config");

var all_pages = {
    'link': {
        title: "Link"
    },
    'network': {
        title: "Network"
    },
    'application': {
        title: "Application"
    },
    'dpi': {
        title: "DPI"
    },
    /*		'internet' : {
                title: "Internet"
            },
            'voip' : {
                title: "VoIP"
            },
            'video' : {
                title: "Video"
            },
    */
    'security': {
        title: "Security"
    },
    'evasion': {
        title: "Evasion"
    },
    'behavior': {
        title: "Behavior"
    },
    'ndn': {
        title: "NDN",
        children: {
            "top" : {
              title: "Top"
            },
            "alerts" : {
              title: "Alerts"
            }
        }
    },
    'video': {
        title: "Video QoS"
    },
    'sla': {
        title: "SLA",
        children: {
          "../sla": {
            title: "Metrics"
          },
          "separator" : "separator",
          "availability": {
            title: "Availability"
          },
          "incident":{
            title: "Incident Detection"
          },
          "vuln_scan_freq": {
            title: "Vulnerability Scan Frequency"
          }

        }
    },
    "enforcement": {
       title: "Enforcement",
       children:{
          "reaction": {
             title: "Reactions"
           },
           "separator_1" : "separator",
          "manager": {
             title: "Reaction Manager"
           },
           "separator_2" : "separator",
           "test" : {
              title: "Renforcement Agent",
              _url  : "http://assurance-platform.musa-project.eu/enforcement/admin/login",
              url   : "/enforcement/admin/",
              target: "_blank"
           },
         }
     },
    'stat':{
     title: "System"
    },
    'setting':{
      title: "Settings"
    }
};

//list of tabs to be shown on the tab bar
var pages_to_show = {};
const listOfPageIdToShow = config.modules 
   
/*
   [
    'link', 'network', 'application', 'dpi', 'security'
    //, 'evasion',
    //'behavior', 'ndn', 'video','sla'
    ,'stat'
];
*/
//for testing
//listOfPageIdToShow.push( "sla" );

listOfPageIdToShow.forEach(
  function(key){
    pages_to_show[ key ] = all_pages[ key ];
  });


router.get('/*', function(req, res, next) {

   if (req.session.loggedin == undefined) {
        res.redirect("/");
        return;
    }


    var path = req.params[0]; //e.g. application/detail?time=1461574741511
    path = url.parse(path).pathname;

    var id = path;

    if (!id) {
        res.redirect("/chart/link");
        return;
    }

    if (path.indexOf("/") > -1) {
        id = path.substr(0, path.indexOf("/")); //e.g. application
    } else
        path = null;


    id = id.toLowerCase();

    //maintain query string between pages
    var query_string = [];
    var arr = ["period", "probe_id", "app_id", "period_id"];  

    //for musa project
    if (path == 'sla/availability')
        arr.push( "alert", "violation" );
    
    for (var i in arr) {
        var el = arr[i];
        if (req.query[el] != undefined)
            query_string.push(el + "=" + req.query[el]);
    }

    if (query_string.length > 0)
        query_string = "?" + query_string.join("&");
    else
        query_string = "";

    var page = all_pages[id];
    var title = "...";
    if (page) title = page.title;

    const other_config = router.config.json;
    res.render("chart", {
        title              : title,
        page_id            : id,
        pages              : pages_to_show,
        pathname           : path,
        query_string       : query_string,
        probe_stats_period : router.config.probe_stats_period,
        probe_analysis_mode: router.config.probe_analysis_mode,
        is_in_debug_mode   : (router.config.is_in_debug_mode === true),
        other_config       : other_config,
        licence_remain_days: 10
    });

});

module.exports = router;
