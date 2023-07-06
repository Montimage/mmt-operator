/**
 *  
 */

"use strict";
const mmtAdaptor  = require('../libs/dataAdaptor');
const config      = require('../libs/config');
const ip2loc      = require('../libs/ip2loc');
const DataBase    = require("./DataBase.js");
const COL         = mmtAdaptor.StatsColumnId;
const s1apTopo    = require("./EnodebTopo");
const net         = require('net');
const iot         = require('./iotProcessMessage');
const global      = require('../libs/InterProcessCache');
//DONOT remove this block
//this is for sending data to web clients vi socketio
var caches = {};
function saveToDatabase( channel, msg ){
	if( caches[ channel ] === undefined )
		caches[ channel ] = [];
	//add msg to caches
	//caches will be verified each seconds and sent to client
	//caches[ channel ].push( msg );
}


function getDataProcessing( body ){
	try{
		if( body ){
			let fn    = new Function("m", "cache", "require", body );
			//let fn    = eval(`function(m, cache){ ${body} }`);
			let cache = {};
			console.log( "data_processing:", fn.toString() );
			return function( msg ){
				try{
					return fn.call(this, msg, cache, require);
				}catch( ex ){
					console.error( ex );
					return msg;
				}
			}
		}
		return null;
	} catch( e ){
		console.error( e );
	}
}

const forwardDataProcessingFn = getDataProcessing( config.modules_config.report_forward.data_processing );
const dataProcessingFn = getDataProcessing( config.modules_config.data_processing );



function _saveToDB( collectionName, dataArr ){
   inserterDB.set( collectionName, 0, dataArr );
}

setInterval( function(){
	for( const channel in caches ){
		const cache = caches[ channel ];
		//no data in this cache
		if( cache.length === 0 )
			continue;
		//avg
		if (channel === "qos" ){
			for( let j=1; j<cache.length; j++)
				for( let i=4; i<13;i++ )
					cache[0][i] += cache[j][i];

			for( let i=4; i<13;i++ )
				if( i !== 9 || i !== 10 )
					cache[0][i] /= cache.length;

			//router.socketio.emit( "qos", cache[0] );
		}else {
		   //broadcast a message to Web browsers using socketio
		   _saveToDB( "cache_" + channel, cache );
		}

		//reset this cache to zero
		caches[ channel ] = [];
	}
}, 1000);
//end caches


/**
 * Compare two versions strings
 * @param a
 * @param b
 * @returns 
 *   1 if a > b
 *  -1 if a < b
 *   0 if a = b
 */
function compareVersion(a, b)
{
    //treat non-numerical characters as lover version
    //replacing them with a negative number based on charcode of each character
    function fix(s)
    {
        return "." + (s.toLowerCase().charCodeAt(0) - 2147483647) + ".";
    }
    a = ("" + a).replace(/[^0-9\.]/g, fix).split('.');
    b = ("" + b).replace(/[^0-9\.]/g, fix).split('.');
    var c = Math.max(a.length, b.length);
    for (var i = 0; i < c; i++)
    {
        //convert to integer the most efficient way
        a[i] = ~~a[i];
        b[i] = ~~b[i];
        if (a[i] > b[i])
            return 1;
        else if (a[i] < b[i])
            return -1;
    }
    return 0;
}

const operatorVersion = require('../version.json');
function checkVersion( probeVersion ){
   //operatorVersion >= 1.6.12  <=> probeVersion >= 1.4.1
   const ov = (compareVersion(operatorVersion.VERSION_NUMBER, '1.6.12') >= 0 );
   const op = ( compareVersion( probeVersion, '1.4.1') >= 0); 
   //check ov <=> op
   if( (ov && !op) || (!ov && op )){
      console.error('This MMT-Operator does not support MMT-Probe version ' + probeVersion );
      return false;
   }
   
   
   
   return true;
}


