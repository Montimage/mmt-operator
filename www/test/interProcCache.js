const fork = require('child_process').fork;
const cache = require("../libs/InterProcessCache.js");

if( cache.isMaster() ){
   const child = fork( __filename, [], {
            //execArgv: ['--inspect-brk=9222']
   });
   console.log('fork ' + __filename );
   
   //client
   setInterval( function(){
      console.log( 'client: ', cache.get('hih') );
   }, 1000);
}
else{
   for( var i=0; i<10; i++ ){
      setTimeout( function(){
         cache.set('hih', new Date() );
      }, i*1000)
   }
}