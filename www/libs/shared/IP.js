/**
 * Convert an IPv4 to a 32bit number and vice versa
 * @created:
 * @author: Huu Nghia Nguyen 
 * 
 */

var ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
var ipv6Regex =
    /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;

function IP(){
	const self = this;
	/**
	 * convert an IP in plein text format to a number of 4bytes
	 * - input: "192.168.0.4"
	 * - return:  
	 */
	this.string2NumberV4 = function( ipString ){
	   var ipNumber = 0;
	   const arr = ipString.split('.');
	   //IPv4
   	   if( arr.length == 4 ){
      	   arr.forEach(function(octet) {
      	      ipNumber <<= 8;
      	      ipNumber += parseInt(octet);
      	   });
      	   return(ipNumber >>> 0); //convert to 32bit
	   }
   	   return ipString
	}
	
	/**
	 * convert a 32bit IP number to a string
	 */
	this.number2StringV4 = function( ipNumber ){
	   if( Number.isNaN( ipNumber ) )
	      return ipNumber;
	   else
	      return ((ipNumber >>> 24)      + '.' +
	           (ipNumber >> 16 & 255) + '.' +
	           (ipNumber >> 8 & 255)  + '.' +
	           (ipNumber & 255) );
	   
	}
	
	
	this.isV4Format = function(ip) {
	   return ipv4Regex.test(ip);
	 };

	 this.isV6Format = function(ip) {
	   return ipv6Regex.test(ip);
	 };
}


module.exports = IP;
//console.log( (new IP()).string2NumberV4("192.168.0.1") );