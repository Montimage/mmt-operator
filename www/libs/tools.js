var _tools = {
  getNodeVersion : process.version,
  /**
   * Verify if the current version of nodejs is greater than the given one
   * @param  {string} v version tobe compared, eg 4.3.0
   * @return {number}   1 if
   */
  isNodeVersionGreaterThan : function( v ){
    var currentVersion = process.version;

  },
  daysInMonth : function (month,year) {
    const NOW = (new Date());
    year  = year || NOW.getFullYear();
    month = month || NOW.getMonth();
    return new Date(year, month, 0).getDate();
  },
  /**
   * Recursively merge properties of two objects 
   */
  merge : function(obj1, obj2) {
	if( obj1 == undefined )
		obj1 = {};
	
    for (var p in obj2) {
      try {
        // Property in destination object set; update its value.
        if ( obj2[p].constructor==Object ) {
          obj1[p] = _tools.merge(obj1[p], obj2[p]);
        } else {
          obj1[p] = obj2[p];
        }

      } catch(e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];

      }
    }

    return obj1;
  },
  /**
   * Get current system time in milli seconds from 1970
   */
  getTimestamp : function(){
	  return (new Date()).getTime();
  },
  
  startMesureTime : function( key ){
	  this["___" + key ] =  (new Date()).getTime();
  },
  
  stopMesureTime : function( key ){
	  const val = this["___" + key ];
	  
	  delete( this["___" + key ] );
	  
	  const now = (new Date()).getTime();

	  if( val == undefined )
		  return 0;
	  
	  
	  return (now - val);
  },
  
  symetricEncodeIPs: function( a, b ){
	  var v1 = a, v2 = b;
	  if( b > a ){
		  v1 = b;
		  v2 = a;
	  }
	  
	  return v1 * 16777216 + v2;
  }
}

module.exports = _tools;