//forward reports to another server
function forwardReport(){
   const forwardCfg = config.modules_config.report_forward;
   const isEnableForwardingReport = ( forwardCfg != undefined) && (forwardCfg.enable == true);
   
   if( ! isEnableForwardingReport ){
      return {
         isEnable : function(){return false;},
         send     : function(){}
      };
   }
   
   if( ! Array.isArray(forwardCfg.report_types ) ){
      forwardCfg.report_types = [ forwardCfg.report_types ];
   }
  
   const forwardClient = new net.Socket();
   forwardClient.setKeepAlive( forwardCfg.keep_alive );
   forwardClient.on('error', (err) => console.error("report_forward", err ) );
   forwardClient.on('close', () => {
      forwardClient.isConnected  = false;
      forwardClient.isConnecting = false;
   });
   forwardClient.on('data', (data) => console.log("report_forward", data.toString() ));
   
   /**
    * Whether the forwarding is enabled
    */
   const isEnable = function( reportId ){
      if( isEnableForwardingReport && forwardCfg.report_types.includes( reportId ) )
         return true;
      return false;
   };
   
   
   /**
    * Convert data to the format defined by user
    */
   const buildData = function( msg ){
      if( forwardDataProcessingFn ){
        msg = forwardDataProcessingFn( msg );
        if( ! msg )
          return;
      }
      if( typeof(msg) === 'object')
         msg = JSON.stringify( msg );
      const msgLen = msg.length;
      
      let data = forwardCfg.data_format;
      if( data === undefined )
         data = msg;
      else
         data = data.replace('{REPORT-LEN}', msgLen).replace('{REPORT}', msg );
      
      return data;
   }
   
   //a buffer of msg when sendReport is called but we have not yet connected to the server
   let reportBuffer = [];
   const sendReport = function ( msg ){
      
      /*
       * forwardClient.isConnecting
       *  - If true, socket.connect() was called and has not yet finished. 
       *    It will stay true until the socket becomes connected, 
       *    then it is set to false and the 'connect' event is emitted.
       * 
       * forwardClient.isConnected
       *  - is true if the socket is not connected yet, 
       *  either because .connect() has not yet been called 
       *  or because it is still in the process of connecting
      */
      if( ! forwardClient.isConnected ){
         reportBuffer.push( msg );
         console.log("report_forward: buffer length: ", reportBuffer.length );
         
         if( !forwardClient.isConnecting ){
            forwardClient.isConnecting = true;
            
            forwardClient.connect( forwardCfg.server.port , forwardCfg.server.host, function() {
               forwardClient.isConnected  = true;
               forwardClient.isConnecting = false;
               
               reportBuffer.push( msg );
               
               forwardClient.write( buildData( reportBuffer ) );
               
               reportBuffer = []; //clean buffer
            });
         }
      } else {
         forwardClient.write( buildData([msg]) );
      }
   };
   
   return {
      isEnable : isEnable,
      send     : sendReport
   };
}

