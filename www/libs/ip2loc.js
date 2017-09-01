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

ip2loc.isMulticast = function( ipString ){
   const arr = ipString.split('.');
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