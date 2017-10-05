/**
 * @date Oct 4, 2017
 */

module.exports = function( size ){
   const buffer = Buffer.allocUnsafe( size + 1 );
   this.length  = 0;
   
   /**
    * Append a string
    */
   this.append = function( string ){
      const len = string.length;
      
      if( len + this.length > size )
         throw new Error("overflow: need " + (len+this.length) + " but have " + size );
      
      buffer.write( string, this.length, len, ENCODING );
      this.length += len;
      return this;
   }
   
   this.toString = function(){
      return buffer.toString( ENCODING, 0, this.length );
   }
   
   this.clear = function(){
      this.length = 0;
   }
}