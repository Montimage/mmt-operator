/**
 * This route is used to communicate with MUSA Dashboard
 */
const express = require('express');
const router  = express.Router();

router.get("/", function(req, res, next){
   const appID = req.query["appId"];
   const comID = req.query["componentId"];
   
   //both appId, and componentId are provided 
   if( appID != null && comID != null ){
      return res.redirect("/chart/sla?app_id=" + appID + "&probe_id="+ comID );
   }
   else if( appID != null ){
      return res.redirect("/chart/sla?app_id=" + appID );
   }
   else next();
});

/**
 * Get status of a component
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.get("/status", function(req, res, next){
   const appID = req.query["appId"];
   const comID = Number.parseInt( req.query["componentId"] );
   
   //both appId, and componentId are provided 
   if( appID != null && comID != null ){
      //get alert
      if( router.dbconnector == undefined )
         return res.status(500).end( "Internal Server Error" );
      
      const $match = {};
      $match["1"] = appID;
      $match["2"] = comID;
      
      const TYPE="$4";
      const $group =  { "_id": {"1": "$1", "2": "$2"}, //group by app_id, comp_id and metric_id
            "alert"     : { "$sum"   : {$cond: { if: { $eq: [ TYPE, "alert" ] }    , then: 1, else: 0 }}}, 
            "violate"   : { "$sum"   : {$cond: { if: { $eq: [ TYPE, "violation" ] }, then: 1, else: 0 }} }
            };
      
      router.dbconnector._queryDB("metrics_alert", "aggregate", [{$match: $match}, {$group: $group}], function( err, apps){
         if( err )
            return res.status(500).end("Internal Server Error" );
         
         res.setHeader("Content-Type", "application/json");
         if( apps == undefined )
            return res.send( {
               status     : "error",
               appId      : appID,
               componentId: comID,
               description: "Not found"
            });
         
         //take the app
         return res.send({
               status     : "error",
               appId      : appID,
               componentId: comID,
               alert      : ( apps.length == 0 ) ? 0 : apps[0].alert,
               violate    : ( apps.length == 0 ) ? 0 : apps[0].violate
         })
      });
   }
   else next();
});
module.exports = router;