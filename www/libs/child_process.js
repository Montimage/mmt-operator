const child_process   = require("child_process");
const fs              = require('fs');


function childProcess( file, params, env, autoRestart ){
   const self = {};
   
   if( autoRestart == undefined )
      autoRestart = 0;
   
   self.file   = file;
   self.params = params;
   self.env    = env;
   self.autoRestart = autoRestart;
   self.childProcess = null;
   
   //callbacks are called when exit or restart
   self.onExit = null;
   self.onRestart = null;
   
   if( !Array.isArray(self.params))
      self.params = [];

   //forward customized parameters of the current process
   process.argv.forEach(function ( param ) {
      //the parameter must start by -X
      if( param.indexOf('-X') !== 0 && param.indexOf("--config") !== 0 )
         return;
      self.params.push( param );
   });

   self.start = function(){
      self.childProcess = child_process.fork( self.file, self.params, self.env );
      self.childProcess.on("exit", self.restart );

      
      self.send = function(){
         self.childProcess.send.apply( self.childProcess, arguments );
      };
      
      //a communication channel between parent 'process' and the child 'childProcess'
      //when the parent receives a message  from its children
      // a message must be structured:
      // {
      //    type       : "socketio",
      //    action     : "emit",
      //    arguments  : [ firstArgs, secondArgs, ... ]
      //}
      self.childProcess.on("message", function( msg ){
         console.log( msg );
         var cb = null;
         switch( msg.type ){
         case "socketio":
            if( global._mmt && global._mmt.socketio  ){
               if( msg.action ) {
                  cb = global._mmt.socketio.sockets[ msg.action ];
                  if( typeof( cb ) == "function" )
                     cb.apply( global._mmt.socketio.sockets, msg.arguments );
               }
                  
            }   
         }
      });
      
         
      return self;
   };
   
   self.restart = function(){
      //exec only one time left
      if( self.autoRestart === 1 ){
         if( typeof( self.onExit ) == "function" )
            self.onExit( self );
         return;
      }
      
      console.log("restart child process " + self.childProcess.pid );
      
      //reduce timelife
      if( self.autoRestart > 0 )
         self.autoRestart --;
      
      //callback if need
      if( typeof( self.onRestart ) == "function" )
         self.onRestart( self );
      
      //restart the process: start a new process
      return self.start();
   };
   

   self.kill = function(){
      if( self.childProcess == null )
         return;
      
      self.childProcess.kill( 'SIGKILL' );
      self.childProcess = null;
      return self;
   };
   
   self.stop = function(){
      if( self.childProcess == null )
         return;
      
      self.childProcess.kill( 'SIGINT' );
      self.childProcess = null;
      return self;
   };
   return self;
}

module.exports = childProcess;