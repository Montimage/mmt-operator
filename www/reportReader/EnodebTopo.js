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
   lastTimestamp = 0;
   console.log( "Reset LTE-Topology" );
   
   //init template for the topology
   notifyClientToRedrawTopology();
}

function maintainTopology( msg ){
   const data = {};
   
   //to maintain the compatibility with other collection
   [COL.TIMESTAMP].forEach( function( e ){
      data[ e ] = msg[ e ];
   });
   
   //init template for the topology
   inserterDB.set( COLLECTION, getID( msg ), data );
}

module.exports = {
      processMessage  : processMessage,   //update topolog content
      resetTopology   : resetTopology,    //clear/init topology content
      maintainTopology: maintainTopology, //update timestamp
};
