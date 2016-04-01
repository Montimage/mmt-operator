var express = require('express');
var router  = express.Router();

router.get('/*', function(req, res, next) {
    
    if( req.session.loggedin == undefined ){
        res.redirect("/");
        return;
    }
    
	var id = req.params[0];
	if( !id ){
		res.redirect("/chart/link");
        return;
    }
	id = id.toLowerCase();
	
	var pages = {
			'link': {
				title : "Link"
			},
			'network' : {
				title: "Network"
			},
            'dpi':
            {
                title: "DPI"
            },
/*			'application' : {
				title: "Application"
			},
/*			'internet' : {
				title: "Internet"
			},
			'voip' : {
				title: "VoIP"
			},
			'video' : {
				title: "Video"
			},
*/            'security':{
                title:"Security"
            },
            'evasion':{
                title:"Evasion"
            },
            'behavior':{
                title:"Behavior"
            },
            'ndn':{
                title: "NDN"
            },
            'video':{
                title: "Video QoS"
            }
        
	};
	
	var page = pages[ id ];
	if( page == undefined ){
		var err = new Error('Not Found');
		err.status = 404;
        throw err;
	}else{
		res.render("chart", { title: page.title, page_id: id, pages: pages, 
                             probe_stats_period  : router.config.probe_stats_period, 
                             probe_analysis_mode : router.config.probe_analysis_mode,
                             is_in_debug_mode    : (router.config.is_in_debug_mode === true), 
                             licence_remain_days : 10 });
    }
});

module.exports = router;
