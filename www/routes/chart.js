var express = require('express');
var router  = express.Router();
var config  = require("../config.json");

router.get('/*', function(req, res, next) {
    
    if( req.session.loggedin == undefined ){
        res.redirect("/");
        return;
    }
    
	var id = req.params[0];
	if( !id ){
		res.redirect("/chart/link");
        return;s
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
			'internet' : {
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
            }
        
	};
	
	var page = pages[ id ];
	if( !page){
		var err = new Error('Not Found');
		err.status = 404;
	}else{
		res.render("chart", { title: page.title, page_id: id, pages: pages, probe_stats_period: config.probe_stats_period, is_in_debug_mode: (config.is_in_debug_mode === true) });
    }
});

module.exports = router;
