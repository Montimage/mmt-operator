"use strict";
const mmtAdaptor = require('../libs/dataAdaptor');
const config     = require('../libs/config');
const ip2loc     = require('../libs/ip2loc');
const DataBase   = require("./DataBase.js");
const COL        = mmtAdaptor.StatsColumnId;

function assignIfNotEmpty( o, att, val ){
   //default empty values of event-based report fields
   if( val == "" || val == 0 )
      return;
   o[att] = val;
}
/**
 * topo: {
 *    timestamp:
 *    nodes: {
 *       ip : {type: enodeb|mme|ue|gw, name: xxx}
 *    },
 *    links: {
 *       ip : ip
 *    }
 * }
 */

const lteTopology = {
      timestamp : 0,
      nodes: {},
      links: {}
}

//Column Id of lte-s1ap event-based reports
const LTE_S1AP = {
      FORMAT_ID     : 0, /**< Index of the format id column */
      PROBE_ID      : 1, /**< Index of the probe id column */
      SOURCE_ID     : 2, /**< Index of the data source id column */
      TIMESTAMP     : 3, /**< Index of the format id column */
      REPORT_NAME   : 4,
      PROCEDURE_CODE: 5,
      ENB_UE_ID     : 6,
      MME_UE_ID     : 7,
      GTP_TEID      : 8,
      MME_NAME      : 9,
      MME_IP        : 10,
      ENB_NAME      : 11,
      ENB_IP        : 12,
      UE_IMSI       : 13,
      UE_IP         : 14
}


/*Procedure Code of S1AP*/
const S1AP_PROCEDURE_CODE = {
      InitialContextSetup    : 9,
      InitialUEMessage       : 12,
      S1Setup                : 17,
      UEContextReleaseRequest: 18,
      UEContextRelease       : 23,
}

/**
 * Process S1AP event-based report from MMT-Probe
 * @param msg
 * 
 */
function processMessage( msg ){
   const ts = msg[ LTE_S1AP.TIMESTAMP ];
   
   //do not process older reports
   if( ts < lteTopology.timestamp )
      return;
   
   lteTopology.timestamp = ts;
   
   switch( msg[ LTE_S1AP.REPORT_NAME ] ){
   case "lte-s1ap":
      break;
   case "lte-sctp":
      break;
   }
}


module.exports = {
      processMessage   : processMessage,
}