"use strict";
const mmtAdaptor = require('../libs/dataAdaptor');
const config     = require('../libs/config');
const ip2loc     = require('../libs/ip2loc');
const DataBase   = require("./DataBase.js");
const COL        = mmtAdaptor.LteTopoStatColumnId;


const ELEMENT_TYPE = {
    UE      : 1,
    ENODEB  : 2,
    MME     : 3,
    GATEWAY : 4
};

const EVENT_TYPE = {
    ADD_ELEMENT: 1,
    ADD_LINK   : 2,
    RM_LINK    : 3,
    RM_ELEMENT : 4,
};



/**
 * topo: {
 *    timestamp:
 *    nodes: {
 *       id of element : data
 *    },
 *    links: [
 *       { "source": id of source, "targe"t: id of target }
 *    ]
 * }
 */

const lteTopology = {
      timestamp : 0,
      nodes: {},
      links: []
};

function _addElement( msg ){
   const id = msg[ COL.ELEMENT_ID ];
   
   const element = lteTopology.nodes[id];
   const data = {};
   
   data.timestamp = msg[ COL.TIMESTAMP ];
   data.source    = msg[ COL.SOURCE_ID ];
   data.probe     = msg[ COL.PROBE_ID ];
   
   data.id = msg[ COL.ELEMENT_ID ];
   data.ip = msg[ COL.IP ];
   
   switch( msg[ COL.ELEMENT_TYPE ] ){
   case ELEMENT_TYPE.UE:
      data.imsi   = msg[ COL.UE_IMSI ];
      data.m_tmsi = msg[ COL.UE_M_TMSI ];
      data.type   = "ue";
      break;
   case ELEMENT_TYPE.ENODEB:
      data.name = msg[ COL.NAME ];
      data.type   = "enodeb";
      break;
   case ELEMENT_TYPE.MME:
      data.name = msg[ COL.NAME ];
      data.type   = "mme";
      break;
   case ELEMENT_TYPE.GATEWAY:
      data.type   = "gw";
      break;
   }
   
   
   if( element === undefined ){
      lteTopology.nodes[id] = data;
      return;
   }
   
   //update value
   for( const att in data ){
      if( data[att] == 0 || data[att] == "" )
         continue;
      element[att] = data[att];
   }
}

/**
 * Add a link between src and target
 */
function _addLink( idSrc, idDst ){
   //check if src and dst nodes are existing
   if( lteTopology.nodes[ idSrc ] == undefined || lteTopology.nodes[ idDst ] == undefined )
      return;
   
   //check if link is existing
   if( lteTopology.links.some( function(el){ return el.source === idSrc && el.target == idDst; }))
      return;
   
   //add link
   lteTopology.links.push({source: idSrc, target: idDst});
}

/**
 * Remove all links associated with an element having the given id
 */
function _rmLinks( id ){
   const links = lteTopology.links;
   for( let i=links.length-1; i>=0; i-- ){
      const link = links[i];
      if( link.source === id || link.target === id )
         //remove this link from array of links
         links.splice(i, 1);
   }
}

/**
 * Remove the element having the given id from lteTopology
 */
function _rmElement( id ){
   if( lteTopology.nodes[id] == undefined ){
      console.warn( "Not found any LTE entity having id = " + id );
      return;
   }
   
   //node is existing
   //1. delete the node
   delete lteTopology.nodes[ id ];
   //2. delete all links have
   _rmLinks( id );
}
/**
 * Process LTE topology report from MMT-Probe
 * 
 */
function processMessage( msg ){
   const ts = msg[ COL.TIMESTAMP ];
   
   //do not process older reports or the ones that do not concernt
   if( ts < lteTopology.timestamp || msg[ COL.FORMAT_ID ] !== mmtAdaptor.CsvFormat.LTE_TOPOLOGY_REPORT )
      return;
   
   lteTopology.timestamp = ts;
   
   switch( msg[ COL.EVENT ] ){
   case EVENT_TYPE.ADD_ELEMENT:
      _addElement( msg );
      break;
   case EVENT_TYPE.ADD_LINK:
      _addLink( msg[ COL.ELEMENT_ID ], msg[ COL.PARENT_ID + 1 ]);
      break;
   case EVENT_TYPE.RM_LINK:
      _rmLinks( msg[ COL.ELEMENT_ID ] );
      break;
   case EVENT_TYPE.RM_ELEMENT:
      _rmElement( msg[ COL.ELEMENT_ID ] );
      break;
   }
   console.log( JSON.stringify( lteTopology ));
}


module.exports = {
      processMessage : processMessage,
      getTopology    : function(){ return lteTopology; }
};
