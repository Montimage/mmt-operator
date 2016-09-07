function a( cb ){
  setTimeout( cb, 1000 );
}

for( var i=0; i<5; i++ )
  (function( i ){
    a( function(){
      console.log( i );
    }, i );
  })( i );
