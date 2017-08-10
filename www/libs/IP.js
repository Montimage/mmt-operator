
function IP(){
	const self = this;
	/**
	 * convert an IP in plein text format to a number of 4bytes
	 * - input: "192.168.0.4"
	 * - return:  
	 */
	this.string2NumberV4 = function( ipString ){
		const arr = ipString.split(".");
		var length = arr.length;
		if( length !== 4 ){
			return 0;
		}
		var ret = 0;
		for( var i=0; i<length; i++ ){
			var val = Number.parseInt( arr[i] );
			val =  (val << ((length - i - 1)*8) );
			val = val >>> 0; //convert to unsigned 32 bit
			ret |= val;
		}
		return ret >>> 0;
		
		//return arr[0] * 16777216 + arr[1] * 65536  + arr[2] * 256 + arr[3];
	}
	
	this.number2StringV4 = function( ipNumber ){
		var arr = [0,0,0,0];
		//get 32 bits
		ipNumber &= 0xFFFFFFFF;
		
		arr[0] = (ipNumber >>> 24 );
		arr[1] = (ipNumber >>> 16 ) && 0xFF;
		arr[2] = (ipNumber >>> 8  ) && 0xFF;;
		arr[3] = (ipNumber >>> 0  ) && 0xFF;
		
		return arr.join(".");
	}
}

module.exports = IP;

//console.log( (new IP()).string2NumberV4("192.168.0.1") );