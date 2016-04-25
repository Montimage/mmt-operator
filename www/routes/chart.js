var express = require('express');
var router  = express.Router();
var HttpException = require('../libs/HttpException.js');
var url = require("url");

var all_pages = {
        'link': {
            title : "Link"
        },
        'network' : {
            title: "Network"
        },
		'application' : {
            title: "Application"
        },
        'dpi':
        {
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
            'security':{
            title:"Security"
        },
        'evasion':{
            title:"Evasion"
        },
        'behavior':{
            title:"Behavior"
        },
*/
        'ndn':{
            title: "NDN"
        },
        'video':{
            title: "Video QoS"
        }
};

router.get('/*', function(req, res, next) {
    
    if( req.session.loggedin == undefined ){
        res.redirect("/");
        return;
    }
    
    
	var path = req.params[0];   //e.g. application/detail?time=1461574741511
    path  = url.parse( path ).pathname;
    
    var id = path;
    if( path.indexOf("/") > -1 ){
        id   = path.substr( 0, path.indexOf("/")); //e.g. application
    }else
        path = null;
    
	if( !id ){
		res.redirect("/chart/link");
        return;
    }
	id = id.toLowerCase();
	
    if( router.pages == undefined ){
        router.pages = all_pages;
    }
	
	var page = router.pages[ id ];
	if( page == undefined ){
		var err = new Error('Not Found');
        err.status = 404;
        throw err;
	}else{
		res.render("chart", { title: page.title, page_id: id, pages: router.pages, 
                             pathname : path,
                             probe_stats_period  : router.config.probe_stats_period, 
                             probe_analysis_mode : router.config.probe_analysis_mode,
                             is_in_debug_mode    : (router.config.is_in_debug_mode === true), 
                             licence_remain_days : 10 });
    }
});

module.exports = router;
