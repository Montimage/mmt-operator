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
  
//check whenther object obj having an attribute's value that equals to val
  objectHasAttributeWithValue: function( obj, val ){
    for( var i in obj)
       if( obj[i] == val ) return i;
    return;
  },

  /**
   * Get value of an attribute of an object
   * Example: obj = {
   *  a : {
   *     b : 1
   *  }
   * }
   * => getValue( obj, "a" ) => {b:1}
   * => getValue( obj, "b" ) => null
   * => getValue( obj, ["a","b"] ) => 1
   * => getValue( obj, ["a","b","c"] ) => null
   * => getValue( obj, ["c","b"] ) => null
   */
  getValue: function( obj, attributeArr ){
    if( ! Array.isArray( attributeArr ) )
       return obj[ attributeArr ];
    
    for( var i=0; i<attributeArr.length; i++ ){
       var key = attributeArr[i];
       obj = obj[ key ];
       if( obj == undefined || typeof( obj ) != "object" )
          break;
    }
    if( i == attributeArr.length )
       return obj;
    return null;
  },
  
  cloneData : function( obj ){
    if( Array.isArray( obj ))
      return obj.slice( 0 );
    else if ( typeof(obj) === 'object' )
      return  JSON.parse(JSON.stringify(obj));
    return obj;
  },
  
  /**
   * Returns the first element that was inserted in the given Object
   */
  get1stElem : function(data) {
      for (var prop in data)
          if (data.propertyIsEnumerable(prop))
              return prop;
  },
}

module.exports = _tools;
