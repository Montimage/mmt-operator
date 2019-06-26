const child_process   = require("child_process");
const fs              = require('fs');

/**
 * Create a child process
 * @param file to execute
 * @param params to give to the executed file
 * @param env environment variables
 * @param autoRestart number of times restarts the child process when it exits by error.
 *         1 => do not restart
 *         0  or undefined => restart each time it exits
 *         x restart x times
 * Note: a child process will not be restarted when it exits normally, by process.exit() or process.exit(0).
 * To be restarted, it must be exited by process.exit(x), with x != 0.
 * @returns
 */
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
   
   self.restart = function(code, signal){
      //console.trace();
      
      console.log("autoRestart: " + self.autoRestart + ", code: " + code );
      //exec only one time left
      // or if it exited successfully
      //=> do not need to restart it
      if( self.autoRestart === 1 || code === 0 || code === undefined){
         if( typeof( self.onExit ) == "function" )
            self.onExit( self );
         return self;
      }

      if( self.childProcess !== undefined )
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
         return self;
      
      self.childProcess.kill( 'SIGINT' );
      self.childProcess = null;
      return self;
   };
   return self;
}

module.exports = childProcess;