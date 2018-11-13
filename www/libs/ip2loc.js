const _global     = require("./global");
const ipLib       = require("ip");
const path        = require("path");
const maxmind     = require('maxmind');
const config      = require('./config');
const HashTable   = require("./HashTable");

const ipToCountry = maxmind.open(path.join( __dirname, "..", "data", "GeoLite2-Country.mmdb"));


//global variable
const _caches = _global.get("ip2loc", {
         localIPs    : new HashTable( 500000 ),//cache of IP being verified
         localRanges : [],       //Ranges of local IPs given by config.json
         countryByIP : new HashTable( 500000 )
   });

for( var i in config.local_network ){
   var lo   = config.local_network[i];
   var root = ipLib.mask(lo.ip, lo.mask);

   _caches.localRanges.push(  {root: root, mask: lo.mask } );
}


const ip2loc = {};
/**
 * Verify whether an IP is local.
 * This depends on "local_network" of config.json
 * @input: IP is given by a number
 * @return: true if the ip is local
 *          false, otherwise
 */
ip2loc.isLocal = function( ip ){
   if( ip === "undefined" || ip === "null")
      return true;

   const isLocal = _caches.localIPs.get( ip );
   //this IP was verified
   if( isLocal != undefined )
      return ( isLocal );

   //chech on local ranges given by config.json
   for( var i in _caches.localRanges ){
      var lo = _caches.localRanges[ i ];
      if( ipLib.mask( ip, lo.mask ) == lo.root ){
         _caches.localIPs.add( ip,  true );
         return true;
      }
   }

   //=> not found in local range
   _caches.localIPs.add( ip,  false );
   return false;
}

/**
 * Verify whether an IP is in a private network
 */
ip2loc.isPrivate = function( i ){
   /* IPv6
    * fd00::/8
    */
   if( i[0] == 'f' && i[1] == 'd' && i[2] == '0' && i[3] == '0' )
      return true;
   
   const arr = i.split('.');
   if( arr.length == 4 ){
      /* IPv4
       * + 10.0.0.0    - 10.255.255.255
       * + 172.16.0.0  - 172.31.255.255
       * + 192.168.0.0 - 192.168.255.255
       */
      arr[0] = parseInt( arr[0] );
      switch( arr[0] ){
      case 10:
         return true;
      case 172:
         arr[1] = parseInt( arr[1] );
         return ( 16 <= arr[1] && arr[1] <= 31 );
      case 192:
         return ( arr[1] == "168" );
      }
   }
   return false;
}

ip2loc.isMulticast = function( i ){
   //IPv6
   /*
ff00::/16
ff0f::/16   Reserved
ffx1::/16   127.0.0.0/8 Interface-local   Packets with this destination address may not be sent over any network link, but must remain within the current node; this is the multicast equivalent of the unicast loopback address.
ffx2::/16   224.0.0.0/24   Link-local  Packets with this destination address may not be routed anywhere.
ffx3::/16   239.255.0.0/16 IPv4 local scope
ffx4::/16      Admin-local The smallest scope that must be administratively configured.
ffx5::/16      Site-local  Restricted to the local physical network.
ffx8::/16   239.192.0.0/14 Organization-local   Restricted to networks used by the organization administering the local network. (For example, these addresses might be used over VPNs; when packets for this group are routed over the public internet (where these addresses are not valid), they would have to be encapsulated in some other protocol.)
ffxe::/16   224.0.1.0-238.255.255.255  Global scope   Eligible to be routed over the public internet.
    */
   if( i[0] == 'f' && i[1] == 'f' ){
      if( i[2] == '0' ) //see "Well-known IPv6 multicast addresses" at https://en.wikipedia.org/wiki/Multicast_address
         return true;
      switch( i[3] ){
      case '0':
      case 'f':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '8':
      case 'e':
         return true;
      }
   }
   
   const arr = i.split('.');
   //IPv4
   if( arr.length == 4 ){
/* https://en.wikipedia.org/wiki/Multicast_address
      IP multicast address range      Description             Routable
      224.0.0.0   to 224.0.0.255      Local subnetwork           No
      224.0.1.0   to 224.0.1.255      Internetwork control       Yes
      224.0.2.0   to 224.0.255.255    AD-HOC block 1             Yes
      224.3.0.0   to 224.4.255.255    AD-HOC block 2             Yes
      232.0.0.0   to 232.255.255.255  Source-specific multicast  Yes
      233.0.0.0   to 233.255.255.255  GLOP addressing            Yes
      233.252.0.0 to 233.255.255.255  AD-HOC block 3             Yes
      234.0.0.0   to 234.255.255.255  Unicast-prefix-based       Yes
      239.0.0.0   to 239.255.255.255  Administratively scoped    Yes
*/
      if( arr[0] == 224 ){
         if( arr[1] == 0 && (arr[2] == 0 || arr[2] == 1 || arr[2] == 2))
            return true;
         if( arr[1] == 3 )
            return true;
      }else if( arr[0] == 232 || arr[0] == 233 || arr[0] == 234 || arr[0] == 239)
         return true;
   }
  
   return false;
}

/**
 * Get location of an IP string
 */
ip2loc.country = function( ip ){
   var country = _caches.countryByIP.get( ip );
   //not found in cache
   if( country == undefined ){
      country = ip2loc._country( ip );
      _caches.countryByIP.add( ip, country );
   }
   return country;
}

ip2loc._country = function( ip ){
   if( ip2loc.isLocal( ip ) )
      return "_local"
   if( ip2loc.isPrivate( ip ) )
      return "_private";
   if( ip2loc.isMulticast( ip ) )
      return "_multicast";
   
   var loc = ipToCountry.get( ip );
   if( loc == undefined )
      return "_unknown";

   if ( loc.country )
      loc = loc.country;
   else if (loc.contient)
      loc = loc.continent;
   else if (loc.registered_country)
      loc = loc.registered_country;

   if (loc && loc.names )
      return  loc['names']['en'];
   
   return "_unknown";
}


module.exports = ip2loc;