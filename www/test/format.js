var mmtAdaptor = require('../libs/dataAdaptor');
var config = require("../config.json");
var msg = [100,0,"../test_files/exemple_pcap_60.pcap",1444301008.25941,153,"99.178.354.153",468,1190,974,4,591,483,2,599,491,2,1444301004.811700,"54.230.187.207","192.168.0.49","b8:ca:3a:da:57:48","00:10:18:de:ad:05",2891,80,51204,0,1,0]

//var msg = mmtAdaptor.setDirectionStatFlowByIP(msg);
//console.log( msg );


msg = [100,0,"../test_files/exemple_pcap_60.pcap",1444301008.25941,153,"99.178.354.153",468,1190,974,4,591,483,2,599,491,2,1444301004.811700,"192.168.0.49","54.230.187.207","b8:ca:3a:da:57:48","00:10:18:de:ad:05",2891,80,51204,0,1,0]

//msg = mmtAdaptor.setDirectionStatFlowByIP(msg);
//console.log( msg );

console.log( mmtAdaptor.isLocalIP( "239.255.255.250") );