var express = require('express');
var router = express.Router();

router.get('/*', function(req, res, next) {
    
    if( req.session.loggedin == undefined ){
        res.redirect("/");
        return;
    }
    
	var id = req.params[0];
	if( !id )
		//id = 'link';
        id = 'network';
	id = id.toLowerCase();
	
	var pages = {
			'link': {
				title : "Link"
			},
			'network' : {
				title: "Network"
			},
			'application' : {
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
			}
	};
	
	var page = pages[ id ];
	if( !page){
		var err = new Error('Not Found');
		err.status = 404;
	}else
		res.render("chart", { title: page.title, page_id: id, pages: pages});
});

module.exports = router;
