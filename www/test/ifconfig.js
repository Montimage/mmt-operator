var network = require('../libs/ifconfig');

network.interfaces(function(err, interfaces){
  console.log( err, interfaces );
});

network.configure("eth1",{
  ip: 'x.x.x.x',
  netmask:'x.x.x.x',
  broadcast: 'x.x.x.x',
  gateway: 'x.x.x.x',
  dns_servernames: '8.8.8.8'
}, console.log )
