/**
 * Init a global object variable
 */

if( global._obj == undefined )
   global._obj = {};

module.exports = {
      get : function( name, defaultVal ){
         var val = global._obj[ name ];
         if( defaultVal != undefined && val == undefined )
            return global._obj[ name ] = defaultVal;
         return val;
      },
      set: function( name, val ){
         return global._obj[ name ] = val;
      },
      del: function( name ){
        delete( global._obj[ name ] ); 
      },
      has: function( name ){
         return 
      }
}