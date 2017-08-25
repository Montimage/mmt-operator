/**
 * A hash table with size limited by number of elements
 */

module.exports = function( size ){
  this.size  = size;
  var _count = 0;
  var _data  = {};
  
  this.count = function(){
     return _count;
  };
  
  /**
   * 
   */
  this.add = function( key, data ){
     if( _data[ key ] != undefined )
        return false;
     _data[ key ] = data;
     _count ++;
     
     //if( _count > 100000 )
     //   console.log("Too big");
  }
  
  this.empty = function(){
     _data = {};
  }
  
  this.get = function( key ){
     return _data[ key ];
  }
  
  this.remove = function( key ){
     if( _data[ key ] == undefined )
        return false;
     
     //delete this field
     delete( _data[key] );
     
     return true;
  }
};