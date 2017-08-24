
var express = require('express');
var router  = express.Router();
var path    = require("path");
var maxmind = require('maxmind');
var ipToCountry = maxmind.open(path.join( __dirname, "..", "data", "GeoLite2-Country.mmdb"), {
    cache: {
        max: 1000, // max items in cache
        maxAge: 1000 * 60 * 60 // life time in milliseconds
    }
});

router.get('/:ip', function(req, res, next) {
	var ip = req.params["ip"];
	res.setHeader("Content-Type", "application/json");
	if (ip) {
		res.send( ipToCountry.get(ip) );
	}else{
		res.send(undefined);
	}
});

module.exports = router;
