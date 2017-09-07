/**
 * A hash table with size limited by number of elements
 */

module.exports = function( size ){
   if( size == undefined )
      size = 100000;
   this.size   = size;
   var _data   = {}; //this is hashtable: key=>value
   var _arrKey = []; //this is array of key
   /**
    * Add an element (key, data) to the hashtable
    */
   this.add = function( key, data ){
      if( _data[ key ] != undefined )
         return false;

      _data[ key ] = data;
      _arrKey.push( key );

      //if number of keys is bigger than size
      if( _arrKey.length > size ){
         //delete the oldest element
         delete( _data[ _arrKey[0] ] );
         //remove the first element (having index = 0)
         _arrKey.shift();
      }
   }

   /**
    * Empty the hash table
    */
   this.empty = function(){
      _data   = {};
      _arrKey = [];
   }

   //counte the number of element in the hash table 
   this.count = function(){
      return _arrKey.length;
   }

   /**
    * get data of element from the hashtable by giving its key
    */
   this.get = function( key ){
      return _data[ key ];
   }

   /**
    * Remove an element from the hashtable
    */
   this.remove = function( key ){
      if( _data[ key ] == undefined )
         return false;

      //delete this field
      delete( _data[key] );

      //delete the key from _arrKey
      const index = _arrKey.indexOf( key );
      if( index == -1 ){
         console.error("Internal Error");
         return false;
      }

      //remove the element from array
      _arrKey.splice(index, 1);


      return true;
   }
};