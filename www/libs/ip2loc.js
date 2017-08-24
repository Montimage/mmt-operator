const _global     = require("./global");
const ipLib       = require("ip");
const path        = require("path");
const maxmind     = require('maxmind');
const config      = require('./config');
const HashTable   = require("./HashTable");

const ipToCountry = maxmind.open(path.join( __dirname, "..", "data", "GeoLite2-Country.mmdb"), {
   cache: {
      max: 10000, // max items in cache
      maxAge: 1000 * 60 * 60 // life time in milliseconds
   }
});


const LOCAL  = "_local", UNKNOWN = "_unknown";

//global variable
const _caches = _global("ip2loc", {
         localIPs    : new HashTable(),//cache of IP being verified
         localRanges : [],       //Ranges of local IPs given by config.json
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
   if( ip == undefined || ip === "undefined" || ip === "null")
      return false;

   const isLocal = _caches.localIPs.get( ip );
   //this IP was verified
   if( isLocal != undefined )
      return ( isLocal );

   //chech on local ranges given by config.json
   for( var i in _caches.localRanges ){
      var lo = _caches.localRanges[ i ];
      if( ipLib.mask( ip, lo.mask ) == lo.root ){
         _caches.localIPs[ ip ] = true;
         return true;
      }
   }

   //=> not found in local range
   _caches.localIPs[ ip ] = false;
   return false;
}

/**
 * Get location of an IP string
 */
ip2loc.country = function( ip ){
   if( ip2loc.isLocal( ip )
         //multicast
         || ip == "239.255.255.250" || ip.indexOf("224.0.0") == 0)
      return LOCAL
      
   var loc = ipToCountry.get( ip );
   if( loc == undefined )
      return UNKNOWN;

   if ( loc.country )
      loc = loc.country;
   else if (loc.contient)
      loc = loc.continent;
   else if (loc.registered_country)
      loc = loc.registered_country;

   if (loc && loc.names ){
      return  loc['names']['en'];
   }else{
      return UNKNOWN;
   }
}


module.exports = ip2loc;