const express = require('express');
const router  = express.Router();
const tools   = require("../../libs/tools.js");
const config  = require("../../libs/config.js");

const ACTIONS = config.sla.actions;


function _publishMessage( channel, msgString ){
   if( channel == undefined )
      return;
   
   if( router.publisher == undefined ){
      if( router.pub_sub == undefined ){
         console.error("This works only for kafka/redis bus");
         process.exit( 1 );
      }
      //create a client to publish a message
      router.publisher = router.pub_sub.createClient();
   }
   
   router.publisher.publish( channel, msgString);
}

function _performAction( channel_name, action_name ){
   const arr = [];
   _publishMessage( channel_name, arr.join(",") );
}

function _performReaction( reaction, id ){
   console.log( "Perform reaction " + id );
   
   const actions = reaction.actions;
   for( var i=0; i<actions.length; i++ ){
      var act_name = actions[ i ];
      var action   = ACTIONS[ act_name ];
      if( action.channel_name == undefined )
         continue;
      
      _performAction( action.channel_name, act_name );
   }
}

/**
 * When use click on "Perform" or "Ignore" buttons of "Reactions" tab
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.all("/reaction/:type/:react_id", function(req, res, next) {
   //type is either "ignore" or "perform"
   const type = req.params.type,
   react_id   = req.params.react_id;
   const match = {};
   match["selectedReaction." + react_id]  = { "$ne" : null };
   
   const update = {};
   update["selectedReaction." + react_id + ".action"]        = type;
   update["selectedReaction." + react_id + ".action_time"]   = tools.getTimestamp();
   update["selectedReaction." + react_id + ".action_status"] = "start";
   
   router.dbconnector.mdb.collection("metrics").update( match, {$set: update}, function( err, data ){
            res.setHeader("Content-Type", "application/json");
            
            if( err )
               return res.send( {
                  type : type,
                  id   : react_id,
                  status: "error"
               } );
            
            res.send( {
               type : type,
               id   : react_id,
               status: "success"
            } );
         });
   
   
   //put a message on bus
   if( type == "perform" ){
      router.dbconnector._queryDB("metrics", "find", match, function( err, data ){
         if( err || data.length == 0 )
            return console.error( "Not found any reaction having id = " + react_id );

         _performReaction( data[0].selectedReaction[ react_id ], react_id );
         
      }, false)
   }
   
   
});

module.exports = router;