/////
function ProcessMessageSancus( database ){


}
function ProcessMessage( database ){
	const self       = this;
	const _database  = database;
	let isCompatibleVersion = {};
	const reportForwarding = forwardReport();
	
	/**
	 * Process a message report generated by MMT-Probe:
	 * 	- insert the message to DB
	 *  - send it directly to Web client if need
	 * @param message
	 * @returns
	 */
	self.process = function( message ) {
	   
	   
		console.log( "Process Message "+message );
		//message = message.replace(/\(null\)/g, 'null');
		debugger;
		
		var msg;
		//report is a JSON array ???
		if( message.charAt(0) == '[' ){
		} else //report is a CSV line
		   message = '[' + message + ']';
		   if(  parseInt(message[0]) == 0 ){//checks if the first character is an integer

		   }
	//_database.add(msg, function (err, err_msg) {});
	//console.log( "Process Message : Inserted in db" );
      msg = mmtAdaptor.formatMessage( message );
      if( dataProcessingFn )
        msg = dataProcessingFn( msg );

		if( msg === null )
			return;
		
		const probeId  = msg[1];
     		const reportId = msg[0];
      
		//For each kind of message
		switch( reportId ){
	   case mmtAdaptor.CsvFormat.SESSION_STATS_FORMAT:
	      const dataVolume = msg[ COL.DATA_VOLUME ];
	      if( dataVolume > 1e9 ){
	         console.error('impossible', msg );
	         return;
	      }
		//inspire5G-plus project: do not process BITTORRENT (id=52) when filter is activated in route/auto/inspire/closed-loop.js
	      if( msg[COL.APP_ID] == 52 )
		return global.get("inspire-closed-loop", function(val){
			if( val )
				return console.info("Ignore BITTORENT in Inspire5G+: " + JSON.stringify( msg));
			else
				_database.add(msg, function (err, err_msg) {});
		});
	      break;
		/*
        case mmtAdaptor.CsvFormat.NO_SESSION_STATS_FORMAT:
            if( config.only_ip_session === true ){
                //console.log( message );
                return;
            }
            break;
		 */
			//does not use these kind of reports
			/*
		case mmtAdaptor.CsvFormat.DEFAULT_APP_FORMAT:
		case mmtAdaptor.CsvFormat.WEB_APP_FORMAT:
		case mmtAdaptor.CsvFormat.SSL_APP_FORMAT:
			return;
			 */

			//behaviour: changing bandwidth
//		case mmtAdaptor.CsvFormat.BA_BANDWIDTH_FORMAT:
//			break;
//		case mmtAdaptor.CsvFormat.BA_PROFILE_FORMAT:
//			break;

			//license information
//		case mmtAdaptor.CsvFormat.LICENSE:
//			//if( typeof databaseadmin )
//			//	databaseadmin.insertLicense( mmtAdaptor.formatReportItem( msg ));
//			break;
		//report is sent only once when starting up	
		case mmtAdaptor.CsvFormat.STARTUP_REPORT:
		   //msg = [1,3,"a.pcap",1561454264.093644,"1.4.1 (da0638f - Jun 21 2019 11:59:18)","1.6.14.2 (2a482da)"]
		   //check if version of mmt-probe is satisfied
		   let probeVersion = msg[4]; //1.4.1 (da0638f - Jun 21 2019 11:59:18)
		   probeVersion = probeVersion.split(' ')[0]; //1.4.1
		   
		   console.log("Checking mmt-probe " + probeVersion + " having id=" + probeId);
		   isCompatibleVersion[ probeId ] = checkVersion( probeVersion );
		   
		   
		   //we need to reset enodeb topology
		   if( isCompatibleVersion[ probeId ] )
		       s1apTopo.resetTopology( msg );
		   
		   break;

		case mmtAdaptor.CsvFormat.LTE_TOPOLOGY_REPORT:
		   s1apTopo.processMessage( msg );
		   break;
		   
			//Video QoS
		case mmtAdaptor.CsvFormat.OTT_QOS:
			//send_to_client( "qos", msg );
			break;
			//Security alerts
		case mmtAdaptor.CsvFormat.SECURITY_FORMAT:
			//send_to_client( "security", msg );
			break;
			//availability
		//case 50:
		//   console.info( msg );
		case mmtAdaptor.CsvFormat.EVENT_BASE_FORMAT:
			if( msg[mmtAdaptor.IoTColumnId.EVENT_NAME] === "iot" )
					msg = iot.processMessage( msg );
		}

		//TODO: to be remove, this chages probe ID, only for Thales demo
		//msg[1] = "Sodium";

		//to test mult-probe
		//msg[1] = Math.random() > 0.5 ? 1 : 0;

		if( isCompatibleVersion[probeId] === false ){
         console.warn('This mmt-operator does not support data format of the mmt-probe ' + probeId + '. The message will be ignored.');
         return;
      }
		
		if( reportForwarding.isEnable( reportId ) )
		   reportForwarding.send( msg );
		
		   debugger;

		//_TODO: re-enable this
		_database.add(msg, function (err, err_msg) {});
		msg = null;
	};
}

module.exports = ProcessMessage;
