/**
 * This route is used to communicate with MUSA Dashboard
 */

const CONST   = require("../../libs/constant.js");
const jwt     = require("jsonwebtoken");
const express = require('express');
const router  = express.Router();


//key to verify user token
const JWT_SIGNATURE_SECRET   = "g78UyD-CAHSLGI50YyPo4zGiYZYo-bbGUO_DE2T6YTGqgh_WMb9WQeRc5v0jkgAz";
const HEADER_FIELD_ID        = "authorization"; //when authorization is passed via HTTP request header
const QUERY_ID               = "sso";           //when authorization is passed via query string
const COOKIE_ID              = "authorization"; //save authorization on cookie


function _decodeUserInformation( req, res, next ){
   //always pass
   //return true;
   
   //login from php web portal
   if( req.query.key == 5745846892177){
      req.session.loggedin = {
            username: "portal"
      };
   }
   
   //already logged in
   if( req.session.loggedin != undefined ){
      //create a new token when user login using user/pass form
      if( req.session.loggedin.token == undefined )
         req.session.loggedin.token = jwt.sign({
            source  : "loginFromSecAP",
            username: req.session.loggedin.username
         }, JWT_SIGNATURE_SECRET);
      
      return true;
   }
      
   var token   = req.headers[ HEADER_FIELD_ID ];
   if( token == undefined ){
      //give one more chane
      var token = req.query[ QUERY_ID ];
      if( token == undefined )
         return false;
   }
   try{
      //const decoded = jwt.verify( token, JWT_SIGNATURE_SECRET );
      var decoded = jwt.decode(token, {complete: true});
      if( decoded ){
         req.session.loggedin = {
               token  : token,
               payload: decoded
         }
         console.log( decoded );
         return true;
      }
      
   }catch( e ){
      console.error( e );
   }
   return false;
}

//invoked for any requests passed to this router
router.use( function(req, res, next){
   //console.log("Check permission");
   
   _decodeUserInformation( req, res, next );
   
   //save login token if user logged in
   if( req.session.loggedin ){
      var token = "";
      if( req.session.loggedin.token )
         token = req.session.loggedin.token;
      
      res.cookie( COOKIE_ID, token  )
   }
   
   //call other routers
   next();
});

/**
 * Get status of a component
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.get("/status", function(req, res, next){
   
   if( req.session.loggedin == undefined ){
      //cannot verify the authorization or it does not exist
      //end by AccessDenied when being requested by ajax
      const isAjaxRequest = req.xhr;
      if( isAjaxRequest )
         return res.status( CONST.http.ACCESS_DEINED_CODE ).end("Access Denied");
      //redirect user to login page
      return res.redirect("/login");
   }
   
   const appID = req.query["appId"];
   var   comID = req.query["componentId"];
   
   //both appId, and componentId are provided 
   if( appID != null && comID != null ){
      comID = parseInt( comID );
      //get alert
      if( router.dbconnector == undefined )
         return res.status( CONST.http.INTERNAL_ERROR_CODE ).end( "Internal Server Error" );
      
      const $match = {};
      $match["1"] = appID;
      $match["2"] = comID;
      
      const TYPE="$4";
      const $group =  { "_id": {"1": "$1", "2": "$2"}, //group by app_id, comp_id and metric_id
            "alert"     : { "$sum"   : {$cond: { if: { $eq: [ TYPE, "alert" ] }    , then: 1, else: 0 }}}, 
            "violate"   : { "$sum"   : {$cond: { if: { $eq: [ TYPE, "violation" ] }, then: 1, else: 0 }} }
            };
      
      router.dbconnector._queryDB("metrics_alerts", "aggregate", [{$match: $match}, {$group: $group}], function( err, apps){
         if( err )
            return res.status( CONST.http.INTERNAL_ERROR_CODE ).end("Internal Server Error" );
         //allow a request commes from a different domain
         res.setHeader("Access-Control-Allow-Origin", "*");
         res.setHeader("Content-Type", "application/json");
         res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
         if( apps == undefined )
            return res.send( {
               status     : "error",
               appId      : appID,
               componentId: comID,
               description: "Not found"
            });
         
         //take the app
         return res.send({
               status     : "ok",
               appId      : appID,
               componentId: comID,
               alert      : ( apps.length == 0 ) ? 0 : apps[0].alert,
               violate    : ( apps.length == 0 ) ? 0 : apps[0].violate,
               underRemediation: ( apps.length == 0 ) ? 0 : apps[0].violate - 5,
         });
      }, false);
      return;
   }
   
   next();
});


router.get("/", function(req, res, next){
   const appID = req.query["appId"];
   const comID = req.query["componentId"];
   
   //both appId, and componentId are provided 
   if( appID != null && comID != null && comID != "" ){
      return res.redirect("/chart/sla?app_id=" + appID + "&probe_id="+ comID );
   }
   
   if( appID != null ){
      return res.redirect("/chart/sla?app_id=" + appID );
   }
   
   next();
});


module.exports = router;