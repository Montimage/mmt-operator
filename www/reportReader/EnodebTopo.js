/**
 * This module will recontruct LTE topology and save it into DB.
 * Each topology is identified by PROBE_ID.
 * A topology is empty when Probe is starting.
 * It will be updated time by time when Operator receives LTE_TOPOLOGY_REPORT from Probe.
 */


"use strict";
const mmtAdaptor = require('../libs/dataAdaptor');
const COL        = mmtAdaptor.LteTopoStatColumnId;
const DBInserter = require("./DBInserter");
const inserterDB = new DBInserter();


let notifyTimer = null;
let needToClean = false; //whether a resetTopology was called 
                         //=> client browser needs to clean its current topology 
                         // as a new entity may have the same ID with one of the entities of the current topo
function notifyClientToRedrawTopology(){
   if( notifyTimer )
      clearTimeout( notifyTimer );
   
   notifyTimer = setTimeout(
         function(){
            process.send( {
               type     : "socketio",
               action   : "emit",
               arguments: ["reload-lte-topology", needToClean]
            });
            
            //once the notification has been delivered => reset this to default value
            needToClean = false;
         }, 1000);
}

function processMessage( msg ){
   notifyClientToRedrawTopology();
}


function resetTopology( msg ){
   needToClean = true;
   console.log( "Reset LTE-Topology" );
   
   inserterDB.clean( "lte_topology",  notifyClientToRedrawTopology );
}

module.exports = {
      processMessage  : processMessage,   //update topolog content
      resetTopology   : resetTopology,    //clear/init topology content
};
