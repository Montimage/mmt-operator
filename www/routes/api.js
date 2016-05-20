var express = require('express');
var router  = express.Router();

function proc_request (req, res, next) {

  //check session loggedin
  /*
  if (req.session.loggedin == undefined) {
    res.status(403).send("Permision Denided");
    return;
  }
  */

  var collection = req.params.collection,
    action = req.params.action;

    var dbconnector = router.dbconnector;

    //get status
    if( collection == "status" ){
      dbconnector.getLastTime(function(err, time){
          if( err )
              return next(err);

          console.log("lastime: " + time + " " + (new Date(time)).toTimeString() );

          var inteval  = action;

          var time = {begin: time - inteval, end: time };

          //probe status: stat_time, stop_time
          dbconnector.probeStatus.get( time, function(err, arr){
            var obj = {
                time       : time,
                //attach list of applications detected by oprator (name of website)
                protocols  : dbconnector.appList.get(),
                data       : [],
                probeStatus: [],
            };
            if( !err )
                for( var i in arr )
                    obj.probeStatus.push( {
                        start      : arr[i].start,
                        last_update: arr[i].last_update
                    } );

            res.setHeader("Content-Type", "application/json");
            res.send( obj );
          });
      });
      return;
    }


    //query database
    var query = {};
    if( req.query.query )
      query = JSON.parse( req.query.query );
    else if( req.body )
      query = req.body;

    dbconnector.queryDB( collection, action,
      query, function(err, doc){
        //this allow a req coming from a different domain
  			//res.setHeader("Access-Control-Allow-Origin", "*");
  			res.setHeader("Content-Type", "application/json");
        res.send( {
            data : doc,
        } );
      }, req.query.raw );
}

router.get('/:collection/:action', proc_request);
router.post('/:collection/:action', proc_request);

module.exports = router;
