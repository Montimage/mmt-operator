/**
 * Init a global object variable
 */

if( global._obj == undefined )
   global._obj = {};

module.exports = function( varName, defaultValue ){
   if( typeof defaultValue != "object" )
      throw new Error( "Default value must be an object" );
   
   if( global._obj[ varName ] == undefined )
      return global._obj[ varName ] = defaultValue;
   else
      return global._obj[ varName ];
}